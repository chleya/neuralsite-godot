"""Aggregate API router registration for the personal site assistant backend."""

from fastapi import APIRouter

from app.api.v1 import site_assistant
from app.api.v1 import entities
from app.api.v1 import audit
from app.api.v1 import space


api_router = APIRouter()
api_router.include_router(site_assistant.router)
api_router.include_router(site_assistant.legacy_router)
api_router.include_router(entities.router)
api_router.include_router(audit.router)
api_router.include_router(space.router)
