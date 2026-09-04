from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, children, check_ins, analytics, knowledge, context, coach

api_v1_router = APIRouter()

# Include endpoint sub-routers
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(children.router, prefix="/children", tags=["Children"])
api_v1_router.include_router(
    check_ins.router,
    prefix="/children/{child_id}/check-ins",
    tags=["Daily Check-Ins & Behavior Events"]
)
api_v1_router.include_router(
    analytics.router,
    prefix="/children/{child_id}/analytics",
    tags=["Deterministic Behavior Analytics"]
)
api_v1_router.include_router(
    knowledge.router,
    prefix="/knowledge",
    tags=["Parenting Knowledge Base"]
)
api_v1_router.include_router(
    context.router,
    prefix="/children/{child_id}/context",
    tags=["Context Assembly Layer"]
)
api_v1_router.include_router(
    coach.router,
    tags=["Grounded Parenting Coach"]
)



