import logging
import re
import uuid

from playwright.async_api import async_playwright

from core.scrapers.base import BaseScraper

logger = logging.getLogger("porsche-scraper")


class PorscheScraper(BaseScraper):
    def __init__(self, division: str, category: str, max_jobs: int = 50):
        crawler_id = f"PORSCHE_{division}"
        company_name = "Porsche Consulting" if division == "5305" else "Porsche AG (Target)"
        super().__init__({"max_jobs": max_jobs}, crawler_id)
        self.division = division
        self.category = category
        self.company_name = company_name
        self.url = f"https://jobs.porsche.com/index.php?ac=search_result&search_criterion_division%5B%5D={division}&search_criterion_channel%5B%5D=12"

    async def scrape(self, supplier_name: str = "") -> tuple[list[dict], str]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            logger.info(f"🌐 Navigating to Porsche ({self.division}): {self.url}")
            await page.goto(self.url, wait_until="networkidle")

            rows = await page.query_selector_all("table.jobad-list tr")
            job_links = []
            for row in rows:
                link_el = await row.query_selector("a[href*='ac=jobad']")
                if link_el:
                    link = await link_el.get_attribute("href")
                    if link and not link.startswith("http"):
                        link = "https://jobs.porsche.com/" + link
                    job_links.append(link)
                if len(job_links) >= self.max_jobs:
                    break

            for link in job_links:
                try:
                    await page.goto(link, wait_until="networkidle")
                    title_el = await page.query_selector("h1")
                    title = await title_el.inner_text() if title_el else "Unknown Title"

                    desc_el = await page.query_selector(".jobad-main-content")
                    description = await desc_el.inner_text() if desc_el else ""

                    location = "Germany"  # Default

                    match = re.search(r"id=(\d+)", link)
                    external_id = match.group(1) if match else str(uuid.uuid4())

                    results.append(
                        {
                            "external_id": f"porsche-{self.division}-{external_id}",
                            "source_system": self.source_name,
                            "title": title.strip(),
                            "employer": self.company_name,
                            "location": location,
                            "link": link,
                            "description": description.strip(),
                            "category": self.category,
                            "is_public": True,
                        }
                    )
                except Exception as e:
                    logger.error(f"Error scraping Porsche detail page {link}: {e}")

            await browser.close()
        return results, "success"
