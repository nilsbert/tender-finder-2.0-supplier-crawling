# 🧠 Domain Model: Supplier Crawling Context

> **Context Type:** Supporting Domain
> **Sovereignty:** Full (Private Database, Independent Tests)
> **Owner:** Roman (Product Management)

---

## 1. Bounded Context Purpose

The Supplier Crawling context is responsible for the **automated discovery and extraction of data** from diverse enterprise portals (SAP Ariba, JAGGAER, etc.). It manages the secure credentials required for portal access and crawls external portals to fetch supplier profiles, certificates, and performance indicators.

## 2. 🧱 Entities

### PortalCredential (Aggregate Root)
- **Identity**: `portal_id` + `account_id`.
- **Attributes**: `portal_type` (ARIBA, JAGGAER, ONVENTIS), `username`, `encrypted_password`, `two_fa_secret`, `last_login_at`.
- **Behavior**: Used by the Crawling Engine to authenticate sessions.
- **Invariant**: Passwords must never be stored in plain text.

### ScrapedSupplierData
- **Identity**: `supplier_id` + `portal_type`.
- **Attributes**: `raw_data_json`, `scraped_at`, `source_url`.
- **Lifecycle**: Updated periodically by background crawling jobs.

### CrawlingJob
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
