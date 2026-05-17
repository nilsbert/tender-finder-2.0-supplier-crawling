import logging
from datetime import datetime

from playwright.async_api import async_playwright

from core.scrapers.base import BaseScraper

logger = logging.getLogger("deloitte-scraper")


class DeloitteScraper(BaseScraper):
    def __init__(self, max_jobs: int = 50):
        super().__init__({"max_jobs": max_jobs}, "DELOITTE")
        self.url = "https://job.deloitte.com/search?results_pp=50"
        self.company_name = "Deloitte"
        self.category = "COMPETITOR"

    async def scrape(self, supplier_name: str = "") -> tuple[list[dict], str]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            logger.info(f"🌐 Navigating to Deloitte: {self.url}")
            await page.goto(self.url, wait_until="networkidle")

            rows = await page.query_selector_all("li.job-list-item")
            job_links = []
            for row in rows[: self.max_jobs]:
                title_el = await row.query_selector("a.text-d-blue.text-sm.font-semibold")
                if title_el:
                    link = await title_el.get_attribute("href")
                    if link and not link.startswith("http"):
                        link = "https://job.deloitte.com" + link
                    job_links.append(link)

            for link in job_links:
                try:
                    await page.goto(link, wait_until="networkidle")
                    title_el = await page.query_selector("h1")
                    title = await title_el.inner_text() if title_el else "Unknown Title"

                    desc_el = await page.query_selector(".job-description")
                    description = await desc_el.inner_text() if desc_el else ""

                    loc_el = await page.query_selector(".location") or await page.query_selector(
                        "div.text-xs.text-d-blue.mb-2"
                    )
                    location = await loc_el.inner_text() if loc_el else "Unknown"

                    results.append(
                        {
                            "external_id": f"deloitte-{link.split('/')[-1]}",
                            "source_system": "DELOITTE",
                            "title": title.strip(),
                            "employer": self.company_name,
                            "location": location.strip(),
                            "link": link,
                            "description": description.strip(),
                            "category": self.category,
                            "is_public": True,
                            "scraped_at": datetime.now().isoformat(),
                        }
                    )
                except Exception as e:
                    logger.error(f"Error scraping Deloitte detail page {link}: {e}")

            await browser.close()
        return results, "success"
