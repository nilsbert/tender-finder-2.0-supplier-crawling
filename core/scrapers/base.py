import os
import logging
from abc import ABC, abstractmethod
from typing import Optional, Callable
from datetime import datetime, timezone

from models.job_offer import JobOffer

logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    """
    Base class for job scrapers.
    """
    def __init__(self, config: dict = None, source_name: str = "", output_dir: str = "scraped_jobs"):
        self.config = config or {}
        self.source_name = source_name
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.max_jobs = self.config.get("max_jobs", 2000)
        logger.info(f"Initialized {source_name} scraper. max_jobs={self.max_jobs}")

    @abstractmethod
    async def scrape(self, supplier_name: str = "", progress_callback: Optional[Callable[[int, int], None]] = None) -> tuple[list[JobOffer], str]:
        """
        Scrape job offers or awards.
        """
        pass

    @staticmethod
    def now_utc() -> datetime:
        return datetime.now(timezone.utc).replace(tzinfo=None)
