import uuid

import pytest
from alembic import command
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from tests.conftest import alembic_config


async def new_user(conn, email="a@example.com") -> uuid.UUID:
    result = await conn.execute(text("insert into users (email) values (:e) returning id"), {"e": email})
    return result.scalar_one()


async def add_plan(conn, user_id, plan_id="plan-1"):
    await conn.execute(
        text("insert into plans (user_id, id, name, schedule) values (:u, :id, 'Push', '{}')"),
        {"u": user_id, "id": plan_id},
    )


async def plan_seq(conn, user_id, plan_id="plan-1") -> int:
    result = await conn.execute(
        text("select server_seq from plans where user_id = :u and id = :id"), {"u": user_id, "id": plan_id}
    )
    return result.scalar_one()


async def test_every_update_takes_a_newer_seq(engine):
    async with engine.begin() as conn:
        user = await new_user(conn)
        await add_plan(conn, user)
        first = await plan_seq(conn, user)
        await conn.execute(
            text("insert into body_measurements (user_id, id, measured_at) values (:u, 'body-1', now())"), {"u": user}
        )
        await conn.execute(text("update plans set name = 'Pull' where user_id = :u"), {"u": user})
        # The body entry took first + 1, so the updated plan must be past it
        assert await plan_seq(conn, user) > first + 1


async def test_two_people_can_have_the_same_local_id(engine):
    async with engine.begin() as conn:
        await add_plan(conn, await new_user(conn, "a@example.com"))
        await add_plan(conn, await new_user(conn, "b@example.com"))
        count = await conn.execute(text("select count(*) from plans where id = 'plan-1'"))
        assert count.scalar_one() == 2


async def test_email_is_unique_regardless_of_case(engine):
    async with engine.connect() as conn:
        await new_user(conn, "Anna@Example.com")
        with pytest.raises(IntegrityError):
            await new_user(conn, "anna@example.com")
        await conn.rollback()


async def test_deleting_a_user_removes_their_workouts_and_sets(engine):
    async with engine.begin() as conn:
        user = await new_user(conn)
        params = {"u": user}
        await conn.execute(text("insert into workouts (user_id, id, started_at) values (:u, 'w-1', now())"), params)
        await conn.execute(
            text(
                "insert into workout_exercises (user_id, workout_id, position, exercise_id, exercise_name)"
                " values (:u, 'w-1', 0, 'ex-bench-press', 'Bench')"
            ),
            params,
        )
        await conn.execute(
            text(
                "insert into workout_sets (user_id, workout_id, exercise_position, position, reps, weight_kg)"
                " values (:u, 'w-1', 0, 0, 8, 80)"
            ),
            params,
        )
        await conn.execute(text("delete from users where id = :u"), params)
        count = await conn.execute(text("select count(*) from workout_sets"))
        assert count.scalar_one() == 0


def test_migrations_go_down_and_up_again(migrated):
    config = alembic_config()
    command.downgrade(config, "base")
    command.upgrade(config, "head")


def test_models_match_the_migrations(migrated):
    # Fails when a model changed without a new migration
    command.check(alembic_config())
