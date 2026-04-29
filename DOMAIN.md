# 🧠 Domain Model: Supplier Rating Context

> **Context Type:** Supporting Domain
> **Sovereignty:** Full (Private Database, Independent Tests)
> **Owner:** Roman (Product Management)

---

## 1. Bounded Context Purpose

The Supplier Rating context (also known as Portal Scraper) is responsible for the **automated monitoring and evaluation of suppliers** across diverse enterprise portals (SAP Ariba, JAGGAER, etc.). It manages the secure credentials required for portal access and normalizes external performance data into a unified internal rating.

## 2. 🧱 Entities

### PortalCredential (Aggregate Root)
- **Identity**: `portal_id` + `account_id`.
- **Attributes**: `portal_type` (ARIBA, JAGGAER, ONVENTIS), `username`, `encrypted_password`, `two_fa_secret`, `last_login_at`.
- **Behavior**: Used by the Scraper Engine to authenticate sessions.
- **Invariant**: Passwords must never be stored in plain text.

### SupplierRating
- **Identity**: `supplier_id` + `portal_type`.
- **Attributes**: `raw_score`, `normalized_score` (0-100), `status` (CERTIFIED, REJECTED, PENDING), `scraped_at`.
- **Lifecycle**: Updated periodically by background scraping jobs.

### ScrapingJob
- **Identity**: `job_id`.
- **Attributes**: `target_supplier`, `portal_type`, `current_step` (LOGIN, SEARCH, EXTRACT, LOGOUT), `status` (RUNNING, SUCCESS, FAILED), `error_log`.

## 3. 💎 Value Objects

### PortalMetadata
- **Values**: `portal_name`, `base_url`, `is_active`.
*   **Purpose**: Configuration for the specific portal instance.

### RatingNormalizer
- **Logic**: Rules to convert portal-specific metrics (e.g., "A-Supplier") into the internal 0-100 `normalized_score`.

## 4. 📝 Business Rules (Invariants)

- **Security First**: All portal credentials must be encrypted at rest using the system's Master Key.
- **Rate Limiting**: Scrapers must adhere to portal-specific "Human-Mimic" delays to avoid IP blacklisting.
- **Normalization Consistency**: Ratings from different portals are weighted based on the portal's authority (e.g., SAP Ariba might weigh more than a smaller local portal).
- **Session Persistence**: Successful sessions (cookies) should be persisted to minimize login attempts.

---
*Maintained by Roman | Tender Finder 2.0*
