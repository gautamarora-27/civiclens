from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VehicleCreate(BaseModel):
    vehicle_id: str = Field(min_length=1, max_length=50)
    route_name: str | None = Field(default=None, max_length=100)

    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    status: str = Field(default="offline", max_length=30)


class VehicleUpdate(BaseModel):
    route_name: str | None = Field(default=None, max_length=100)

    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    status: str | None = Field(default=None, max_length=30)
    last_seen: datetime | None = None


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: str
    route_name: str | None
    latitude: float | None
    longitude: float | None
    status: str
    last_seen: datetime | None