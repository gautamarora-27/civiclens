from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.services.incident_service import process_detection_into_incident

from backend.app.database.session import get_db
from backend.app.models.detection import Detection
from backend.app.models.vehicle import Vehicle
from backend.app.schemas.detection import (
    DetectionCreate,
    DetectionResponse,
)

router = APIRouter(
    prefix="/detections",
    tags=["Detections"],
)


@router.post(
    "",
    response_model=DetectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_detection(
    payload: DetectionCreate,
    db: Session = Depends(get_db),
):
    vehicle = db.get(Vehicle, payload.vehicle_id)

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    detection = Detection(
        vehicle_id=payload.vehicle_id,
        issue_type=payload.issue_type,
        confidence=payload.confidence,
        severity=payload.severity,
        latitude=payload.latitude,
        longitude=payload.longitude,
        image_url=payload.image_url,
        location=WKTElement(
            f"POINT({payload.longitude} {payload.latitude})",
            srid=4326,
        ),
    )

    db.add(detection)
    db.flush()

    process_detection_into_incident(
        db=db,
        detection=detection,
    )

    db.commit()
    db.refresh(detection)

    return detection


@router.get(
    "",
    response_model=list[DetectionResponse],
)
def get_detections(
    db: Session = Depends(get_db),
):
    detections = db.scalars(
        select(Detection).order_by(Detection.id.desc())
    ).all()

    return detections


@router.get(
    "/{detection_id}",
    response_model=DetectionResponse,
)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db),
):
    detection = db.get(Detection, detection_id)

    if detection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection not found",
        )

    return detection