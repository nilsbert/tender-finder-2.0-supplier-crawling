import logging
from typing import Optional, Callable
from datetime import datetime, timezone
import httpx

from core.scrapers.base import BaseScraper
from models.tender_winning_notice import TenderWinningNotice

logger = logging.getLogger("ted-awards-scraper")


class TEDAwardsScraper(BaseScraper):
    def __init__(self, config: dict):
        super().__init__(config, "TED_AWARDS")
        self.api_url = "https://api.ted.europa.eu/v3/notices/search"

    async def scrape(self, supplier_name: str = "DEU,AUT,CHE", progress_callback: Optional[Callable[[int, int], None]] = None) -> tuple[list[TenderWinningNotice], str]:
        """
        Scrape award notices from TED API for Germany, Austria, and Switzerland.
        """
        countries = supplier_name.upper().replace(" ", "").split(",")
        mapping = {"DE": "DEU", "AT": "AUT", "CH": "CHE", "GER": "DEU", "AUTRI": "AUT", "SWISS": "CHE"}
        ted_countries = [mapping.get(c, c) for c in countries]
        
        country_filter = ", ".join(ted_countries)
        query = f"place-of-performance-country-proc IN ({country_filter}) AND notice-type IN (can-standard, can-social, can-desg, can-tran)"
        
        payload = {
            "query": query,
            "fields": [
                "publication-number", 
                "notice-type", 
                "place-of-performance", 
                "notice-title", 
                "buyer-name", 
                "winner-name", 
                "total-value", 
                "total-value-cur",
                "classification-cpv",
                "publication-date"
            ],
            "pageNumber": 0,
            "limit": self.max_jobs
        }

        logger.info(f"📡 Querying TED API: {query}")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, json=payload)
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            logger.error(f"Failed to fetch from TED API: {e}")
            return [], f"error_fetching_ted: {str(e)}"

        notices = []
        ted_notices = data.get("notices", [])
        total_found = len(ted_notices)
        logger.info(f"🔍 Found {total_found} notices in TED results")

        for i, item in enumerate(ted_notices):
            pub_num = item.get("publication-number")
            
            def get_val(key, data_item=item):
                val = data_item.get(key)
                if isinstance(val, list) and len(val) > 0:
                    return val[0]
                return val

            title = get_val("notice-title")
            buyer = get_val("buyer-name")
            winner = get_val("winner-name")
            value = get_val("total-value")
            currency = get_val("total-value-cur")
            cpv = get_val("classification-cpv")
            location = get_val("place-of-performance")
            pub_date_str = get_val("publication-date")

            notice = TenderWinningNotice(
                external_id=f"TED-{pub_num}",
                source_system=self.source_name,
                title=title or "No Title",
                contracting_authority=buyer or "Unknown Authority",
                cpv_code=cpv,
                location_nuts=location,
                winner_name=winner,
                contract_value=float(value) if value else None,
                currency=currency,
                link=f"https://ted.europa.eu/en/notice/-/detail/{pub_num}",
                publication_date=self._parse_date(pub_date_str),
                crawled_at=self.now_utc()
            )
            notices.append(notice)
            
            if progress_callback:
                progress_callback(i + 1, total_found)

        return notices, "completed"

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00")).replace(tzinfo=None)
        except (ValueError, TypeError):
            return None
