# 🛠️ Public Interface: Supplier Crawling API

> **Base Path:** `/api/v1`
> **Port:** 8011
> **Owner:** Tender Finder Team

The **Supplier Crawling MS** is responsible for gathering competitive intelligence, including **Job Offers** and **Award Notices** from various platforms like Interamt, EURES, and BUND.

---

## 📡 Competitive Intelligence Endpoints

### 1. GET /api/v1/offers

Fetch a list of gathered job offers.

#### Response: Job Offers (200)

```json
[
  {
    "id": 1,
    "supplier_name": "MHP Management- und IT-Beratung GmbH",
    "job_title": "Cloud Architect",
    "location": "Stuttgart",
    "published_at": "ISO8601",
    "source": "INTERAMT",
    "url": "..."
  }
]
```

### 2. GET /api/v1/awards

Fetch a list of historical award notices (competitor winnings).

---

## 📡 Crawl Execution Endpoints

### 3. POST /api/v1/crawl/interamt

Trigger a crawl for a specific supplier on Interamt.

#### Request Body (Optional)

```json
{
  "supplier": "MHP",
  "max_jobs": 100
}
```

### 4. POST /api/v1/crawl/eures

Trigger a crawl for a specific supplier on EURES.

### 5. POST /api/v1/crawl/all

Trigger a global parallel crawl sequence across all supported platforms and competitors (Deloitte, Accenture, Wavestone, etc.).

---

## 📡 Health & Monitoring

### 6. GET /health

Standard health check for the service.

---

Maintained by the Tender Finder Architectural Board
