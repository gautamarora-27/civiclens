from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.department import Department
from backend.app.models.incident import Incident
from backend.app.models.work_order import WorkOrder


router = APIRouter(
    prefix="/map",
    tags=["Map"],
)


@router.get("/incidents")
def get_map_incidents(
    db: Session = Depends(get_db),
):
    stmt = (
        select(
            Incident,
            Department,
            WorkOrder,
        )
        .outerjoin(
            Department,
            Incident.department_id == Department.id,
        )
        .outerjoin(
            WorkOrder,
            WorkOrder.incident_id == Incident.id,
        )
        .order_by(Incident.id.desc())
    )

    rows = db.execute(stmt).all()

    now = datetime.now(timezone.utc)

    results = []

    for incident, department, work_order in rows:
        overdue = False

        if (
            work_order is not None
            and work_order.deadline is not None
            and work_order.status != "completed"
        ):
            overdue = work_order.deadline < now

        results.append(
            {
                "id": incident.id,
                "issue_type": incident.issue_type,
                "latitude": incident.latitude,
                "longitude": incident.longitude,
                "severity": incident.severity,
                "status": incident.status,
                "confirmation_count": incident.confirmation_count,
                "department": {
                    "id": department.id,
                    "name": department.name,
                    "code": department.code,
                }
                if department
                else None,
                "work_order": {
                    "id": work_order.id,
                    "priority": work_order.priority,
                    "status": work_order.status,
                    "assigned_to": work_order.assigned_to,
                    "deadline": work_order.deadline,
                    "overdue": overdue,
                }
                if work_order
                else None,
            }
        )

    return results