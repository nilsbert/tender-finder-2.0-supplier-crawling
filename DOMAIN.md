# 🧠 Domain Model: Supplier Crawling Context

> **Context Type:** Supporting Domain
> **Sovereignty:** Full (Private Database, Independent Tests)
> **Owner:** Roman (Product Management)

---

## 1. Bounded Context Purpose

The Supplier Crawling context discovers and extracts supplier data from enterprise portals. To ensure seamless integration with the **Enrichment MS**, it uses the standard **Tender Domain Model**. This allows "Supplier Profiles" to be processed, summarized, and matched using the same pipeline as procurement notices.

## 2. 🧱 Entities

### PortalCredential (Aggregate Root)
- **Identity**: `portal_id` + `account_id`.
- **Attributes**: `portal_type` (ARIBA, JAGGAER), `username`, `encrypted_password`.
- **Behavior**: Used by the Crawling Engine to authenticate.

### Tender (Supplier Profile Mapping)
- **Identity**: `external_id` (e.g., Ariba Supplier ID).
- **Attributes**:
    - `title`: Company Name.
    - `description`: Scraped profile description.
    - `source_system`: e.g., `ARIBA_PORTAL`.
    - `notice_type`: Fixed to `SUPPLIER_PROFILE`.
    - `portal_specific_data`: JSON field containing ratings, certificates, and compliance scores.
- **Lifecycle**: Mapped from portal-specific HTML to the standard Tender schema.

### CrawlingJob
- **Identity**: `job_id`.
- **Attributes**: `target_supplier`, `portal_type`, `status`.

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
