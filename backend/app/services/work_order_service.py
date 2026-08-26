from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.incident import Incident
from backend.app.models.work_order import WorkOrder


def calculate_priority(severity: float) -> str:
    if severity >= 8:
        return "critical"
    elif severity >= 6:
        return "high"
    elif severity >= 4:
        return "medium"
    else:
        return "low"


def calculate_deadline(priority: str):
    now = datetime.now(timezone.utc)

    deadlines = {
        "critical": timedelta(hours=6),
        "high": timedelta(hours=24),
        "medium": timedelta(days=3),
        "low": timedelta(days=7),
    }

    return now + deadlines[priority]


def create_work_order_for_incident(
    db: Session,
    incident: Incident,
) -> WorkOrder:

    # Prevent duplicate work orders
    existing = db.scalar(
        select(WorkOrder).where(
            WorkOrder.incident_id == incident.id
        )
    )

    if existing:
        return existing

    if incident.department_id is None:
        raise ValueError(
            "Incident has no department assigned"
        )

    priority = calculate_priority(incident.severity)

    work_order = WorkOrder(
        incident_id=incident.id,
        department_id=incident.department_id,
        priority=priority,
        status="created",
        deadline=calculate_deadline(priority),
    )

    db.add(work_order)
    db.flush()

    return work_order