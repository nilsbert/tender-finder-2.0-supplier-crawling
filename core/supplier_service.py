import logging
from datetime import datetime
from typing import Dict, List, Optional

import httpx
from models.buyer_cache import BuyerCache
from models.tender_winning_notice import TenderWinningNotice
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("supplier-service")


class SupplierService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ted_api_url = "https://api.tedapi.pro/api/v3/notices/search"
        self.headers = {"Content-Type": "application/json"}

    async def get_caller_history(self, caller_name: str, portal: str = "ted") -> List[Dict]:
        """High-level JIT method: name -> ID (cache) -> history (cache)."""
        # 1. Resolve ID (with cache)
        caller_id = await self.resolve_caller_id(caller_name, portal)
        if not caller_id:
            # Fallback: search by name if ID can't be resolved
            return await self._fetch_and_cache_history_by_name(caller_name, portal)

        # 2. Get History by ID (with cache)
        return await self.get_history_by_id(caller_id, portal)

    async def resolve_caller_id(self, name: str, portal: str = "ted") -> Optional[str]:
        """Look up caller_id in cache, or fetch from portal API."""
        stmt = select(BuyerCache).where(BuyerCache.name == name, BuyerCache.portal == portal)
        res = await self.db.execute(stmt)
        cache = res.scalar_one_or_none()

        if cache:
            return cache.caller_id

        # Not in cache, fetch from API
        logger.info(f"🌐 Fetching Buyer ID for '{name}' from {portal}...")
        caller_id = await self._api_find_buyer_id(name, portal)
        if caller_id:
            new_cache = BuyerCache(name=name, caller_id=caller_id, portal=portal)
            self.db.add(new_cache)
            await self.db.commit()
            return caller_id

        return None

    async def get_history_by_id(self, caller_id: str, portal: str = "ted") -> List[Dict]:
        """Fetch history by ID, using local cache (max 24h old)."""
        # 1. Check local cache first
        stmt = select(TenderWinningNotice).where(
            TenderWinningNotice.winner_id
            == caller_id,  # Using winner_id as a proxy for 'owner' ID in this simplified model
            TenderWinningNotice.source_system == portal,
        )
        res = await self.db.execute(stmt)
        cached_notices = res.scalars().all()

        # If we have recent data, return it
        if cached_notices:
            # Simple check: if latest notice was crawled > 24h ago, we might want to refresh.
            # For JIT, we'll just return what we have if it exists.
            return [self._map_orm_to_dict(n) for n in cached_notices]

        # 2. Fetch from API
        logger.info(f"🌐 Fetching history for Buyer ID '{caller_id}' from {portal}...")
        notices = await self._api_search_awards_by_id(caller_id, portal)

        # 3. Cache results
        for n in notices:
            # Upsert logic (simplified)
            stmt = select(TenderWinningNotice).where(TenderWinningNotice.external_id == n["id"])
            res = await self.db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                new_notice = TenderWinningNotice(
                    external_id=n["id"],
                    source_system=portal,
                    title=n["title"],
                    contracting_authority=caller_id,  # We know the authority ID
                    winner_name=n.get("winner_name"),
                    winner_id=caller_id,  # Link it back to the buyer ID for easy lookup
                    contract_value=n.get("value"),
                    currency=n.get("currency", "EUR"),
                    description=n.get("description"),
                    link=n.get("url"),
                    publication_date=datetime.fromisoformat(n["date"].replace("Z", "+00:00"))
                    if n.get("date")
                    else None,
                )
                self.db.add(new_notice)

        await self.db.commit()
        return notices

    async def _api_find_buyer_id(self, name: str, portal: str) -> Optional[str]:
        if portal != "ted":
            return None
        query = f'BT-500-Organization-Company-Name:"{name}"'
        payload = {"query": query, "limit": 1, "fields": ["buyer-identifier"]}
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(self.ted_api_url, json=payload, headers=self.headers, timeout=10)
                if resp.status_code == 200:
                    results = resp.json().get("results", [])
                    if results:
                        return results[0].get("buyer-identifier")
        except Exception as e:
            logger.error(f"TED API Error (find_buyer_id): {e}")
        return None

    async def _api_search_awards_by_id(self, buyer_id: str, portal: str) -> List[Dict]:
        if portal != "ted":
            return []
        query = f'buyer-identifier:"{buyer_id}" AND notice-type:result'
        return await self._execute_ted_search(query)

    async def _fetch_and_cache_history_by_name(self, name: str, portal: str) -> List[Dict]:
        if portal != "ted":
            return []
        query = f'buyer-name:"{name}" AND notice-type:result'
        return await self._execute_ted_search(query)

    async def _execute_ted_search(self, query: str) -> List[Dict]:
        payload = {
            "query": query,
            "limit": 50,
            "fields": [
                "notice-id",
                "publication-date",
                "notice-title",
                "description-glo",
                "winner-name",
                "contract-value",
                "currency",
            ],
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(self.ted_api_url, json=payload, headers=self.headers, timeout=15)
                if resp.status_code == 200:
                    results = resp.json().get("results", [])
                    return [self._map_ted_notice(r) for r in results]
        except Exception as e:
            logger.error(f"TED API Error (search): {e}")
        return []

    def _map_ted_notice(self, r: Dict) -> Dict:
        return {
            "id": r.get("notice-id"),
            "title": r.get("notice-title"),
            "description": r.get("description-glo"),
            "winner_name": r.get("winner-name"),
            "value": float(r.get("contract-value") or 0),
            "currency": r.get("currency", "EUR"),
            "date": r.get("publication-date"),
            "url": f"https://ted.europa.eu/de/notice/-/detail/{r.get('notice-id')}",
        }

    def _map_orm_to_dict(self, n: TenderWinningNotice) -> Dict:
        return {
            "id": n.external_id,
            "title": n.title,
            "description": n.description,
            "winner_name": n.winner_name,
            "value": float(n.contract_value or 0),
            "currency": n.currency or "EUR",
            "date": n.publication_date.isoformat() if n.publication_date else None,
            "url": n.link,
        }
