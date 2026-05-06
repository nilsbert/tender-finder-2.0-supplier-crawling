import logging
from playwright.async_api import async_playwright
from core.scrapers.base import BaseScraper

logger = logging.getLogger("accenture-scraper")

class AccentureScraper(BaseScraper):
    def __init__(self, max_jobs: int = 50):
        super().__init__({"max_jobs": max_jobs}, "ACCENTURE")
        self.url = "https://www.accenture.com/de-de/careers/jobsearch?jk=&sb=1&vw=0&is_rj=0&pg=1"
        self.company_name = "Accenture"
        self.category = "COMPETITOR"

    async def scrape(self, supplier_name: str = "") -> tuple[list[dict], str]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            logger.info(f"🌐 Navigating to Accenture: {self.url}")
            await page.goto(self.url, wait_until="networkidle")
            
            rows = await page.query_selector_all("a.cmp-teaser__title-link")
            job_links = []
            for row in rows[:self.max_jobs]:
                link = await row.get_attribute("href")
                if link:
                    if not link.startswith("http"):
                        link = "https://www.accenture.com" + link
                    job_links.append(link)

            for link in job_links:
                try:
                    await page.goto(link, wait_until="networkidle")
                    title_el = await page.query_selector("h1")
                    title = await title_el.inner_text() if title_el else "Unknown Title"
                    
                    desc_el = await page.query_selector(".cmp-job-description")
                    description = await desc_el.inner_text() if desc_el else ""
                    
                    loc_el = await page.query_selector(".cmp-job-listing__location") or await page.query_selector("span.cmp-teaser__location")
                    location = await loc_el.inner_text() if loc_el else "Unknown"

                    results.append({
                        "external_id": f"accenture-{link.split('/')[-1]}",
                        "source_system": "ACCENTURE",
                        "title": title.strip(),
                        "employer": self.company_name,
                        "location": location.strip(),
                        "link": link,
                        "description": description.strip(),
                        "category": self.category,
                        "is_public": True
                    })
                except Exception as e:
                    logger.error(f"Error scraping Accenture detail page {link}: {e}")

            await browser.close()
        return results, "success"
