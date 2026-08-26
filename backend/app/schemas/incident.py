from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    issue_type: str

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    severity: float
    priority_score: float

    confirmation_count: int

    status: str

    first_detected_at: datetime
    last_detected_at: datetime