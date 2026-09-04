from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health_status() -> HealthResponse:
    """
    Basic application health check endpoint.
    Returns service name and health status.
    """
    return HealthResponse(
        status="healthy",
        service="aaghosh-api",
        version="1.0.0"
    )
