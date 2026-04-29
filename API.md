# 🛠️ Public Interface: Supplier Crawling API

> **Base Path:** `/api/supplier-crawling`
> **Port:** 8007 (Proposed)
> **OpenAPI Docs:** `http://localhost:8007/docs`

---

## 📡 Endpoints

### 1. GET /health
Standard health check.

---

### 2. GET /api/supplier-crawling/credentials
List configured portal credentials (masking sensitive fields).
- **Consumer**: Admin UI

#### Response (200)
```json
{
  "credentials": [
    {
      "id": "uuid",
      "portal_type": "ARIBA",
      "username": "bot_procurement_01",
      "status": "connected",
      "last_sync": "ISO8601"
    }
  ]
}
```

### 3. POST /api/supplier-crawling/credentials
Register new portal credentials.

#### Request Body
```json
{
  "portal_type": "JAGGAER",
  "username": "string",
  "password": "string",
  "two_fa_secret": "optional_string"
}
```

---

### 4. GET /api/supplier-crawling/data/{supplier_id}
Get raw scraped data for a supplier across all monitored portals.
- **Consumer**: Enriching MS, Dashboard

#### Response (200)
```json
{
  "supplier_id": "string",
  "portal_breakdown": [
    { "portal": "ARIBA", "last_crawl": "ISO8601", "data": { "..." } },
    { "portal": "ONVENTIS", "last_crawl": "ISO8601", "data": { "..." } }
  ]
}
```

---

### 5. POST /api/supplier-crawling/sync-request
Manually trigger a crawling job for a specific supplier.

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
