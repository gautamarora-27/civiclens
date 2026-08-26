from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.incident import Incident
from backend.app.schemas.incident import IncidentResponse
from backend.app.services.work_order_service import create_work_order_for_incident

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)


@router.get(
    "",
    response_model=list[IncidentResponse],
)
def get_incidents(db: Session = Depends(get_db)):
    """Return all incidents, newest first."""

    stmt = select(Incident).order_by(
        Incident.last_detected_at.desc()
    )

    incidents = db.scalars(stmt).all()

    return incidents


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    """Return one incident by ID."""

    incident = db.get(Incident, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident


@router.patch(
    "/{incident_id}/status",
    response_model=IncidentResponse,
)
def update_incident_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    allowed_transitions = {
        "detected": {"verified"},
        "verified": {"assigned"},
        "assigned": {"in_progress"},
        "in_progress": {"resolved"},
        "resolved": set(),
    }

    incident = db.get(Incident, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    current_status = incident.status

    if status not in allowed_transitions.get(current_status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: {current_status} -> {status}",
        )

    incident.status = status

    # Automatically create a work order once the incident is verified
    if status == "verified":
        create_work_order_for_incident(
            db=db,
            incident=incident,
        )

    db.commit()
    db.refresh(incident)

    return incident