import logging
from typing import Any, Optional

from models.job_offer import JobOffer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("job_offer_service")


class JobOfferService:
    """
    Application Service for managing JobOffer domain logic and persistence.
    """

    async def upsert_job_offer(self, db: AsyncSession, data: dict[str, Any]) -> JobOffer:
        """
        Idempotently upsert a JobOffer.
        """
        external_id = data.get("external_id")
        if not external_id:
            raise ValueError("external_id is required for job offer upsert")

        stmt = select(JobOffer).where(JobOffer.external_id == external_id)
        result = await db.execute(stmt)
        offer = result.scalar_one_or_none()

        if not offer:
            logger.info(f"✨ [JobOfferService] Creating new job offer: {external_id}")
            offer = JobOffer(external_id=external_id)
            db.add(offer)
        else:
            logger.debug(f"🔄 [JobOfferService] Updating existing job offer: {external_id}")

        # Update attributes
        offer.source_system = data.get("source_system", offer.source_system or "UNKNOWN")
        offer.title = data.get("title", offer.title)
        offer.employer = data.get("employer", offer.employer)
        offer.location = data.get("location", offer.location)
        offer.salary_group = data.get("salary_group", offer.salary_group)
        offer.description = data.get("description", offer.description)
        offer.link = data.get("link", offer.link)
        offer.deadline_at = data.get("deadline_at", offer.deadline_at)
        offer.is_public = data.get("is_public", offer.is_public if offer.is_public is not None else True)
        offer.category = data.get("category", offer.category or "PUBLIC_SECTOR")

        await db.flush()
        return offer

    async def list_job_offers(
        self,
        db: AsyncSession,
        supplier: Optional[str] = None,
        query: Optional[str] = None,
        source_system: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[JobOffer]:
        """
        List job offers with filtering.
        """
        stmt = select(JobOffer)

        if supplier:
            stmt = stmt.where(JobOffer.employer.ilike(f"%{supplier}%"))

        if query:
            stmt = stmt.where((JobOffer.title.ilike(f"%{query}%")) | (JobOffer.description.ilike(f"%{query}%")))

        if source_system:
            stmt = stmt.where(JobOffer.source_system == source_system)

        stmt = stmt.order_by(JobOffer.crawled_at.desc()).limit(limit).offset(offset)
        result = await db.execute(stmt)
        return list(result.scalars().all())
