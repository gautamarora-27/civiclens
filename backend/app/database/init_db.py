from backend.app.database.session import Base, engine
from backend.app.models.vehicle import Vehicle
from backend.app.models.detection import Detection
from backend.app.models.incident import Incident
from backend.app.models.department import Department
from backend.app.models.work_order import WorkOrder


def init_db():
    Base.metadata.create_all(bind=engine)
    print("CivicLens database tables created successfully.")


if __name__ == "__main__":
    init_db()