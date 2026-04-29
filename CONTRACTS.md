# 🤝 Interaction Contracts: Supplier Crawling

> **Service:** Supplier Crawling MS
> **Role:** Provider & Consumer
> **Pact Status:** Pending Implementation

---

## As Provider

### [Consumer] Enriching MS
Enriching fetches raw supplier data to augment tender summaries.

| Field | Contract |
| :--- | :--- |
| `portal_breakdown`| Array. Required. |
| `last_crawl` | ISO 8601 string. |

---

## As Consumer

### [Provider] IAM MS
Supplier Crawling must verify if the user has "Admin" rights to manage credentials.

| Expectation | Detail |
| :--- | :--- |
| `GET /api/iam/verify-role` | Must return `true` for `role=portal_admin`. |

---

## Pact Scenarios

### Scenario 1: Fetching Scraped Data
- **Given**: Scraped data for supplier `DE123` exists in the database.
- **When**: A GET request is made to `/api/supplier-crawling/data/DE123`.
- **Then**: Respond with 200 OK and a valid `portal_breakdown`.

### Scenario 2: Authentication Failure
- **Given**: Portal credentials have expired.
- **When**: A crawling job is triggered.
- **Then**: Emit an error event with `error_type: "AUTH_FAILURE"`.

---
*Maintained by the Tender Finder Architectural Board*
