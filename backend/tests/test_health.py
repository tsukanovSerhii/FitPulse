from tests.conftest import make_app, open_client


async def test_live_does_not_need_the_database():
    app = make_app("postgresql://nobody@127.0.0.1:1/none")
    async with app.router.lifespan_context(app), await open_client(app) as client:
        live = await client.get("/api/health/live")
        ready = await client.get("/api/health")
    assert live.status_code == 200
    assert ready.status_code == 503
    assert ready.json()["database"] == "unavailable"


async def test_ready_reports_database_and_version(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok", "version": "test"}
