from app.db import engine_options


def test_neon_url_moves_ssl_to_connect_args():
    url, args = engine_options(
        "postgresql://u:p@ep-cool-1.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )
    assert url == "postgresql+asyncpg://u:p@ep-cool-1.eu-central-1.aws.neon.tech/neondb"
    assert args == {"ssl": "require"}


def test_pooled_neon_host_turns_off_statement_cache():
    url, args = engine_options("postgres://u:p@ep-cool-1-pooler.neon.tech/neondb?sslmode=require")
    assert url.startswith("postgresql+asyncpg://")
    assert "prepared_statement_cache_size=0" in url
    assert args == {"ssl": "require", "statement_cache_size": 0}


def test_local_url_without_ssl():
    url, args = engine_options("postgresql://fitpulse:fitpulse@db:5432/fitpulse?sslmode=disable")
    assert url == "postgresql+asyncpg://fitpulse:fitpulse@db:5432/fitpulse"
    assert args == {}
