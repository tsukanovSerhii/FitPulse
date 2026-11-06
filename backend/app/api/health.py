from fastapi import APIRouter, Request, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import Session

router = APIRouter(tags=["health"])


@router.get("/health/live")
async def live() -> dict[str, str]:
    """The process is up. Used by the container health check, so a suspended database does not restart it."""
    return {"status": "ok"}


@router.get("/health")
async def ready(request: Request, response: Response, session: Session) -> dict[str, str]:
    """The API can reach the database."""
    try:
        await session.execute(text("select 1"))
        database = "ok"
    except (SQLAlchemyError, OSError):
        database = "unavailable"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {
        "status": "ok" if database == "ok" else "degraded",
        "database": database,
        "version": request.app.state.settings.app_version,
    }
