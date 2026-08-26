from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.work_order import WorkOrder
from backend.app.models.incident import Incident

router = APIRouter(
    prefix="/work-orders",
    tags=["Work Orders"],
)


@router.get("")
def get_work_orders(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(WorkOrder).order_by(WorkOrder.id.desc())
    ).all()


@router.get("/{work_order_id}")
def get_work_order(
    work_order_id: int,
    db: Session = Depends(get_db),
):
    work_order = db.get(WorkOrder, work_order_id)

    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )

    return work_order


@router.patch("/{work_order_id}")
def update_work_order(
    work_order_id: int,
    assigned_to: str | None = None,
    status_value: str | None = None,
    db: Session = Depends(get_db),
):
    work_order = db.get(WorkOrder, work_order_id)

    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )

    allowed_statuses = {
        "created",
        "assigned",
        "in_progress",
        "completed",
    }

    if status_value is not None:
        status_value = status_value.strip()

        if status_value not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid work-order status: {status_value}",
            )

        work_order.status = status_value

    if assigned_to is not None:
        work_order.assigned_to = assigned_to.strip()

    incident = db.get(
        Incident,
        work_order.incident_id,
    )

    if incident is not None and status_value is not None:
        status_map = {
            "created": "verified",
            "assigned": "assigned",
            "in_progress": "in_progress",
            "completed": "resolved",
        }

        mapped_status = status_map.get(status_value)

        if mapped_status is not None:
            incident.status = mapped_status

    db.commit()
    db.refresh(work_order)

    return work_order