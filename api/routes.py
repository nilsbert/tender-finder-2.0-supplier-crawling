import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.executor import crawler_executor
from core.job_offer_service import JobOfferService
from core.tender_notice_service import TenderNoticeService
from core.supplier_service import SupplierService
from models.job import CrawlerJobORM
from api.schemas import JobOfferSchema, TenderWinningNoticeSchema

router = APIRouter()
logger = logging.getLogger("api-routes")

@router.get("/supplier/caller-history")
async def get_caller_history(caller_name: str, portal: str = "ted", db: AsyncSession = Depends(get_db)):
    """
    JIT search for past awards of a contracting authority.
    Uses local cache if available.
    """
    service = SupplierService(db)
    caller_id = await service.resolve_caller_id(caller_name, portal=portal)
    history = await service.get_caller_history(caller_name, portal=portal)
    return {
        "caller_id": caller_id,
        "history": history
    }


@router.post("/crawl/interamt")
async def crawl_interamt(background_tasks: BackgroundTasks, supplier: Optional[str] = None, max_jobs: int = 2000):
    """
    Trigger a crawl for a specific supplier on Interamt.
    """
    if not supplier:
        supplier = "https://interamt.de/koop/app/trefferliste?3"

    background_tasks.add_task(
        crawler_executor.run_crawler,
        source="INTERAMT",
        supplier_name=supplier,
        config={"max_jobs": max_jobs}
    )
    return {"message": f"Crawl for {supplier} on Interamt started in background"}


@router.post("/crawl/eures")
async def crawl_eures(background_tasks: BackgroundTasks, supplier: Optional[str] = None, max_jobs: int = 500, country: str = "de,at,ch"):
    """
    Trigger a crawl for a specific supplier on EURES (Default: DE, AT, CH).
    """
    if not supplier:
        supplier = f"https://europa.eu/eures/portal/jv-se/search?page=1&resultsPerPage=10&orderBy=BEST_MATCH&locationCodes={country}&lang=en"

    background_tasks.add_task(
        crawler_executor.run_crawler,
        source="EURES",
        supplier_name=supplier,
        config={"max_jobs": max_jobs, "country": country}
    )
    return {"message": f"Crawl for {supplier} on EURES ({country}) started in background"}


@router.post("/crawl/eures/de")
async def crawl_eures_de(background_tasks: BackgroundTasks, max_jobs: int = 500):
    return await crawl_eures(background_tasks, country="de", max_jobs=max_jobs)


@router.post("/crawl/eures/at")
async def crawl_eures_at(background_tasks: BackgroundTasks, max_jobs: int = 500):
    return await crawl_eures(background_tasks, country="at", max_jobs=max_jobs)


@router.post("/crawl/eures/ch")
async def crawl_eures_ch(background_tasks: BackgroundTasks, max_jobs: int = 500):
    return await crawl_eures(background_tasks, country="ch", max_jobs=max_jobs)


@router.post("/crawl/bund/jobs")
async def crawl_bund_jobs(background_tasks: BackgroundTasks, max_jobs: int = 500):
    rss_url = "https://www.service.bund.de/Content/Globals/Functions/RSSFeed/RSSGenerator_Stellen.xml"
    background_tasks.add_task(
        crawler_executor.run_crawler,
        source="BUND_JOBS",
        supplier_name=rss_url,
        config={"max_jobs": max_jobs, "type": "JOBS"}
    )
    return {"message": "Bund Jobs crawl started in background"}


@router.post("/crawl/bund/awards")
async def crawl_bund_awards(background_tasks: BackgroundTasks, max_jobs: int = 500):
    rss_url = "https://www.service.bund.de/Content/Globals/Functions/RSSFeed/RSSGenerator_Vergebene_Auftraege.xml"
    background_tasks.add_task(
        crawler_executor.run_crawler,
        source="BUND_AWARDS",
        supplier_name=rss_url,
        config={"max_jobs": max_jobs, "type": "AWARDS"}
    )
    return {"message": "Bund Awards crawl started in background"}


@router.post("/crawl/oeffentliche-vergabe")
async def crawl_oeffentliche_vergabe(background_tasks: BackgroundTasks, pub_day: Optional[str] = None):
    """
    Trigger a sync for oeffentlichevergabe.de Open Data (OCDS).
    pub_day format: YYYY-MM-DD (defaults to yesterday)
    """
    background_tasks.add_task(
        crawler_executor.run_crawler,
        source="OEFFENTLICHE_VERGABE",
        supplier_name=pub_day or "latest",
        config={}
    )
    return {"message": f"Oeffentliche Vergabe OCDS sync ({pub_day or 'latest'}) started in background"}


@router.post("/crawl/ted")
async def crawl_ted_awards(background_tasks: BackgroundTasks, countries: str = "DE,AT,CH", max_jobs: int = 500):
    """
    Trigger a crawl for TED Award Notices (DE, AT, CH).
    """
    background_tasks.add_task(
        crawler_executor.run_crawler,
        source="TED_AWARDS",
        supplier_name=countries,
        config={"max_jobs": max_jobs}
    )
    return {"message": f"TED Awards crawl for {countries} started in background"}


@router.post("/crawl/deloitte")
async def crawl_deloitte(background_tasks: BackgroundTasks, max_jobs: int = 50):
    background_tasks.add_task(crawler_executor.run_crawler, source="DELOITTE", supplier_name="Deloitte", config={"max_jobs": max_jobs})
    return {"message": "Deloitte crawl started in background"}

@router.post("/crawl/accenture")
async def crawl_accenture(background_tasks: BackgroundTasks, max_jobs: int = 50):
    background_tasks.add_task(crawler_executor.run_crawler, source="ACCENTURE", supplier_name="Accenture", config={"max_jobs": max_jobs})
    return {"message": "Accenture crawl started in background"}

@router.post("/crawl/porsche/competitor")
async def crawl_porsche_comp(background_tasks: BackgroundTasks, max_jobs: int = 50):
    background_tasks.add_task(crawler_executor.run_crawler, source="PORSCHE_5305", supplier_name="Porsche Consulting", config={"max_jobs": max_jobs})
    return {"message": "Porsche Consulting (Competitor) crawl started in background"}

@router.post("/crawl/porsche/target")
async def crawl_porsche_target(background_tasks: BackgroundTasks, max_jobs: int = 50):
    background_tasks.add_task(crawler_executor.run_crawler, source="PORSCHE_3167", supplier_name="Porsche AG", config={"max_jobs": max_jobs})
    return {"message": "Porsche AG (Target) crawl started in background"}

@router.post("/crawl/wavestone")
async def crawl_wavestone(background_tasks: BackgroundTasks, max_jobs: int = 50):
    background_tasks.add_task(crawler_executor.run_crawler, source="WAVESTONE", supplier_name="Wavestone", config={"max_jobs": max_jobs})
    return {"message": "Wavestone crawl started in background"}

@router.post("/crawl/all")
async def crawl_all(background_tasks: BackgroundTasks, max_jobs: int = 2000):
    """
    Trigger a global crawl for all available job offers and award notices.
    """
    async def run_all_parallel():
        tasks = [
            crawler_executor.run_crawler("INTERAMT", "Global", {"max_jobs": max_jobs}),
            crawler_executor.run_crawler("EURES", "DE", {"max_jobs": max_jobs, "country": "de"}),
            crawler_executor.run_crawler("EURES", "AT", {"max_jobs": max_jobs, "country": "at"}),
            crawler_executor.run_crawler("EURES", "CH", {"max_jobs": max_jobs, "country": "ch"}),
            crawler_executor.run_crawler("BUND_JOBS", "latest", {"max_jobs": max_jobs}),
            crawler_executor.run_crawler("BUND_AWARDS", "latest", {"max_jobs": max_jobs}),
            crawler_executor.run_crawler("OEFFENTLICHE_VERGABE", "latest", {}),
            crawler_executor.run_crawler("TED_AWARDS", "DE,AT,CH", {"max_jobs": max_jobs}),
            # Competitors
            crawler_executor.run_crawler("DELOITTE", "Global", {"max_jobs": 50}),
            crawler_executor.run_crawler("ACCENTURE", "DE", {"max_jobs": 50}),
            crawler_executor.run_crawler("PORSCHE_5305", "Competitor", {"max_jobs": 50}),
            crawler_executor.run_crawler("PORSCHE_3167", "Target", {"max_jobs": 50}),
            crawler_executor.run_crawler("WAVESTONE", "DE", {"max_jobs": 50})
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

    background_tasks.add_task(run_all_parallel)
    return {"message": "Global parallel crawl sequence (Public + Competitor) initiated"}


@router.get("/supplier/{supplier}/offers")
async def get_supplier_offers(supplier: str, db: AsyncSession = Depends(get_db)):
    """
    Get all job offers for a specific supplier.
    """
    service = JobOfferService()
    return await service.list_job_offers(db, supplier=supplier)


@router.get("/offers", response_model=list[JobOfferSchema])
async def get_offers(db: AsyncSession = Depends(get_db)):
    service = JobOfferService()
    return await service.list_job_offers(db)


@router.get("/awards", response_model=list[TenderWinningNoticeSchema])
async def get_awards(db: AsyncSession = Depends(get_db)):
    service = TenderNoticeService()
    return await service.list_winning_notices(db)


@router.get("/jobs")
async def list_jobs(db: AsyncSession = Depends(get_db)):
    """
    List recent crawler jobs.
    """
    stmt = select(CrawlerJobORM).order_by(CrawlerJobORM.start_time.desc()).limit(50)
    result = await db.execute(stmt)
    return result.scalars().all()
