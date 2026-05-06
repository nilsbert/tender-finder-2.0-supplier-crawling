# 🛠️ Public Interface: Crawling API

The Crawling MS serves as the **Source of Truth** for raw tender data. Its public interface is strictly defined and versioned.

## 📡 Endpoints

### 1. GET /api/v1/tenders
Fetches a paginated list of raw tenders.
- **Consumers**: Enriching MS
- **Rate Limit**: 100 req/min (internal)

#### Response (Success 200)
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "source_system": "string",
      "published_at": "ISO8601"
    }
  ],
  "count": "int"
}
```
