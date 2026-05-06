from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from core.database import get_db
from models.config import ConfigRetentionORM, ConfigRetentionHistoryORM
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re

router = APIRouter(prefix="/config", tags=["Configuration"])

class ConfigResponse(BaseModel):
    retention_period_days: int
    version: int
    updated_at: datetime

class ConfigUpdate(BaseModel):
    retention_period_days: int
    change_summary: str
    created_by: str = "Admin"

def orm_to_dict(obj) -> Dict[str, Any]:
    """Extract data fields from ORM."""
    data = {}
    for column in obj.__table__.columns:
        if column.name not in ["id", "version", "updated_at", "change_summary", "created_at", "created_by"]:
            data[column.name] = getattr(obj, column.name)
    return data

@router.get("/retention", response_model=ConfigResponse)
async def get_retention_config(db: AsyncSession = Depends(get_db)):
    """Retrieve the current data retention policy settings."""
    result = await db.execute(select(ConfigRetentionORM).where(ConfigRetentionORM.id == 1))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Retention config not initialized")
    return obj

@router.post("/retention", response_model=ConfigResponse)
async def update_retention_config(payload: ConfigUpdate, db: AsyncSession = Depends(get_db)):
    """Update the data retention policy and create a history snapshot."""
    result = await db.execute(select(ConfigRetentionORM).where(ConfigRetentionORM.id == 1))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Retention config not initialized")
    
    # Historize
    history = ConfigRetentionHistoryORM(
        version=obj.version,
        change_summary=payload.change_summary,
        created_by=payload.created_by,
        **orm_to_dict(obj)
    )
    db.add(history)
    
    # Update
    for key, value in payload.model_dump().items():
        if key not in ["change_summary", "created_by"] and hasattr(obj, key):
            setattr(obj, key, value)
            
    obj.version += 1
    await db.commit()
    await db.refresh(obj)
    return obj

@router.get("/retention/history")
async def get_retention_history(db: AsyncSession = Depends(get_db)):
    """Retrieve the version history of the data retention policy."""
    result = await db.execute(select(ConfigRetentionHistoryORM).order_by(ConfigRetentionHistoryORM.version.desc()).limit(10))
    return result.scalars().all()
class CrawlerScheduleUpdate(BaseModel):
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    interval_hours: int = Field(..., ge=1, le=168) # Max 1 week
    is_enabled: bool

    @field_validator("start_time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        h, m = map(int, v.split(":"))
        if not (0 <= h <= 23 and 0 <= m <= 59):
            raise ValueError("Time must be between 00:00 and 23:59")
        return v

@router.get("/crawler-schedule")
async def get_crawler_schedule(db: AsyncSession = Depends(get_db)):
    """Retrieve the global crawler scheduling configuration."""
    from models.config import CrawlerScheduleConfigORM
    result = await db.execute(select(CrawlerScheduleConfigORM).where(CrawlerScheduleConfigORM.id == 1))
    obj = result.scalar_one_or_none()
    if not obj:
        # Fallback if seed failed
        return {"start_time": "00:00", "interval_hours": 3, "is_enabled": False}
    return obj

@router.post("/crawler-schedule")
async def update_crawler_schedule(payload: CrawlerScheduleUpdate, db: AsyncSession = Depends(get_db)):
    """Update the global crawler schedule and restart the scheduler."""
    from models.config import CrawlerScheduleConfigORM
    from core.scheduler import restart_scheduler
    
    result = await db.execute(select(CrawlerScheduleConfigORM).where(CrawlerScheduleConfigORM.id == 1))
    obj = result.scalar_one_or_none()
    
    if not obj:
        obj = CrawlerScheduleConfigORM(id=1)
        db.add(obj)
    
    obj.start_time = payload.start_time
    obj.interval_hours = payload.interval_hours
    obj.is_enabled = payload.is_enabled
    
    await db.commit()
    
    # Trigger scheduler reload
    await restart_scheduler()
    
    return obj
