
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.ai import router as ai_router
from app.routes.auth import router as auth_router
from app.routes.restaurants import router as restaurant_router
from app.routes.menu import router as menu_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.refunds import router as refunds_router
from app.routes.reminders import router as reminders_router

from app.services.reminders import reminder_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(reminder_loop())

    yield

    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="CampusBite API",
    description="Backend API for the CampusBite food ordering platform",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(refunds_router)
app.include_router(reminders_router)
app.include_router(ai_router)


@app.get("/")
def home():
    return {"message": "Welcome to CampusBite API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
