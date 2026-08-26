from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DetectionCreate(BaseModel):
    vehicle_id: int

    issue_type: str = Field(min_length=1, max_length=50)

    confidence: float = Field(ge=0.0, le=1.0)

    severity: float | None = Field(
        default=None,
        ge=0.0,
        le=10.0
    )

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    image_url: str | None = Field(
        default=None,
        max_length=500
    )


class DetectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    issue_type: str
    confidence: float
    severity: float | None

    latitude: float
    longitude: float

    image_url: str | None
    detected_at: datetime