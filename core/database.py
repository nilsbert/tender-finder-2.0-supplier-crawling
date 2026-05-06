"""
Database Configuration
======================
Supports both SQLite (local dev) and MSSQL (Docker/production).

Selection is automatic based on the DATABASE_URL env var:
  - mssql+aioodbc://...  → MSSQL via ODBC
  - sqlite+aiosqlite://  → SQLite (fallback)
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Use path relative to project root to ensure sharing across microservices
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///supplier_crawling.db")

# MSSQL needs pool_pre_ping to handle transient connections
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
if DATABASE_URL.startswith("mssql"):
    engine_kwargs["pool_size"] = 50
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_timeout"] = 30

engine = create_async_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

async def init_db():
    """Initialize database tables with explicit model imports."""
    import logging
    db_logger = logging.getLogger("crawling-db")
    db_logger.info(f"🔄 Initializing Crawling DB at: {DATABASE_URL}")
    
    import models
    db_logger.info(f"📋 Registered tables: {list(Base.metadata.tables.keys())}")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed global schedule config if empty
    from models.config import CrawlerScheduleConfigORM
    from sqlalchemy import select
    async with SessionLocal() as session:
        result = await session.execute(select(CrawlerScheduleConfigORM))
        if not result.scalars().first():
            session.add(CrawlerScheduleConfigORM(id=1, start_time="00:00", interval_hours=3, is_enabled=False))
            await session.commit()
            db_logger.info("🌱 Seeded initial crawler schedule config.")

    db_logger.info("✅ Crawling DB initialization complete.")
