import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from core.tender_notice_service import TenderNoticeService
from core.job_offer_service import JobOfferService
from core.scrapers.job_offer.interamt import InteramtScraper
from core.scrapers.job_offer.eures import EuresScraper
from core.scrapers.job_offer.bund_jobs import BundScraper as BundJobsScraper
from core.scrapers.job_offer.deloitte import DeloitteScraper
from core.scrapers.job_offer.accenture import AccentureScraper
from core.scrapers.job_offer.porsche import PorscheScraper
from core.scrapers.job_offer.wavestone import WavestoneScraper
from core.scrapers.award_winning.bund_awards import BundScraper as BundAwardsScraper
from core.scrapers.award_winning.oeffentliche_vergabe import OeffentlicheVergabeScraper
from core.scrapers.award_winning.ted_awards import TEDAwardsScraper

from .database import SessionLocal
from models.job import CrawlerJobORM
from models.job_offer import JobOffer
from models.tender_winning_notice import TenderWinningNotice

logger = logging.getLogger("executor")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

class CrawlerExecutor:
    def __init__(self):
        self.active_jobs: dict = {}
        self.job_semaphore: Optional[asyncio.Semaphore] = None

    async def _get_semaphore(self) -> asyncio.Semaphore:
        if self.job_semaphore is None:
            self.job_semaphore = asyncio.Semaphore(5)
        return self.job_semaphore

    async def create_job_record(self, crawler_id: str) -> int:
        start_time = _utcnow()
        async with SessionLocal() as db:
            job = CrawlerJobORM(crawler_id=crawler_id, status="starting", start_time=start_time)
            db.add(job)
            await db.commit()
            await db.refresh(job)
            return job.id

    async def run_crawler(self, source: str, supplier_name: str, config: dict):
        sem = await self._get_semaphore()
        async with sem:
            crawler_id = f"{source}-{supplier_name}"
            job_id = await self.create_job_record(crawler_id)
            logger.info(f"🚀 Starting {source} crawl for {supplier_name} (Job {job_id})")
            
            try:
                source_up = source.upper()
                if source_up == "INTERAMT":
                    scraper = InteramtScraper(config)
                elif source_up == "EURES":
                    scraper = EuresScraper(config)
                elif source_up == "BUND_JOBS":
                    config["type"] = "JOBS"
                    scraper = BundJobsScraper(config)
                elif source_up == "BUND_AWARDS":
                    config["type"] = "AWARDS"
                    scraper = BundAwardsScraper(config)
                elif source_up == "OEFFENTLICHE_VERGABE":
                    scraper = OeffentlicheVergabeScraper(config)
                elif source_up == "TED_AWARDS":
                    scraper = TEDAwardsScraper(config)
                elif source_up == "DELOITTE":
                    scraper = DeloitteScraper(50)
                elif source_up == "ACCENTURE":
                    scraper = AccentureScraper(50)
                elif source_up.startswith("PORSCHE"):
                    division = source_up.split("_")[1] if "_" in source_up else "5305"
                    category = "COMPETITOR" if division == "5305" else "TARGET_COMPANY"
                    scraper = PorscheScraper(division, category, 50)
                elif source_up == "WAVESTONE":
                    scraper = WavestoneScraper(50)
                else:
                    raise ValueError(f"Unknown source: {source}")

                async with SessionLocal() as db:
                    job = await db.get(CrawlerJobORM, job_id)
                    if job:
                        job.status = "running"
                        await db.commit()

                results, stop_reason = await scraper.scrape(supplier_name)
                job_service = JobOfferService()
                tender_service = TenderNoticeService()
                
                async with SessionLocal() as db:
                    for item in results:
                        if isinstance(item, JobOffer):
                            payload = {
                                "external_id": item.external_id,
                                "source_system": item.source_system,
                                "title": item.title,
                                "employer": item.employer,
                                "location": item.location,
                                "salary_group": item.salary_group,
                                "description": item.description,
                                "link": item.link,
                                "deadline_at": item.deadline_at,
                                "category": getattr(item, "category", "PUBLIC_SECTOR"),
                                "is_public": getattr(item, "is_public", True)
                            }
                            await job_service.upsert_job_offer(db, payload)
                        elif isinstance(item, dict) and item.get("external_id"):
                            await job_service.upsert_job_offer(db, item)
                        elif isinstance(item, TenderWinningNotice):
                            payload = {
                                "external_id": item.external_id,
                                "source_system": item.source_system,
                                "title": item.title,
                                "contracting_authority": item.contracting_authority,
                                "cpv_code": item.cpv_code,
                                "location_nuts": item.location_nuts,
                                "winner_name": item.winner_name,
                                "winner_address": item.winner_address,
                                "winner_id": item.winner_id,
                                "contract_value": item.contract_value,
                                "currency": item.currency,
                                "description": item.description,
                                "link": item.link,
                                "publication_date": item.publication_date
                            }
                            await tender_service.upsert_winning_notice(db, payload)
                    
                    job = await db.get(CrawlerJobORM, job_id)
                    if job:
                        job.status = "completed"
                        job.tenders_found = len(results)
                        job.tenders_processed = len(results)
                        job.end_time = _utcnow()
                        await db.commit()

                logger.info(f"✅ Job {job_id} finished: {len(results)} items found")
                return {"status": "success", "count": len(results), "job_id": job_id}

            except Exception as e:
                logger.error(f"❌ Job {job_id} failed: {e}", exc_info=True)
                async with SessionLocal() as db:
                    job = await db.get(CrawlerJobORM, job_id)
                    if job:
                        job.status = "failed"
                        job.error_message = str(e)[:500]
                        job.end_time = _utcnow()
                        await db.commit()
                return {"status": "error", "message": str(e), "job_id": job_id}

crawler_executor = CrawlerExecutor()
