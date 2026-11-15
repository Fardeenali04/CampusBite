
import asyncio
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ai import router as ai_router
from app.routes.auth import router as auth_router
from app.routes.restaurants import router as restaurant_router
from app.routes.menu import router as menu_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.refunds import router as refunds_router
from app.routes.reminders import router as reminders_router
from app.routes import owner_tools

from app.services.reminders import reminder_loop


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("campusbite.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CampusBite API starting")

    task = asyncio.create_task(reminder_loop())

    yield

    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        pass

    logger.info("CampusBite API stopped")


app = FastAPI(
    title="CampusBite API",
    description="Backend API for the CampusBite food ordering platform",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start_time = time.perf_counter()

    method = request.method
    path = request.url.path

    try:
        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000

        logger.info(
            "%s %s | Status: %s | Duration: %.2f ms",
            method,
            path,
            response.status_code,
            duration_ms,
        )

        response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"

        return response

    except Exception:
        duration_ms = (time.perf_counter() - start_time) * 1000

        logger.exception(
            "%s %s | Failed | Duration: %.2f ms",
            method,
            path,
            duration_ms,
        )

        raise


app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(refunds_router)
app.include_router(reminders_router)
app.include_router(ai_router)
app.include_router(owner_tools.router)


@app.get("/")
def home():
    return {"message": "Welcome to CampusBite API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
