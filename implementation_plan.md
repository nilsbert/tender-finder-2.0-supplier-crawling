# Implementation Plan: Supplier Job Crawler

## Goal

Provide an API for the enrichment service to request job offers for a given supplier and store them in a standardized "Job Offer" format.

## Current Status: COMPLETED ✅

### Phase 1: Foundation & Data Modeling

* [x] Create `supplier-crawling` service directory structure.
* [x] Define `JobOffer` SQLAlchemy model.
* [x] Configure SQLite with `aiosqlite` for asynchronous local storage.
* [x] Implement `JobOfferService` for persistence.

### Phase 2: Scraper Development (Playwright)

* [x] Implement `JobScraperBase` using Playwright.
* [x] Develop `InteramtScraper`: Search by supplier, extract from results table.
* [x] Develop `EuresScraper`: URL-based filtering for AT, DE, CH, extract job metadata.
* [x] Implement error handling and no-results detection.

### Phase 3: API & Execution Layer

* [x] Implement `CrawlerExecutor` to handle concurrent scraping jobs.
* [x] Define FastAPI routes for triggering crawls and retrieving offers.
* [x] Integrate `SupplierCrawlingClient` into the `enriching` service.

### Phase 4: UI & Deployment

* [x] Create `modern_admin_v2.html` tailored for job crawling.
* [x] Update `docker-compose.yml` and `nginx.conf` for service orchestration.
* [x] Configure `Dockerfile` with Playwright and browser dependencies.
