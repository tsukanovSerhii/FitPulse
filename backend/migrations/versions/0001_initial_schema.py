"""Initial schema: users, synced records and error reports

Revision ID: 0001
Revises:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SYNCED_TABLES = ("profiles", "user_settings", "plans", "workouts", "body_measurements", "custom_exercises")


def upgrade() -> None:
    op.execute(sa.schema.CreateSequence(sa.Sequence("sync_seq")))
    op.create_table(
        "error_reports",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.Text(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("stack", sa.Text(), nullable=True),
        sa.Column("path", sa.Text(), nullable=False),
        sa.Column("user_agent", sa.Text(), nullable=False),
        sa.Column("app_version", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_error_reports")),
    )
    op.create_index("ix_error_reports_received_at", "error_reports", ["received_at"], unique=False)
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
    )
    op.create_index("uq_users_email_lower", "users", [sa.literal_column("lower(email)")], unique=True)
    op.create_table(
        "body_measurements",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("measured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("waist_cm", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("chest_cm", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("hips_cm", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("arm_cm", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("server_seq", sa.BigInteger(), server_default=sa.text("nextval('sync_seq')"), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_body_measurements_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("user_id", "id", name=op.f("pk_body_measurements")),
    )
    op.create_index("ix_body_measurements_user_seq", "body_measurements", ["user_id", "server_seq"], unique=False)
    op.create_table(
        "custom_exercises",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("server_seq", sa.BigInteger(), server_default=sa.text("nextval('sync_seq')"), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_custom_exercises_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("user_id", "id", name=op.f("pk_custom_exercises")),
    )
    op.create_index("ix_custom_exercises_user_seq", "custom_exercises", ["user_id", "server_seq"], unique=False)
    op.create_table(
        "plans",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("template_id", sa.Text(), nullable=True),
        sa.Column("schedule", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("cycle", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("deload_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("server_seq", sa.BigInteger(), server_default=sa.text("nextval('sync_seq')"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_plans_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "id", name=op.f("pk_plans")),
    )
    op.create_index("ix_plans_user_seq", "plans", ["user_id", "server_seq"], unique=False)
    op.create_table(
        "profiles",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.Text(), server_default="", nullable=False),
        sa.Column("gender", sa.Text(), nullable=True),
        sa.Column("age", sa.SmallInteger(), nullable=True),
        sa.Column("height_cm", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("weight_kg", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("target_weight_kg", sa.Numeric(precision=5, scale=1), nullable=True),
        sa.Column("fitness_goal", sa.Text(), nullable=True),
        sa.Column("activity_level", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("server_seq", sa.BigInteger(), server_default=sa.text("nextval('sync_seq')"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_profiles_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_profiles")),
    )
    op.create_table(
        "user_settings",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("active_plan_id", sa.Text(), nullable=True),
        sa.Column("weekly_goal", sa.SmallInteger(), server_default=sa.text("3"), nullable=False),
        sa.Column("equipment", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'"), nullable=False),
        sa.Column(
            "joint_limits", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'"), nullable=False
        ),
        sa.Column("favorites", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'"), nullable=False),
        sa.Column(
            "exercise_notes", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'"), nullable=False
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("server_seq", sa.BigInteger(), server_default=sa.text("nextval('sync_seq')"), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_user_settings_user_id_users"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_user_settings")),
    )
    op.create_table(
        "workouts",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("plan_id", sa.Text(), nullable=True),
        sa.Column("plan_name", sa.Text(), server_default="", nullable=False),
        sa.Column("day_label", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_sets", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_reps", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("volume_kg", sa.Numeric(precision=10, scale=2), server_default=sa.text("0"), nullable=False),
        sa.Column("calories", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("server_seq", sa.BigInteger(), server_default=sa.text("nextval('sync_seq')"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_workouts_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "id", name=op.f("pk_workouts")),
    )
    op.create_index("ix_workouts_user_seq", "workouts", ["user_id", "server_seq"], unique=False)
    op.create_index("ix_workouts_user_started", "workouts", ["user_id", "started_at"], unique=False)
    op.create_table(
        "workout_exercises",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("workout_id", sa.Text(), nullable=False),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.Column("exercise_id", sa.Text(), nullable=False),
        sa.Column("exercise_name", sa.Text(), nullable=False),
        sa.Column("sets_completed", sa.SmallInteger(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_reps", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("max_weight_kg", sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column("reps_at_max_weight", sa.SmallInteger(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id", "workout_id"],
            ["workouts.user_id", "workouts.id"],
            name=op.f("fk_workout_exercises_user_id_workouts"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("user_id", "workout_id", "position", name=op.f("pk_workout_exercises")),
    )
    op.create_index("ix_workout_exercises_user_exercise", "workout_exercises", ["user_id", "exercise_id"], unique=False)
    op.create_table(
        "workout_sets",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("workout_id", sa.Text(), nullable=False),
        sa.Column("exercise_position", sa.SmallInteger(), nullable=False),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.Column("reps", sa.SmallInteger(), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column("kind", sa.Text(), nullable=True),
        sa.Column("rpe", sa.Numeric(precision=3, scale=1), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id", "workout_id", "exercise_position"],
            ["workout_exercises.user_id", "workout_exercises.workout_id", "workout_exercises.position"],
            name=op.f("fk_workout_sets_user_id_workout_exercises"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("user_id", "workout_id", "exercise_position", "position", name=op.f("pk_workout_sets")),
    )

    # Every write to a synced row takes the next number, so devices can ask for changes after a cursor
    op.execute(
        """
        create function bump_server_seq() returns trigger language plpgsql as $$
        begin
          new.server_seq := nextval('sync_seq');
          return new;
        end $$
        """
    )
    for table in SYNCED_TABLES:
        op.execute(
            f"create trigger {table}_server_seq before update on {table} for each row execute function bump_server_seq()"
        )


def downgrade() -> None:
    for table in SYNCED_TABLES:
        op.execute(f"drop trigger {table}_server_seq on {table}")
    op.execute("drop function bump_server_seq()")
    op.drop_table("workout_sets")
    op.drop_index("ix_workout_exercises_user_exercise", table_name="workout_exercises")
    op.drop_table("workout_exercises")
    op.drop_index("ix_workouts_user_started", table_name="workouts")
    op.drop_index("ix_workouts_user_seq", table_name="workouts")
    op.drop_table("workouts")
    op.drop_table("user_settings")
    op.drop_table("profiles")
    op.drop_index("ix_plans_user_seq", table_name="plans")
    op.drop_table("plans")
    op.drop_index("ix_custom_exercises_user_seq", table_name="custom_exercises")
    op.drop_table("custom_exercises")
    op.drop_index("ix_body_measurements_user_seq", table_name="body_measurements")
    op.drop_table("body_measurements")
    op.drop_index("uq_users_email_lower", table_name="users")
    op.drop_table("users")
    op.drop_index("ix_error_reports_received_at", table_name="error_reports")
    op.drop_table("error_reports")
    op.execute(sa.schema.DropSequence(sa.Sequence("sync_seq")))
