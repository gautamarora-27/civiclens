from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from backend.app.database.session import Base


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id"),
        nullable=False,
        index=True
    )
    incident_id: Mapped[int | None] = mapped_column(
        ForeignKey("incidents.id"),
        nullable=True,
        index=True,
    )

    issue_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    severity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    location: Mapped[object | None] = mapped_column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=True
    )