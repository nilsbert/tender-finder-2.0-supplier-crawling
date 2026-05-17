from datetime import datetime

from core.database import Base
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func


class CrawlerConfigORM(Base):
    """The desired state of our scraping fleet."""

    __tablename__ = "crawler_configs"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # e.g. "ted-europe"
    display_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    url_pattern: Mapped[str] = mapped_column(String(2048), nullable=False)
    schedule_cron: Mapped[str] = mapped_column(String(100), nullable=True)


class ConfigRetentionORM(Base):
    """Current Data Retention policy"""

    __tablename__ = "config_retention_current"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    retention_period_days: Mapped[int] = mapped_column(Integer, default=90)

    version: Mapped[int] = mapped_column(Integer, default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())


class ConfigRetentionHistoryORM(Base):
    """Audit trail for retention policy changes"""

    __tablename__ = "config_retention_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    retention_period_days: Mapped[int] = mapped_column(Integer)

    version: Mapped[int] = mapped_column(Integer)
    change_summary: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    created_by: Mapped[str] = mapped_column(String(100), default="Alex (Admin)")


class CrawlerScheduleConfigORM(Base):
    """Global scheduling settings for the crawler fleet."""

    __tablename__ = "config_crawler_schedule"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    start_time: Mapped[str] = mapped_column(String(5), default="00:00")  # HH:mm
    interval_hours: Mapped[int] = mapped_column(Integer, default=3)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
