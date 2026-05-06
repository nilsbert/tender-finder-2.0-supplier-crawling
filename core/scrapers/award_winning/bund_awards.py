
import logging
import xml.etree.ElementTree as ET
from typing import Optional, Callable, Union

import httpx
from playwright.async_api import async_playwright

from core.scrapers.base import BaseScraper
from models.job_offer import JobOffer
from models.tender_winning_notice import TenderWinningNotice

logger = logging.getLogger("bund-scraper")


class BundScraper(BaseScraper):
    def __init__(self, config: dict):
        self.type = config.get("type", "JOBS")  # JOBS or AWARDS
        source_name = f"BUND_{self.type}"
        super().__init__(config, source_name)
        self.max_jobs = config.get("max_jobs", 500)

    async def scrape(self, rss_url: str = "latest", progress_callback: Optional[Callable[[int, int], None]] = None) -> tuple[Union[list[JobOffer], list[TenderWinningNotice]], str]:
        results = []
        stop_reason = "completed"

        if rss_url == "latest":
            if self.type == "AWARDS":
                rss_url = "https://www.service.bund.de/Content/Globals/Functions/RSSFeed/RSSGenerator_Ausschreibungen.xml"
            else:
                rss_url = "https://www.service.bund.de/Content/Globals/Functions/RSSFeed/RSSGenerator_Stellen.xml"

        logger.info(f"📡 Fetching RSS feed: {rss_url}")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(rss_url)
                resp.raise_for_status()
                root = ET.fromstring(resp.content)
        except Exception as e:
            logger.error(f"Failed to fetch or parse RSS: {e}")
            return [], f"error: {str(e)}"

        items = root.findall(".//item")
        total_items = min(len(items), self.max_jobs)
        logger.info(f"🔍 Found {len(items)} items in RSS. Processing up to {total_items}...")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
            page = await context.new_page()

            for i, item in enumerate(items[:total_items]):
                title = item.findtext("title")
                link = item.findtext("link")
                description_html = item.findtext("description")
                guid = item.findtext("guid")

                # Extract metadata from RSS description HTML
                employer = ""
                location = ""
                if description_html:
                    # Simple extraction for Bund RSS format
                    if "Arbeitgeber:" in description_html:
                        employer = description_html.split("Arbeitgeber:")[1].split("<")[0].strip()
                    elif "Vergabestelle:" in description_html:
                        employer = description_html.split("Vergabestelle:")[1].split("<")[0].strip()
                    
                    if "Ort:" in description_html:
                        location = description_html.split("Ort:")[1].split("<")[0].strip()
                    elif "Erfüllungsort:" in description_html:
                        location = description_html.split("Erfüllungsort:")[1].split("<")[0].strip()

                logger.info(f"[{i+1}/{total_items}] Visiting {link}")
                
                full_description = ""
                try:
                    await page.goto(link, wait_until="domcontentloaded", timeout=30000)
                    content_element = await page.query_selector("div.content") or await page.query_selector("div#content")
                    if content_element:
                        full_description = await content_element.inner_text()
                except Exception as e:
                    logger.warning(f"Could not extract full description for {link}: {e}")
                    full_description = description_html or ""

                if self.type == "AWARDS":
                    item = TenderWinningNotice(
                        external_id=guid or link,
                        source_system=self.source_name,
                        title=title or "No Title",
                        contracting_authority=employer or "Unknown",
                        description=full_description,
                        link=link,
                        crawled_at=self.now_utc()
                    )
                else:
                    item = JobOffer(
                        external_id=guid or link,
                        source_system=self.source_name,
                        title=title or "No Title",
                        employer=employer or "Unknown",
                        location=location or "Unknown",
                        description=full_description,
                        link=link,
                        crawled_at=self.now_utc()
                    )
                
                results.append(item)

                if progress_callback:
                    progress_callback(i + 1, total_items)

            await browser.close()

        return results, stop_reason
