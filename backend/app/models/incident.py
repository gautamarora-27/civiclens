from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, Float, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from backend.app.database.session import Base


class Incident(Base):
    __tablename__ = "incidents"

    __table_args__ = (
        CheckConstraint(
            "latitude >= -90 AND latitude <= 90",
            name="ck_incidents_latitude_range",
        ),
        CheckConstraint(
            "longitude >= -180 AND longitude <= 180",
            name="ck_incidents_longitude_range",
        ),
        CheckConstraint(
            "severity >= 0 AND severity <= 10",
            name="ck_incidents_severity_range",
        ),
        CheckConstraint(
            "confirmation_count >= 0",
            name="ck_incidents_confirmation_count_nonnegative",
        ),
        CheckConstraint(
            "priority_score >= 0",
            name="ck_incidents_priority_score_nonnegative",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    issue_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id"),
        nullable=True,
        index=True,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    location: Mapped[object | None] = mapped_column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=True
    )

    severity: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    priority_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    confirmation_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="detected",
        nullable=False,
        index=True
    )

    first_detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    last_detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )