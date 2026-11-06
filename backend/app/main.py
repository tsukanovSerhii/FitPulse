from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import errors, health
from app.config import Settings, get_settings
from app.db import create_engine, session_factory


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = create_engine(settings.database_url)
        app.state.settings = settings
        app.state.sessions = session_factory(engine)
        yield
        await engine.dispose()

    # Docs only outside production: the API is private to the app
    docs = settings.environment != "production"
    app = FastAPI(
        title="FitPulse API",
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/api/docs" if docs else None,
        openapi_url="/api/openapi.json" if docs else None,
        redoc_url=None,
    )
    app.include_router(health.router, prefix="/api")
    app.include_router(errors.router, prefix="/api")
    return app


app = create_app()
