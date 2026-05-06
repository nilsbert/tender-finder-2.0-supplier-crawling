import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

class TenderWinningNotice(Base):
    """
    Model for awarded contracts (Vergebene Aufträge / Ex-Post-Transparenz).
    """
    __tablename__ = "tender_winning_notice"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    external_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source_system: Mapped[str] = mapped_column(String(100), index=True)

    title: Mapped[str] = mapped_column(String(2000), nullable=False)
    contracting_authority: Mapped[str] = mapped_column(String(500), index=True)
    
    cpv_code: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    location_nuts: Mapped[Optional[str]] = mapped_column(String(50), index=True)

    winner_name: Mapped[Optional[str]] = mapped_column(String(500), index=True)
    winner_address: Mapped[Optional[str]] = mapped_column(String(1000))
    winner_id: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    
    contract_value: Mapped[Optional[float]] = mapped_column(Numeric(precision=15, scale=2))
    currency: Mapped[Optional[str]] = mapped_column(String(10))

    description: Mapped[Optional[str]] = mapped_column(Text)
    link: Mapped[str] = mapped_column(String(2048))

    is_public: Mapped[bool] = mapped_column(default=True)

    publication_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    crawled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
