# 🛠️ Public Interface: Supplier Rating API

> **Base Path:** `/api/supplier-rating`
> **Port:** 8006 (Proposed)
> **OpenAPI Docs:** `http://localhost:8006/docs`

---

## 📡 Endpoints

### 1. GET /health
Standard health check.

---

### 2. GET /api/supplier-rating/credentials
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

### 3. POST /api/supplier-rating/credentials
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

### 4. GET /api/supplier-rating/ratings/{supplier_id}
Get consolidated ratings for a supplier across all monitored portals.
- **Consumer**: Enriching MS, Dashboard

#### Response (200)
```json
{
  "supplier_id": "string",
  "overall_score": 88.5,
  "portal_breakdown": [
    { "portal": "ARIBA", "score": 90, "status": "Certified" },
    { "portal": "ONVENTIS", "score": 85, "status": "Active" }
  ]
}
```

---

### 5. POST /api/supplier-rating/sync-request
Manually trigger a scraping job for a specific supplier.

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

The Supplier Rating MS will push updates to the Enrichment MS when a rating changes significantly.

**Webhook / Event:** `SUPPLIER_RATING_UPDATED`
**Payload:**
```json
{
  "supplier_id": "string",
  "new_score": 92.0,
  "change_reason": "New ISO certification detected in JAGGAER"
}
```

---
*Maintained by the Machine Team | Tender Finder 2.0*
