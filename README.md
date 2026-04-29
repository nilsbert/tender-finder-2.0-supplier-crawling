# 🛡️ Supplier Rating Microservice

> **Internal Project Name:** Project Portal-Guard
> **Owner:** Roman (Product Management)
> **Status:** Architecture Phase (Draft)

This microservice is responsible for the **automated extraction, evaluation, and normalization of supplier data** from various enterprise "Lieferantenportale" (Supplier Portals).

## 🚀 Vision
To provide the Tender Finder ecosystem with real-time "Supplier Health" intelligence, ensuring that every tender pursuit is backed by validated supplier credentials and ratings from portals like SAP Ariba, JAGGAER, and Onventis.

## 📂 Documentation
- [🧠 Domain Model](DOMAIN.md): Entities, Value Objects, and Business Rules.
- [🛠️ API Specification](API.md): Public endpoints and Enrichment integration.
- [🤝 Interaction Contracts](CONTRACTS.md): Pact test scenarios and consumer expectations.
- [✨ UI Mockup](ui/mockup.html): Preview of the Admin Management interface.

## 🛠️ Technical Stack (Target)
- **Runtime**: Python 3.12+ (FastAPI)
- **Scraper Engine**: Playwright (with Stealth Plugin)
- **Database**: PostgreSQL (SQLAlchemy/Alembic)
- **Integration**: Webhooks/Events to Enrichment MS

---
*Maintained by the Machine Team | Tender Finder 2.0*
