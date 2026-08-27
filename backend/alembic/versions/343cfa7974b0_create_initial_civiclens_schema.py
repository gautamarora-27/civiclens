"""create initial CivicLens schema

Revision ID: 343cfa7974b0
Revises:
Create Date: 2026-08-27 05:33:19.997805

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography


# revision identifiers, used by Alembic.
revision: str = '343cfa7974b0'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the schema represented by the current SQLAlchemy models."""
    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index("ix_departments_id", "departments", ["id"], unique=False)
    op.create_index("ix_departments_name", "departments", ["name"], unique=True)

    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.String(length=50), nullable=False),
        sa.Column("route_name", sa.String(length=100), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("location", Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("last_seen", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vehicles_id", "vehicles", ["id"], unique=False)
    op.create_index("ix_vehicles_vehicle_id", "vehicles", ["vehicle_id"], unique=True)

    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("issue_type", sa.String(length=50), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("location", Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("severity", sa.Float(), nullable=False),
        sa.Column("priority_score", sa.Float(), nullable=False),
        sa.Column("confirmation_count", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("first_detected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_detected_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_incidents_id", "incidents", ["id"], unique=False)
    op.create_index("ix_incidents_issue_type", "incidents", ["issue_type"], unique=False)
    op.create_index("ix_incidents_department_id", "incidents", ["department_id"], unique=False)
    op.create_index("ix_incidents_status", "incidents", ["status"], unique=False)

    op.create_table(
        "detections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=True),
        sa.Column("issue_type", sa.String(length=50), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("severity", sa.Float(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("location", Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.ForeignKeyConstraint(["incident_id"], ["incidents.id"]),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_detections_id", "detections", ["id"], unique=False)
    op.create_index("ix_detections_vehicle_id", "detections", ["vehicle_id"], unique=False)
    op.create_index("ix_detections_incident_id", "detections", ["incident_id"], unique=False)
    op.create_index("ix_detections_issue_type", "detections", ["issue_type"], unique=False)

    op.create_table(
        "work_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("department_id", sa.Integer(), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("assigned_to", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"]),
        sa.ForeignKeyConstraint(["incident_id"], ["incidents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_work_orders_id", "work_orders", ["id"], unique=False)
    op.create_index("ix_work_orders_incident_id", "work_orders", ["incident_id"], unique=True)
    op.create_index("ix_work_orders_department_id", "work_orders", ["department_id"], unique=False)
    op.create_index("ix_work_orders_status", "work_orders", ["status"], unique=False)


def downgrade() -> None:
    """Drop the current CivicLens schema."""
    op.drop_index("ix_work_orders_status", table_name="work_orders")
    op.drop_index("ix_work_orders_department_id", table_name="work_orders")
    op.drop_index("ix_work_orders_incident_id", table_name="work_orders")
    op.drop_index("ix_work_orders_id", table_name="work_orders")
    op.drop_table("work_orders")

    op.drop_index("ix_detections_issue_type", table_name="detections")
    op.drop_index("ix_detections_incident_id", table_name="detections")
    op.drop_index("ix_detections_vehicle_id", table_name="detections")
    op.drop_index("ix_detections_id", table_name="detections")
    op.drop_table("detections")

    op.drop_index("ix_incidents_status", table_name="incidents")
    op.drop_index("ix_incidents_department_id", table_name="incidents")
    op.drop_index("ix_incidents_issue_type", table_name="incidents")
    op.drop_index("ix_incidents_id", table_name="incidents")
    op.drop_table("incidents")

    op.drop_index("ix_vehicles_vehicle_id", table_name="vehicles")
    op.drop_index("ix_vehicles_id", table_name="vehicles")
    op.drop_table("vehicles")

    op.drop_index("ix_departments_name", table_name="departments")
    op.drop_index("ix_departments_id", table_name="departments")
    op.drop_table("departments")
