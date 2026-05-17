import logging

from playwright.async_api import async_playwright

from core.scrapers.base import BaseScraper

logger = logging.getLogger("wavestone-scraper")


class WavestoneScraper(BaseScraper):
    def __init__(self, max_jobs: int = 50):
        super().__init__({"max_jobs": max_jobs}, "WAVESTONE")
        self.url = "https://germany-career.wavestone.com/jobs"
        self.company_name = "Wavestone"
        self.category = "COMPETITOR"

    async def scrape(self, supplier_name: str = "") -> tuple[list[dict], str]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            logger.info(f"🌐 Navigating to Wavestone: {self.url}")
            await page.goto(self.url, wait_until="networkidle")

            rows = await page.query_selector_all("a.job-title") or await page.query_selector_all(".job-item a")
            job_links = []
            for row in rows[: self.max_jobs]:
                link = await row.get_attribute("href")
                if link and not link.startswith("http"):
                    link = "https://germany-career.wavestone.com" + link
                job_links.append(link)

            for link in job_links:
                try:
                    await page.goto(link, wait_until="networkidle")
                    title_el = await page.query_selector("h1")
                    title = await title_el.inner_text() if title_el else "Unknown Title"

                    desc_el = await page.query_selector(".job-description") or await page.query_selector(".content")
                    description = await desc_el.inner_text() if desc_el else ""

                    results.append(
                        {
                            "external_id": f"wavestone-{hash(link)}",
                            "source_system": "WAVESTONE",
                            "title": title.strip(),
                            "employer": self.company_name,
                            "location": "Germany",
                            "link": link,
                            "description": description.strip(),
                            "category": self.category,
                            "is_public": True,
                        }
                    )
                except Exception as e:
                    logger.error(f"Error scraping Wavestone detail page {link}: {e}")

            await browser.close()
        return results, "success"
