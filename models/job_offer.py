import uuid
from datetime import datetime, timezone
from typing import Optional

from core.database import Base
from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class JobOffer(Base):
    """
    Standardized domain model for job postings (Stellenausschreibungen).
    """

    __tablename__ = "job_offer"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    external_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source_system: Mapped[str] = mapped_column(String(100), index=True)  # 'INTERAMT', 'EURES'

    title: Mapped[str] = mapped_column(String(2000), nullable=False)
    employer: Mapped[str] = mapped_column(String(500), index=True)
    location: Mapped[Optional[str]] = mapped_column(String(500))
    salary_group: Mapped[Optional[str]] = mapped_column(String(100))

    description: Mapped[Optional[str]] = mapped_column(Text)
    link: Mapped[str] = mapped_column(String(2048))

    is_public: Mapped[bool] = mapped_column(default=True)
    category: Mapped[str] = mapped_column(String(100), default="PUBLIC_SECTOR", index=True)

    deadline_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    crawled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
