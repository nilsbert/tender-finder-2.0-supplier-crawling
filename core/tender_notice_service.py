import logging
from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.tender_winning_notice import TenderWinningNotice

logger = logging.getLogger(__name__)

class TenderNoticeService:
    async def upsert_winning_notice(self, db: AsyncSession, data: dict) -> TenderWinningNotice:
        """
        Create or update a tender winning notice.
        """
        external_id = data.get("external_id")
        stmt = select(TenderWinningNotice).where(TenderWinningNotice.external_id == external_id)
        result = await db.execute(stmt)
        notice = result.scalar_one_or_none()

        if notice:
            # Update existing
            for key, value in data.items():
                if hasattr(notice, key):
                    setattr(notice, key, value)
            notice.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        else:
            # Create new
            notice = TenderWinningNotice(**data)
            db.add(notice)
        
        await db.commit()
        await db.refresh(notice)
        return notice

    async def list_winning_notices(
        self, 
        db: AsyncSession, 
        contracting_authority: Optional[str] = None, 
        source_system: Optional[str] = None
    ) -> List[TenderWinningNotice]:
        """
        List all winning notices with optional filtering.
        """
        stmt = select(TenderWinningNotice)
        if contracting_authority:
            stmt = stmt.where(TenderWinningNotice.contracting_authority.ilike(f"%{contracting_authority}%"))
        if source_system:
            stmt = stmt.where(TenderWinningNotice.source_system == source_system)
        
        stmt = stmt.order_by(TenderWinningNotice.publication_date.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())
