from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.detection import Detection
from backend.app.models.incident import Incident
from backend.app.models.work_order import WorkOrder
from backend.app.models.department import Department
from datetime import datetime, timezone

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    total_detections = db.scalar(
        select(func.count(Detection.id))
    ) or 0

    total_incidents = db.scalar(
        select(func.count(Incident.id))
    ) or 0

    active_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.status != "resolved"
        )
    ) or 0

    resolved_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.status == "resolved"
        )
    ) or 0

    critical_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.severity >= 8,
            Incident.status != "resolved",
        )
    ) or 0

    open_work_orders = db.scalar(
        select(func.count(WorkOrder.id)).where(
            WorkOrder.status != "completed"
        )
    ) or 0

    return {
        "total_detections": total_detections,
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "resolved_incidents": resolved_incidents,
        "critical_incidents": critical_incidents,
        "open_work_orders": open_work_orders,
    }


@router.get("/incidents-by-type")
def incidents_by_type(
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(
            Incident.issue_type,
            func.count(Incident.id),
        )
        .group_by(Incident.issue_type)
        .order_by(func.count(Incident.id).desc())
    ).all()

    return [
        {
            "issue_type": issue_type,
            "count": count,
        }
        for issue_type, count in rows
    ]


@router.get("/department-workload")
def department_workload(
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(
            Department.id,
            Department.name,
            Department.code,
            func.count(WorkOrder.id),
        )
        .outerjoin(
            WorkOrder,
            WorkOrder.department_id == Department.id,
        )
        .group_by(
            Department.id,
            Department.name,
            Department.code,
        )
        .order_by(func.count(WorkOrder.id).desc())
    ).all()

    return [
        {
            "department_id": department_id,
            "department_name": name,
            "department_code": code,
            "work_order_count": count,
        }
        for department_id, name, code, count in rows
    ]
@router.get("/status-breakdown")
def status_breakdown(
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(
            Incident.status,
            func.count(Incident.id),
        )
        .group_by(Incident.status)
        .order_by(Incident.status)
    ).all()

    return [
        {
            "status": status,
            "count": count,
        }
        for status, count in rows
    ]
@router.get("/severity-breakdown")
def severity_breakdown(
    db: Session = Depends(get_db),
):
    low = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.severity < 4
        )
    ) or 0

    medium = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.severity >= 4,
            Incident.severity < 6,
        )
    ) or 0

    high = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.severity >= 6,
            Incident.severity < 8,
        )
    ) or 0

    critical = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.severity >= 8
        )
    ) or 0

    return [
        {"severity": "low", "count": low},
        {"severity": "medium", "count": medium},
        {"severity": "high", "count": high},
        {"severity": "critical", "count": critical},
    ]
@router.get("/recent-activity")
def recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    incidents = db.scalars(
        select(Incident)
        .order_by(Incident.last_detected_at.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": incident.id,
            "issue_type": incident.issue_type,
            "severity": incident.severity,
            "status": incident.status,
            "confirmation_count": incident.confirmation_count,
            "department_id": incident.department_id,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "first_detected_at": incident.first_detected_at,
            "last_detected_at": incident.last_detected_at,
        }
        for incident in incidents
    ]
@router.get("/overdue-work-orders")
def overdue_work_orders(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    work_orders = db.scalars(
        select(WorkOrder)
        .where(
            WorkOrder.deadline.is_not(None),
            WorkOrder.deadline < now,
            WorkOrder.status != "completed",
        )
        .order_by(WorkOrder.deadline.asc())
        .limit(limit)
    ).all()

    return [
        {
            "id": work_order.id,
            "incident_id": work_order.incident_id,
            "department_id": work_order.department_id,
            "priority": work_order.priority,
            "status": work_order.status,
            "assigned_to": work_order.assigned_to,
            "created_at": work_order.created_at,
            "deadline": work_order.deadline,
        }
        for work_order in work_orders
    ]