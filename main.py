"""
Crawling Microservice — Entry Point
====================================
FastAPI application with:
- Async SQLite database via SQLAlchemy
- Background job execution for scrapers
- Static admin UI serving
- Stale job cleanup on startup
"""
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import uvicorn
from api.config import router as config_router
from api.routes import router as api_router
from core.database import SessionLocal, init_db
from core.scheduler import init_scheduler
from core.websocket_manager import ws_manager
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from models import CrawlerJobORM
from sqlalchemy import update

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

log_level = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO)
logging.basicConfig(level=log_level, format="%(asctime)s %(name)s %(levelname)s: %(message)s")
logger = logging.getLogger("main")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    logger.info("🚀 Starting Crawling Microservice...")
    try:
        await init_db()

        # Clean up orphaned jobs from previous crashes
        async with SessionLocal() as db:
            stmt = (
                update(CrawlerJobORM)
                .where(CrawlerJobORM.status.in_(["running", "starting"]))
                .values(
                    status="failed",
                    error_message="Server restarted — job orphaned",
                    end_time=_utcnow(),
                )
            )
            result = await db.execute(stmt)
            await db.commit()
            if result.rowcount > 0:
                logger.info(f"🧹 Cleaned up {result.rowcount} stale jobs from previous session")

        # await init_scheduler()
        logger.info("✅ Startup complete (JIT Mode)")
    except Exception as e:
        logger.error(f"❌ Startup error: {e}", exc_info=True)

    yield
    logger.info("👋 Shutting down...")


app = FastAPI(title="Supplier Crawling Microservice", lifespan=lifespan)

# CORS — allow frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")
app.include_router(config_router, prefix="/api/v1")
app.include_router(config_router, prefix="/api")
app.include_router(api_router)

# Static Admin UI
ui_dist_path = os.path.join(os.path.dirname(__file__), "ui", "dist_new")
if os.path.exists(ui_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(ui_dist_path, "assets")), name="assets")


@app.get("/")
@app.get("/admin")
async def get_modern_admin():
    """Serve the job crawler control center."""
    ui_path = os.path.join(os.path.dirname(__file__), "ui", "modern_admin_v3.html")
    return FileResponse(ui_path)


@app.get("/health")
def health():
    return {"status": "ok", "context": "supplier-crawling-autonomous"}


@app.websocket("/ws/jobs")
async def websocket_endpoint(websocket: WebSocket):
    logger.info(f"Incoming WebSocket connection attempt from {websocket.client}")
    try:
        await ws_manager.connect(websocket)
        logger.info(f"WebSocket connection established with {websocket.client}")
        while True:
            # Keep the connection open and wait for messages or disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info(f"WebSocket client {websocket.client} disconnected normally")
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error for client {websocket.client}: {e}")
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8011))  # Using 8011 for this service
    uvicorn.run(app, host="0.0.0.0", port=port)
