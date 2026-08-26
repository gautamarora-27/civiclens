from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.department import Department

DEPARTMENT_CODE_MAP = {
    "pothole": "PWD",
    "road_damage": "PWD",
    "garbage": "SANITATION",
    "waterlogging": "DRAINAGE",
    "encroachment": "ENFORCEMENT",
    "traffic": "TRAFFIC",
}


def get_department_for_issue(
    db: Session,
    issue_type: str,
) -> Department | None:
    department_code = DEPARTMENT_CODE_MAP.get(issue_type)

    if department_code is None:
        return None

    return db.scalar(
        select(Department).where(
            Department.code == department_code
        )
    )