from fastapi import APIRouter
from app.api.v1.endpoints import mentions

api_router = APIRouter()
api_router.include_router(mentions.router, prefix="/mentions", tags=["mentions"])
