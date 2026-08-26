from datetime import datetime, timezone

from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_DWithin
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from backend.app.models.detection import Detection
from backend.app.models.incident import Incident
from backend.app.services.department_service import get_department_for_issue

INCIDENT_MERGE_RADIUS_METERS = 20


def find_nearby_incident(
    db: Session,
    issue_type: str,
    latitude: float,
    longitude: float,
) -> Incident | None:

    point = WKTElement(
        f"POINT({longitude} {latitude})",
        srid=4326,
    )

    stmt = (
        select(Incident)
        .where(
            Incident.issue_type == issue_type,
            Incident.status != "resolved",
            ST_DWithin(
                Incident.location,
                point,
                INCIDENT_MERGE_RADIUS_METERS,
            ),
        )
        .order_by(Incident.last_detected_at.desc())
    )

    return db.scalar(stmt)


def create_incident(
    db: Session,
    issue_type: str,
    latitude: float,
    longitude: float,
    severity: float | None,
) -> Incident:

    point = WKTElement(
        f"POINT({longitude} {latitude})",
        srid=4326,
    )

    now = datetime.now(timezone.utc)
    
    department = get_department_for_issue(
        db=db,
        issue_type=issue_type,
    )

    incident = Incident(
        issue_type=issue_type,
        latitude=latitude,
        longitude=longitude,
        location=point,
        severity=severity or 0.0,
        priority_score=severity or 0.0,
        confirmation_count=0,
        status="detected",
        department_id=department.id if department else None,
        first_detected_at=now,
        last_detected_at=now,
    )

    db.add(incident)
    db.flush()

    return incident


def vehicle_already_confirmed(
    db: Session,
    incident_id: int,
    vehicle_id: int,
) -> bool:

    count = db.scalar(
        select(func.count(Detection.id)).where(
            Detection.incident_id == incident_id,
            Detection.vehicle_id == vehicle_id,
        )
    )

    return bool(count)


def process_detection_into_incident(
    db: Session,
    detection: Detection,
) -> Incident:

    incident = find_nearby_incident(
        db=db,
        issue_type=detection.issue_type,
        latitude=detection.latitude,
        longitude=detection.longitude,
    )

    if incident is None:
        incident = create_incident(
            db=db,
            issue_type=detection.issue_type,
            latitude=detection.latitude,
            longitude=detection.longitude,
            severity=detection.severity,
        )

    already_confirmed = vehicle_already_confirmed(
        db=db,
        incident_id=incident.id,
        vehicle_id=detection.vehicle_id,
    )

    detection.incident_id = incident.id

    if not already_confirmed:
        incident.confirmation_count += 1

    incident.last_detected_at = datetime.now(timezone.utc)

    if detection.severity is not None:
        incident.severity = max(
            incident.severity,
            detection.severity,
        )

    incident.priority_score = max(
        incident.priority_score,
        incident.severity,
    )

    return incident