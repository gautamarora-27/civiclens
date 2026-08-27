"""add database validation constraints

Revision ID: 0d27c679e89b
Revises: 343cfa7974b0
Create Date: 2026-08-27 12:46:51.356701

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "0d27c679e89b"
down_revision: Union[str, Sequence[str], None] = "343cfa7974b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add database-level validation constraints."""

    # Vehicles: coordinates are optional, but when present must be valid.
    op.create_check_constraint(
        "ck_vehicles_latitude_range",
        "vehicles",
        "latitude IS NULL OR (latitude >= -90 AND latitude <= 90)",
    )

    op.create_check_constraint(
        "ck_vehicles_longitude_range",
        "vehicles",
        "longitude IS NULL OR (longitude >= -180 AND longitude <= 180)",
    )

    # Detections: coordinates are required and must be valid.
    op.create_check_constraint(
        "ck_detections_latitude_range",
        "detections",
        "latitude >= -90 AND latitude <= 90",
    )

    op.create_check_constraint(
        "ck_detections_longitude_range",
        "detections",
        "longitude >= -180 AND longitude <= 180",
    )

    op.create_check_constraint(
        "ck_detections_confidence_range",
        "detections",
        "confidence >= 0 AND confidence <= 1",
    )

    op.create_check_constraint(
        "ck_detections_severity_range",
        "detections",
        "severity IS NULL OR (severity >= 0 AND severity <= 10)",
    )

    # Incidents: coordinates and severity must be valid.
    op.create_check_constraint(
        "ck_incidents_latitude_range",
        "incidents",
        "latitude >= -90 AND latitude <= 90",
    )

    op.create_check_constraint(
        "ck_incidents_longitude_range",
        "incidents",
        "longitude >= -180 AND longitude <= 180",
    )

    op.create_check_constraint(
        "ck_incidents_severity_range",
        "incidents",
        "severity >= 0 AND severity <= 10",
    )

    op.create_check_constraint(
        "ck_incidents_confirmation_count_nonnegative",
        "incidents",
        "confirmation_count >= 0",
    )

    op.create_check_constraint(
        "ck_incidents_priority_score_nonnegative",
        "incidents",
        "priority_score >= 0",
    )


def downgrade() -> None:
    """Remove database-level validation constraints."""

    op.drop_constraint(
        "ck_incidents_priority_score_nonnegative",
        "incidents",
        type_="check",
    )

    op.drop_constraint(
        "ck_incidents_confirmation_count_nonnegative",
        "incidents",
        type_="check",
    )

    op.drop_constraint(
        "ck_incidents_severity_range",
        "incidents",
        type_="check",
    )

    op.drop_constraint(
        "ck_incidents_longitude_range",
        "incidents",
        type_="check",
    )

    op.drop_constraint(
        "ck_incidents_latitude_range",
        "incidents",
        type_="check",
    )

    op.drop_constraint(
        "ck_detections_severity_range",
        "detections",
        type_="check",
    )

    op.drop_constraint(
        "ck_detections_confidence_range",
        "detections",
        type_="check",
    )

    op.drop_constraint(
        "ck_detections_longitude_range",
        "detections",
        type_="check",
    )

    op.drop_constraint(
        "ck_detections_latitude_range",
        "detections",
        type_="check",
    )

    op.drop_constraint(
        "ck_vehicles_longitude_range",
        "vehicles",
        type_="check",
    )

    op.drop_constraint(
        "ck_vehicles_latitude_range",
        "vehicles",
        type_="check",
    )