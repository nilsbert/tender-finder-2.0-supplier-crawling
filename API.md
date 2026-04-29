# 🛠️ Public Interface: Supplier Crawling API

> **Base Path:** `/api/v1`
> **Port:** 8007
> **Standard**: Matches Crawling MS API for plug-and-play Enrichment sync.

---

## 📡 Endpoints

### 1. GET /health
Standard health check.

---

### 2. GET /api/v1/tenders
Fetch scraped supplier profiles mapped to the **Tender schema**.
- **Consumer**: Enrichment MS (Sync Worker)

#### Response (200)
```json
[
  {
    "id": "uuid",
    "external_id": "ARIBA-123",
    "source_system": "ARIBA_PORTAL",
    "title": "Siemens AG",
    "description": "Global technology powerhouse...",
    "notice_type": "SUPPLIER_PROFILE",
    "metadata_info": {
      "portal_specific_data": {
        "rating": 95,
        "certificates": ["ISO 9001", "ISO 14001"],
        "status": "Preferred"
      }
    },
    "crawled_at": "ISO8601"
  }
]
```

---

### 3. POST /api/v1/sync-request
Trigger an on-demand crawl for a supplier.

#### Request Body
```json
{
  "supplier_name": "Siemens AG",
  "vat_id": "DE123456789",
  "portals": ["ARIBA", "JAGGAER"]
}
```

---

## 🔗 Integration with Enrichment MS

The Supplier Crawling MS will push new raw data to the Enrichment MS.

**Webhook / Event:** `SUPPLIER_DATA_CRAWLED`
**Payload:**
```json
{
  "supplier_id": "string",
  "source_portal": "ARIBA",
  "scraped_at": "ISO8601",
  "data_snippet": "..."
}
```

---
*Maintained by the Machine Team | Tender Finder 2.0*
