from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.vehicle import Vehicle
from backend.app.schemas.vehicle import (
    VehicleCreate,
    VehicleResponse,
    VehicleUpdate,
)

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"],
)


@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
):
    existing_vehicle = db.scalar(
        select(Vehicle).where(
            Vehicle.vehicle_id == payload.vehicle_id
        )
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vehicle ID already exists",
        )

    vehicle = Vehicle(
        vehicle_id=payload.vehicle_id,
        route_name=payload.route_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=payload.status,
        last_seen=datetime.now(timezone.utc),
    )

    if (
        payload.latitude is not None
        and payload.longitude is not None
    ):
        vehicle.location = WKTElement(
            f"POINT({payload.longitude} {payload.latitude})",
            srid=4326,
        )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return vehicle


@router.get(
    "",
    response_model=list[VehicleResponse],
)
def get_vehicles(
    db: Session = Depends(get_db),
):
    vehicles = db.scalars(
        select(Vehicle).order_by(Vehicle.id)
    ).all()

    return vehicles


@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
):
    vehicle = db.get(Vehicle, vehicle_id)

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    return vehicle


@router.patch(
    "/{vehicle_id}",
    response_model=VehicleResponse,
)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
):
    vehicle = db.get(Vehicle, vehicle_id)

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(vehicle, field, value)

    if (
        vehicle.latitude is not None
        and vehicle.longitude is not None
    ):
        vehicle.location = WKTElement(
            f"POINT({vehicle.longitude} {vehicle.latitude})",
            srid=4326,
        )

    vehicle.last_seen = datetime.now(timezone.utc)

    db.commit()
    db.refresh(vehicle)

    return vehicle