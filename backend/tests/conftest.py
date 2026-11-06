import os
from collections.abc import AsyncIterator

import pytest
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from app.config import Settings
from app.db import create_engine
from app.main import create_app
from app.models import metadata

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")


def alembic_config() -> Config:
    config = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    config.attributes["database_url"] = TEST_DATABASE_URL
    return config


@pytest.fixture(scope="session")
def migrated() -> None:
    if not TEST_DATABASE_URL:
        pytest.skip("TEST_DATABASE_URL is not set")
    config = alembic_config()
    command.downgrade(config, "base")
    command.upgrade(config, "head")


@pytest.fixture
async def engine(migrated: None) -> AsyncIterator[AsyncEngine]:
    engine = create_engine(TEST_DATABASE_URL)
    yield engine
    async with engine.begin() as conn:
        tables = ", ".join(t.name for t in metadata.sorted_tables)
        await conn.execute(text(f"truncate {tables} cascade"))
    await engine.dispose()


def make_app(database_url: str) -> FastAPI:
    return create_app(Settings(database_url=database_url, app_version="test", environment="test"))


async def open_client(app: FastAPI) -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.fixture
async def client(engine: AsyncEngine) -> AsyncIterator[AsyncClient]:
    app = make_app(TEST_DATABASE_URL)
    async with app.router.lifespan_context(app), await open_client(app) as client:
        yield client
