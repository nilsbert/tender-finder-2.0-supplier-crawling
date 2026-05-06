"""ORM model for crawler job execution tracking."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class CrawlerJobORM(Base):
    """Tracks individual scraper execution runs."""
    __tablename__ = "crawler_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    crawler_id: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="running")

    tenders_found: Mapped[int] = mapped_column(Integer, default=0)
    tenders_processed: Mapped[int] = mapped_column(Integer, default=0)

    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
