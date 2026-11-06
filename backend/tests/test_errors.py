from sqlalchemy import select

from app.models import ErrorReport

REPORT = {
    "message": "TypeError: x is undefined",
    "stack": "at Foo (main.js:1:1)",
    "source": "render",
    "path": "/workout?day=mon",
    "userAgent": "Mozilla/5.0 (iPhone)",
    "version": "abc1234",
    "at": "2026-11-06T10:00:00.000Z",
}


async def stored(engine):
    async with engine.connect() as conn:
        return (await conn.execute(select(ErrorReport))).all()


async def test_stores_a_report_without_query_string(client, engine):
    response = await client.post("/api/errors", json=REPORT)
    assert response.status_code == 204
    [row] = await stored(engine)
    assert row.path == "/workout"
    assert row.source == "render"
    assert row.app_version == "abc1234"


async def test_long_stack_is_cut_not_rejected(client, engine):
    response = await client.post("/api/errors", json={**REPORT, "stack": "x" * 20_000})
    assert response.status_code == 204
    [row] = await stored(engine)
    assert len(row.stack) == 8_000


async def test_rejects_unknown_source_and_missing_message(client, engine):
    bad_source = await client.post("/api/errors", json={**REPORT, "source": "other"})
    no_message = await client.post("/api/errors", json={k: v for k, v in REPORT.items() if k != "message"})
    assert bad_source.status_code == 422
    assert no_message.status_code == 422
    assert await stored(engine) == []
