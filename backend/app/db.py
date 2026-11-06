from collections.abc import AsyncIterator
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

# libpq options asyncpg does not understand; sslmode is passed as connect_args instead
_LIBPQ_ONLY = {"sslmode", "channel_binding"}


def engine_options(url: str) -> tuple[str, dict[str, Any]]:
    """Turn a libpq URL (as Neon gives it) into an asyncpg URL and connect args."""
    parts = urlsplit(url)
    scheme = "postgresql+asyncpg" if parts.scheme in {"postgres", "postgresql", "postgresql+asyncpg"} else parts.scheme
    query = dict(parse_qsl(parts.query))
    connect_args: dict[str, Any] = {}

    sslmode = query.get("sslmode")
    if sslmode and sslmode != "disable":
        connect_args["ssl"] = sslmode
    # PgBouncer in transaction mode (Neon "-pooler" hosts) breaks prepared statement caching
    if "-pooler" in (parts.hostname or ""):
        connect_args["statement_cache_size"] = 0
        query["prepared_statement_cache_size"] = "0"

    kept = {k: v for k, v in query.items() if k not in _LIBPQ_ONLY}
    return urlunsplit((scheme, parts.netloc, parts.path, urlencode(kept), parts.fragment)), connect_args


def create_engine(url: str) -> AsyncEngine:
    async_url, connect_args = engine_options(url)
    # pre_ping: Neon suspends idle computes and drops their connections
    return create_async_engine(async_url, connect_args=connect_args, pool_pre_ping=True, pool_size=5, max_overflow=5)


def session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False)


async def session_scope(factory: async_sessionmaker[AsyncSession]) -> AsyncIterator[AsyncSession]:
    async with factory() as session:
        yield session
