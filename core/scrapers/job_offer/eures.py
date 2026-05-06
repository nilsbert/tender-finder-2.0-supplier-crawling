import asyncio
import logging
from typing import Callable, Optional

from playwright.async_api import async_playwright

from models.job_offer import JobOffer
from core.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class EuresScraper(BaseScraper):
    def __init__(self, config: dict):
        # We allow config to override the specific country
        self.country = config.get("country", "de,at,ch")
        source_id = f"EURES_{self.country.upper().replace(',', '_')}"
        super().__init__(config, source_id)
        # Base URL for search
        self.search_url_template = "https://europa.eu/eures/portal/jv-se/search?page=1&resultsPerPage=50&orderBy=BEST_MATCH&locationCodes={country}&keyword={keyword}&lang=en"

    async def scrape(self, supplier_name: str, progress_callback: Optional[Callable[[int, int], None]] = None) -> tuple[list[JobOffer], str]:
        offers = []
        stop_reason = "completed"

        # Determine starting URL
        if supplier_name.startswith("http"):
            search_url = supplier_name
        else:
            # If supplier_name is just a keyword or empty
            keyword = supplier_name if supplier_name else ""
            search_url = self.search_url_template.format(country=self.country, keyword=keyword)

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
            page = await context.new_page()

            try:
                logger.info(f"Navigating to EURES: {search_url}")
                await page.goto(search_url, wait_until="networkidle")

                page_num = 1
                while len(offers) < self.max_jobs:
                    logger.info(f"Scraping EURES page {page_num}...")

                    # Wait for results to load
                    try:
                        await page.wait_for_selector('.jv-result-item', timeout=10000)
                    except Exception:
                        if page_num == 1:
                            logger.info("No results found on EURES.")
                            return [], "no_results"
                        break

                    # Extract results
                    items = await page.query_selector_all('.jv-result-item')
                    page_offers = []

                    for item in items:
                        if len(offers) + len(page_offers) >= self.max_jobs:
                            stop_reason = "max_jobs"
                            break

                        try:
                            # Employer
                            employer_el = await item.query_selector('.jv-result-summary-employer')
                            employer = await employer_el.inner_text() if employer_el else ""

                            # Title
                            title_el = await item.query_selector('.jv-result-summary-title')
                            title = await title_el.inner_text() if title_el else ""
                            link = await title_el.get_attribute('href') if title_el else ""
                            if link and not link.startswith('http'):
                                link = "https://europa.eu" + link

                            # Location
                            location_el = await item.query_selector('.jv-result-summary-location')
                            location = await location_el.inner_text() if location_el else ""

                            # ID
                            external_id = f"EURES-{link.split('/')[-1]}" if link else f"EURES-{hash(title+employer)}"

                            offer = JobOffer(
                                external_id=external_id,
                                source_system=self.source_id,
                                title=title.strip(),
                                employer=employer.strip(),
                                location=location.strip(),
                                link=link,
                                crawled_at=self.now_utc()
                            )
                            page_offers.append(offer)
                        except Exception as e:
                            logger.warning(f"Failed to parse EURES item: {e}")
                            continue

                    # Extract descriptions for this page
                    for offer in page_offers:
                        if offer.link:
                            try:
                                logger.info(f"Extracting detail for EURES job {offer.external_id}...")
                                detail_page = await context.new_page()
                                await detail_page.goto(offer.link, wait_until="networkidle")
                                await asyncio.sleep(2)  # Wait for Angular

                                # EURES description can be in various ecl components
                                desc_el = await detail_page.query_selector("app-job-details, .ecl-u-type-paragraph, .ecl-article")
                                if desc_el:
                                    offer.description = await desc_el.inner_text()

                                await detail_page.close()
                            except Exception as e:
                                logger.warning(f"Failed to extract detail for EURES {offer.link}: {e}")
                                if 'detail_page' in locals():
                                    await detail_page.close()

                    offers.extend(page_offers)
                    if progress_callback:
                        progress_callback(len(offers), self.max_jobs)

                    if len(offers) >= self.max_jobs:
                        break

                    # Pagination
                    next_btn = await page.query_selector('a[aria-label="ecl.pagination.GO-TO-NEXT-PAGE"]')
                    if next_btn and await next_btn.is_visible():
                        logger.info("Found 'Next' button on EURES, navigating...")
                        await next_btn.click()
                        await page.wait_for_load_state("networkidle")
                        await asyncio.sleep(3)
                        page_num += 1
                    else:
                        logger.info("No 'Next' button found on EURES.")
                        break

                logger.info(f"Finished EURES scrape. Total: {len(offers)}")

            except Exception as e:
                logger.error(f"Scrape failed for EURES: {e}")
                stop_reason = "failed"
            finally:
                await browser.close()

        return offers, stop_reason
