from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes.vehicles import router as vehicles_router
from backend.app.core.config import settings
from backend.app.api.routes.detections import router as detections_router

from backend.app.api.routes.dashboard import router as dashboard_router
from backend.app.api.routes.incidents import router as incidents_router 
from backend.app.api.routes.work_orders import router as work_orders_router
from backend.app.api.routes.map import router as map_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for the CivicLens Urban Intelligence Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    vehicles_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    detections_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    incidents_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    work_orders_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    dashboard_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    map_router,
    prefix=settings.api_v1_prefix,
)
@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }


@app.get(f"{settings.api_v1_prefix}/health")
def health_check():
    return {
        "status": "healthy",
        "service": "civiclens-backend",
        "version": settings.app_version,
    }