# 🤝 Interaction Contracts: Supplier Rating

> **Service:** Supplier Rating MS
> **Role:** Provider & Consumer
> **Pact Status:** Pending Implementation

---

## As Provider

### [Consumer] Enriching MS
Enriching fetches supplier ratings to augment tender summaries.

| Field | Contract |
| :--- | :--- |
| `overall_score` | Float (0-100). Required. |
| `portal_breakdown`| Array. Required. |
| `scraped_at` | ISO 8601 string. |

---

## As Consumer

### [Provider] IAM MS
Supplier Rating must verify if the user has "Admin" rights to manage credentials.

| Expectation | Detail |
| :--- | :--- |
| `GET /api/iam/verify-role` | Must return `true` for `role=portal_admin`. |

### [Provider] Enrichment MS (Sink)
Supplier Rating pushes "Enrichment Events" when new data is scraped.

| Expectation | Detail |
| :--- | :--- |
| `POST /api/enriching/external-data` | Accepts JSON with `source="supplier-rating"` and `data` object. |

---

## Pact Scenarios

### Scenario 1: Fetching Supplier Score
- **Given**: A supplier with ID `DE123` exists in the database.
- **When**: A GET request is made to `/api/supplier-rating/ratings/DE123`.
- **Then**: Respond with 200 OK and a valid `overall_score`.

### Scenario 2: Invalid Credentials
- **Given**: A login attempt fails on the external portal.
- **When**: The job status is requested.
- **Then**: Respond with `status: "FAILED"` and `error_type: "AUTH_ERROR"`.

---
*Maintained by the Tender Finder Architectural Board*
