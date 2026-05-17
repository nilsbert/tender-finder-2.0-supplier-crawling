"""
Scheduler
=========
Loads active crawler configs from the DB and schedules cron jobs.
"""

import logging
from datetime import timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from models import CrawlerConfigORM
from sqlalchemy import select

from .database import SessionLocal
from .executor import crawler_executor

logger = logging.getLogger("scheduler")
scheduler = AsyncIOScheduler(timezone=timezone.utc)


async def run_crawler_task(crawler_id: str):
    """Invoke the crawler execution logic."""
    logger.info(f"🚀 [SCHEDULED] Starting execution for: {crawler_id}")
    config = {"max_tenders": 500}  # Lean default
    try:
        await crawler_executor.run_crawler_by_id(crawler_id, config)
    except Exception as e:
        logger.error(f"❌ [SCHEDULED] Failed to run {crawler_id}: {e}")


async def restart_scheduler():
    """Clear all jobs and re-initialize."""
    logger.info("♻️ Restarting scheduler...")
    for job in scheduler.get_jobs():
        scheduler.remove_job(job.id)
    await init_scheduler()


async def init_scheduler():
    """Load active configs from DB and register cron jobs."""
    async with SessionLocal() as db:
        from models.config import CrawlerScheduleConfigORM

        # 1. Global Fleet Schedule
        result = await db.execute(select(CrawlerScheduleConfigORM).where(CrawlerScheduleConfigORM.id == 1))
        global_cfg = result.scalar_one_or_none()

        if global_cfg and global_cfg.is_enabled:
            result = await db.execute(select(CrawlerConfigORM).where(CrawlerConfigORM.is_active == True))
            configs = result.scalars().all()

            from datetime import datetime, time, timedelta

            now = datetime.now(timezone.utc)
            h, m = map(int, global_cfg.start_time.split(":"))

            # Calculate the first run time (today or tomorrow)
            start_dt = datetime.combine(now.date(), time(h, m), tzinfo=timezone.utc)
            if start_dt < now:
                start_dt += timedelta(days=1)

            delay_minutes = 0
            for config in configs:
                # Stagger starts by 1 minute each to avoid concurrent spike
                staggered_start = start_dt + timedelta(minutes=delay_minutes)
                scheduler.add_job(
                    run_crawler_task,
                    IntervalTrigger(hours=global_cfg.interval_hours, start_date=staggered_start),
                    args=[config.id],
                    id=f"global-{config.id}",
                    replace_existing=True,
                )
                logger.info(
                    f"⏰ [GLOBAL] Scheduled {config.id} starting at {staggered_start} every {global_cfg.interval_hours}h"
                )
                delay_minutes += 1

        # 2. Individual Specific Schedules (Legacy/Custom)
        result = await db.execute(
            select(CrawlerConfigORM).where(CrawlerConfigORM.is_active == True, CrawlerConfigORM.schedule_cron != None)
        )
        configs = result.scalars().all()

        for config in configs:
            scheduler.add_job(
                run_crawler_task,
                CronTrigger.from_crontab(config.schedule_cron),
                args=[config.id],
                id=config.id,
                replace_existing=True,
            )
            logger.info(f"⏰ [CUSTOM] Scheduled {config.id} with cron: {config.schedule_cron}")

    if not scheduler.running:
        scheduler.start()
