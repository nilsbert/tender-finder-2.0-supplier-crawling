import asyncio
import contextlib
import logging
import re
from datetime import datetime
from typing import Callable, Optional

from models.job_offer import JobOffer
from playwright.async_api import async_playwright

from core.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class InteramtScraper(BaseScraper):
    def __init__(self, config: dict):
        super().__init__(config, "INTERAMT")
        self.base_url = "https://interamt.de/koop/app/stellensuche?1"

    async def scrape(
        self, supplier_name: str, progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> tuple[list[JobOffer], str]:
        offers = []
        stop_reason = "completed"

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            )
            page = await context.new_page()

            try:
                # 1. Navigate to Interamt (or specific list URL)
                url = supplier_name if supplier_name.startswith("http") else self.base_url
                logger.info(f"Navigating to {url}")
                await page.goto(url, wait_until="networkidle")

                # 2. Handle potential cookie consent
                with contextlib.suppress(Exception):
                    cookie_btn = page.get_by_role("button", name=re.compile(r"Akzeptieren|Zustimmen", re.I)).first
                    if await cookie_btn.is_visible():
                        await cookie_btn.click()

                # 3. Enter search text if not starting from a specific list
                if not supplier_name.startswith("http"):
                    search_field = await page.query_selector("input[name*='suchtext']")
                    if search_field:
                        if supplier_name.lower() != "global":
                            await search_field.fill(supplier_name)
                        await search_field.press("Enter")
                    else:
                        await page.keyboard.press("Enter")

                    await page.wait_for_load_state("networkidle")
                    await asyncio.sleep(3)  # Extra wait for SPA

                # 4. Load enough results via "mehr laden" button
                logger.info("Loading results...")
                while True:
                    rows = await page.query_selector_all("tr")
                    data_rows = []
                    for r in rows:
                        cols = await r.query_selector_all("td")
                        if len(cols) >= 8:
                            data_rows.append(r)

                    current_count = len(data_rows)
                    logger.info(f"Currently visible jobs: {current_count}")

                    if current_count >= self.max_jobs:
                        break

                    load_more = await page.query_selector(".ia-m-searchresults__btn-load")
                    if load_more and await load_more.is_visible():
                        logger.info("Clicking 'mehr laden'...")
                        try:
                            # Aggressively remove any blocking backdrops
                            await page.evaluate(
                                "document.querySelectorAll('.ia-e-backdrop').forEach(el => el.remove())"
                            )
                            await asyncio.sleep(0.5)
                            await load_more.click(force=True)
                        except Exception as e:
                            logger.warning(f"Forced click failed, trying evaluate: {e}")
                            await page.evaluate("document.querySelector('.ia-m-searchresults__btn-load')?.click()")

                        await asyncio.sleep(2)
                        await page.wait_for_load_state("networkidle")
                    else:
                        logger.info("No more 'load more' button found.")
                        break

                # 5. Scrape the loaded rows
                rows = await page.query_selector_all("tr")
                for row in rows:
                    if len(offers) >= self.max_jobs:
                        stop_reason = "max_jobs"
                        break

                    cols = await row.query_selector_all("td")
                    if len(cols) < 8:
                        continue

                    try:
                        id_text = await cols[0].inner_text()
                        job_id = id_text.split("\n")[0].strip()

                        title_el = await cols[0].query_selector("a")
                        link = await title_el.get_attribute("href") if title_el else ""
                        if link and not link.startswith("http"):
                            link = "https://interamt.de/koop/app/" + link.lstrip("./")

                        employer = await cols[1].inner_text()
                        title = await cols[2].inner_text()
                        salary = await cols[4].inner_text()
                        location = await cols[5].inner_text()

                        deadline_str = ""
                        for col in reversed(cols):
                            txt = await col.inner_text()
                            if re.match(r"\d{2}\.\d{2}\.\d{4}", txt.strip()):
                                deadline_str = txt.strip()
                                break

                        deadline = None
                        if deadline_str:
                            with contextlib.suppress(Exception):
                                deadline = datetime.strptime(deadline_str, "%d.%m.%Y")

                        offer = JobOffer(
                            external_id=f"INTERAMT-{job_id}",
                            source_system="INTERAMT",
                            title=title.strip(),
                            employer=employer.strip(),
                            location=location.strip(),
                            salary_group=salary.strip(),
                            link=link,
                            deadline_at=deadline,
                            crawled_at=self.now_utc(),
                        )
                        offers.append(offer)

                        if progress_callback:
                            progress_callback(len(offers), self.max_jobs)

                    except Exception as e:
                        logger.warning(f"Failed to parse row: {e}")
                        continue

                # 6. Extract detail descriptions with concurrency
                logger.info(f"Extracting details for {len(offers)} offers using concurrency...")

                async def fetch_detail(offer, index):
                    if not offer.link:
                        return
                    page_local = await context.new_page()
                    try:
                        await page_local.goto(offer.link, wait_until="domcontentloaded", timeout=30000)
                        # Small wait for dynamic content
                        await asyncio.sleep(1)
                        desc_el = await page_local.query_selector(
                            ".ia-m-stellensuche-detail__beschreibung, .ia-m-stelle__inhalt, .ia-m-stelle__beschreibung, .ia-m-stelle"
                        )
                        if desc_el:
                            offer.description = await desc_el.inner_text()
                        if (index + 1) % 10 == 0:
                            logger.info(f"Progress: {index + 1}/{len(offers)} details extracted")
                    except Exception as e:
                        logger.warning(f"Failed to extract detail for {offer.link}: {e}")
                    finally:
                        await page_local.close()

                # Process in chunks of 5 concurrent pages
                chunk_size = 5
                for i in range(0, len(offers), chunk_size):
                    chunk = offers[i : i + chunk_size]
                    tasks = [fetch_detail(offer, i + j) for j, offer in enumerate(chunk)]
                    await asyncio.gather(*tasks)

            except Exception as e:
                logger.error(f"Interamt scraping failed: {e}")
                stop_reason = "failed"
            finally:
                await browser.close()

        return offers, stop_reason
