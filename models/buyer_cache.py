import uuid
from datetime import datetime, timezone

from core.database import Base
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class BuyerCache(Base):
    """
    Cache for mapping buyer names to their unique identifiers (e.g. TED BT-501).
    """

    __tablename__ = "buyer_cache"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(1000), index=True, unique=True)
    caller_id: Mapped[str] = mapped_column(String(255), index=True)
    portal: Mapped[str] = mapped_column(String(50), index=True, default="ted")

    last_fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
