import io
import json
import logging
import zipfile
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional

import httpx
from models.tender_winning_notice import TenderWinningNotice

from core.scrapers.base import BaseScraper

logger = logging.getLogger("oeffentliche-vergabe-scraper")


class OeffentlicheVergabeScraper(BaseScraper):
    def __init__(self, config: dict):
        super().__init__(config, "OEFFENTLICHE_VERGABE")
        self.api_url = "https://oeffentlichevergabe.de/api/notice-exports"

    async def scrape(
        self, pub_day: Optional[str] = None, progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> tuple[list[TenderWinningNotice], str]:
        """
        Scrape OCDS award notices from oeffentlichevergabe.de Open Data API.
        If pub_day is not provided, defaults to yesterday.
        Format: YYYY-MM-DD
        """
        if not pub_day:
            yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
            pub_day = yesterday

        params = {"pubDay": pub_day, "format": "ocds.zip"}

        logger.info(f"📡 Fetching OCDS export for {pub_day} from {self.api_url}")

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.get(self.api_url, params=params)
                if response.status_code == 404:
                    logger.warning(f"No export found for {pub_day}")
                    return [], f"no_export_found_for_{pub_day}"
                response.raise_for_status()
                zip_data = response.content
        except Exception as e:
            logger.error(f"Failed to fetch OCDS export: {e}")
            return [], f"error_fetching_export: {str(e)}"

        notices = []
        try:
            with zipfile.ZipFile(io.BytesIO(zip_data)) as z:
                json_files = [f for f in z.namelist() if f.endswith(".json")]
                total_files = len(json_files)
                logger.info(f"📦 Extracting {total_files} JSON files from export zip")

                for i, filename in enumerate(json_files):
                    with z.open(filename) as f:
                        data = json.load(f)
                        extracted = self._parse_ocds_release(data)
                        if extracted:
                            notices.extend(extracted)

                    if progress_callback and i % 10 == 0:
                        progress_callback(i + 1, total_files)

        except Exception as e:
            logger.error(f"Failed to process OCDS zip: {e}")
            return [], f"error_processing_zip: {str(e)}"

        logger.info(f"✅ Successfully processed OCDS export. Found {len(notices)} award notices.")
        return notices, "completed"

    def _parse_ocds_release(self, data: dict) -> list[TenderWinningNotice]:
        """
        Parses an OCDS release/record into TenderWinningNotice objects.
        Focuses on 'award' tags.
        """
        notices = []
        releases = data.get("releases", [])
        if not releases and "ocid" in data:
            releases = [data]  # Single release object

        for release in releases:
            # We are interested in awards
            awards = release.get("awards", [])
            if not awards:
                continue

            ocid = release.get("ocid")
            title = release.get("tender", {}).get("title", "No Title")
            contracting_authority = release.get("buyer", {}).get("name", "Unknown Authority")

            # CPV Code
            cpv = None
            items = release.get("tender", {}).get("items", [])
            if items:
                cpv = items[0].get("classification", {}).get("id")

            # NUTS Code
            nuts = release.get("tender", {}).get("deliveryAddresses", [{}])[0].get("region")  # OCDS extension usually
            if not nuts:
                nuts = release.get("tender", {}).get("mainProcurementCategory")  # Fallback

            for award in awards:
                if award.get("status") != "active":
                    continue  # Only active (successful) awards

                winner = award.get("suppliers", [{}])[0]
                winner_name = winner.get("name")
                winner_id = winner.get("id")

                # Winner Address
                addr = winner.get("address", {})
                winner_address = f"{addr.get('streetAddress', '')}, {addr.get('postalCode', '')} {addr.get('locality', '')}, {addr.get('countryName', '')}".strip(
                    ", "
                )

                value_obj = award.get("value", {})
                contract_value = value_obj.get("amount")
                currency = value_obj.get("currency")

                notice = TenderWinningNotice(
                    external_id=f"{ocid}-{award.get('id')}",
                    source_system=self.source_name,
                    title=title,
                    contracting_authority=contracting_authority,
                    cpv_code=cpv,
                    location_nuts=nuts,
                    winner_name=winner_name,
                    winner_id=winner_id,
                    winner_address=winner_address if winner_address else None,
                    contract_value=contract_value,
                    currency=currency,
                    description=award.get("description") or release.get("tender", {}).get("description"),
                    link=f"https://oeffentlichevergabe.de/ui/de/tenderdetails/{ocid}",  # Standard URL pattern
                    publication_date=self._parse_date(release.get("date")),
                    crawled_at=self.now_utc(),
                )
                notices.append(notice)

        return notices

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        if not date_str:
            return None
        try:
            # OCDS dates are usually ISO 8601
            return datetime.fromisoformat(date_str.replace("Z", "+00:00")).replace(tzinfo=None)
        except:
            return None
