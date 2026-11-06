from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, status
from pydantic import AfterValidator, BaseModel, ConfigDict, Field

from app.api.deps import Session
from app.models import ErrorReport

router = APIRouter(tags=["errors"])


def _clip(limit: int):
    # Long stacks are cut rather than rejected: a report is more useful truncated than lost
    return AfterValidator(lambda value: value[:limit] if isinstance(value, str) else value)


class ErrorReportIn(BaseModel):
    """Same shape the app's errorReporter sends."""

    model_config = ConfigDict(populate_by_name=True)

    message: Annotated[str, Field(min_length=1, max_length=20_000), _clip(1_000)]
    stack: Annotated[str | None, Field(max_length=50_000), _clip(8_000)] = None
    source: Literal["error", "promise", "render"]
    path: Annotated[str, Field(max_length=2_000), _clip(300)]
    user_agent: Annotated[str, Field(alias="userAgent", max_length=2_000), _clip(300)]
    version: Annotated[str, Field(max_length=100)]
    at: datetime


@router.post("/errors", status_code=status.HTTP_204_NO_CONTENT)
async def report_error(report: ErrorReportIn, session: Session) -> None:
    session.add(
        ErrorReport(
            occurred_at=report.at,
            source=report.source,
            message=report.message,
            stack=report.stack,
            # The app strips query strings already; drop them here too in case an old build did not
            path=report.path.split("?", 1)[0],
            user_agent=report.user_agent,
            app_version=report.version,
        )
    )
    await session.commit()
