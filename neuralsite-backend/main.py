"""FastAPI application entrypoint."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Awaitable, Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings


async def _noop() -> None:
    return None


def _resolve_database_hooks() -> tuple[Callable[[], Awaitable[None]], Callable[[], Awaitable[None]]]:
    try:
        from app.core.database import close_db, init_db
    except ModuleNotFoundError:
        return _noop, _noop
    return init_db, close_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize and dispose shared resources."""
    init_db, close_db = _resolve_database_hooks()
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="NeuralSite API",
    description="NeuralSite data and site assistant API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": "NeuralSite API",
        "version": "1.0.0",
        "description": "NeuralSite data and site assistant API.",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "NeuralSite API",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
