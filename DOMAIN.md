# 🧠 Domain Model: Crawling Context

## Bounded Context Purpose
The Crawling context is responsible for the discovery and ingestion of external data. It protects the rest of the system from "dirty" exterior formats.

## 🧱 Entities
### RawTender (Aggregate Root)
- **Identity**: `source_system` + `external_id`.
- **Attributes**: `title`, `description`, `published_at`.
- **Invariants**: Must have a valid `source_url` before being emitted to the API.

## 💎 Value Objects
### ScraperConfig
- Defines the target URL and the parser rules for a specific portal.

## 📝 Business Rules (Invariants)
- **Duplicate Prevention**: A Tender is only saved if the `external_id` has not been seen in the last 6 months for that `source_system`.
- **Graceful Failure**: If a Scraper fails, the `CrawlerJob` must be marked as `FAILED` with a detailed error trace.
