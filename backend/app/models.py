"""Database schema.

Records the phone creates keep the phone's text ids (`plan-1730...`), so local data moves
into an account unchanged; the primary key is (user_id, id) because two people can have
the same local id. Every synced table carries `server_seq`: a number from one global
sequence, bumped by a trigger on each insert or update. A device asks for "everything
after the last seq I saw", so its own clock never decides what it receives.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    MetaData,
    Numeric,
    Sequence,
    SmallInteger,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)

sync_seq = Sequence("sync_seq", metadata=metadata)

# Tables a device syncs; the migration attaches the seq trigger to each of them
SYNCED_TABLES = ("profiles", "user_settings", "plans", "workouts", "body_measurements", "custom_exercises")


class Base(DeclarativeBase):
    metadata = metadata


def _now() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now())


def _seq() -> Mapped[int]:
    return mapped_column(BigInteger, server_default=text("nextval('sync_seq')"))


def _owner() -> Mapped[uuid.UUID]:
    return mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (Index("uq_users_email_lower", func.lower(text("email")), unique=True),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(Text)
    email_verified: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    # Null for accounts that only sign in with Google
    password_hash: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = _now()
    updated_at: Mapped[datetime] = _now()


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = _owner()
    name: Mapped[str] = mapped_column(Text, server_default="")
    gender: Mapped[str | None] = mapped_column(Text)
    age: Mapped[int | None] = mapped_column(SmallInteger)
    height_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    target_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    fitness_goal: Mapped[str | None] = mapped_column(Text)
    activity_level: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = _now()
    server_seq: Mapped[int] = _seq()


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = _owner()
    active_plan_id: Mapped[str | None] = mapped_column(Text)
    weekly_goal: Mapped[int] = mapped_column(SmallInteger, server_default=text("3"))
    equipment: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'"))
    joint_limits: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'"))
    favorites: Mapped[list[str]] = mapped_column(JSONB, server_default=text("'[]'"))
    exercise_notes: Mapped[dict[str, str]] = mapped_column(JSONB, server_default=text("'{}'"))
    updated_at: Mapped[datetime] = _now()
    server_seq: Mapped[int] = _seq()


class Plan(Base):
    """A program is edited as a whole, so its schedule is one JSON document."""

    __tablename__ = "plans"
    __table_args__ = (Index("ix_plans_user_seq", "user_id", "server_seq"),)

    user_id: Mapped[uuid.UUID] = _owner()
    id: Mapped[str] = mapped_column(Text, primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    template_id: Mapped[str | None] = mapped_column(Text)
    schedule: Mapped[dict[str, Any]] = mapped_column(JSONB)
    cycle: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    deload_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = _now()
    updated_at: Mapped[datetime] = _now()
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    server_seq: Mapped[int] = _seq()


class Workout(Base):
    """A finished workout. Exercises and sets are rows so progress can be counted in SQL."""

    __tablename__ = "workouts"
    __table_args__ = (
        Index("ix_workouts_user_seq", "user_id", "server_seq"),
        Index("ix_workouts_user_started", "user_id", "started_at"),
    )

    user_id: Mapped[uuid.UUID] = _owner()
    id: Mapped[str] = mapped_column(Text, primary_key=True)
    # No foreign key: the workout stays in the log after its program is deleted
    plan_id: Mapped[str | None] = mapped_column(Text)
    plan_name: Mapped[str] = mapped_column(Text, server_default="")
    day_label: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int] = mapped_column(server_default=text("0"))
    total_sets: Mapped[int] = mapped_column(server_default=text("0"))
    total_reps: Mapped[int] = mapped_column(server_default=text("0"))
    volume_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2), server_default=text("0"))
    calories: Mapped[int] = mapped_column(server_default=text("0"))
    updated_at: Mapped[datetime] = _now()
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    server_seq: Mapped[int] = _seq()

    exercises: Mapped[list["WorkoutExercise"]] = relationship(
        cascade="all, delete-orphan", order_by="WorkoutExercise.position", lazy="selectin"
    )


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    __table_args__ = (
        ForeignKeyConstraint(["user_id", "workout_id"], ["workouts.user_id", "workouts.id"], ondelete="CASCADE"),
        Index("ix_workout_exercises_user_exercise", "user_id", "exercise_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    workout_id: Mapped[str] = mapped_column(Text, primary_key=True)
    position: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    exercise_id: Mapped[str] = mapped_column(Text)
    # Kept so the log still reads right after a custom exercise is renamed or deleted
    exercise_name: Mapped[str] = mapped_column(Text)
    sets_completed: Mapped[int] = mapped_column(SmallInteger, server_default=text("0"))
    total_reps: Mapped[int] = mapped_column(server_default=text("0"))
    max_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    reps_at_max_weight: Mapped[int | None] = mapped_column(SmallInteger)

    sets: Mapped[list["WorkoutSet"]] = relationship(
        cascade="all, delete-orphan", order_by="WorkoutSet.position", lazy="selectin"
    )


class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    __table_args__ = (
        ForeignKeyConstraint(
            ["user_id", "workout_id", "exercise_position"],
            ["workout_exercises.user_id", "workout_exercises.workout_id", "workout_exercises.position"],
            ondelete="CASCADE",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    workout_id: Mapped[str] = mapped_column(Text, primary_key=True)
    exercise_position: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    position: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    reps: Mapped[int] = mapped_column(SmallInteger)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    # null for a normal working set, otherwise 'drop' or 'failure'
    kind: Mapped[str | None] = mapped_column(Text)
    rpe: Mapped[Decimal | None] = mapped_column(Numeric(3, 1))


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"
    __table_args__ = (Index("ix_body_measurements_user_seq", "user_id", "server_seq"),)

    user_id: Mapped[uuid.UUID] = _owner()
    id: Mapped[str] = mapped_column(Text, primary_key=True)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    waist_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    chest_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    hips_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    arm_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    updated_at: Mapped[datetime] = _now()
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    server_seq: Mapped[int] = _seq()


class CustomExercise(Base):
    """An exercise the user added; same shape as the built-in catalog, stored as one document."""

    __tablename__ = "custom_exercises"
    __table_args__ = (Index("ix_custom_exercises_user_seq", "user_id", "server_seq"),)

    user_id: Mapped[uuid.UUID] = _owner()
    id: Mapped[str] = mapped_column(Text, primary_key=True)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB)
    updated_at: Mapped[datetime] = _now()
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    server_seq: Mapped[int] = _seq()


class ErrorReport(Base):
    """Crash reports from the app. No user id, name or email by design."""

    __tablename__ = "error_reports"
    __table_args__ = (Index("ix_error_reports_received_at", "received_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    received_at: Mapped[datetime] = _now()
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    source: Mapped[str] = mapped_column(Text)
    message: Mapped[str] = mapped_column(Text)
    stack: Mapped[str | None] = mapped_column(Text)
    path: Mapped[str] = mapped_column(Text)
    user_agent: Mapped[str] = mapped_column(Text)
    app_version: Mapped[str] = mapped_column(Text)
