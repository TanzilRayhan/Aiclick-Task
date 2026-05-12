from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class Filters(BaseModel):
    model: Optional[str] = None
    sentiment: Optional[str] = None
    mentioned: Optional[bool] = None
    search: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class PaginatedRequest(BaseModel):
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = "mention_date"
    sort_order: Optional[str] = "desc"
    filters: Optional[Filters] = None

class MentionDTO(BaseModel):
    id: UUID
    query_text: str
    source_url: Optional[str] = None
    ai_model: str
    sentiment: Optional[str] = None
    mentioned: bool
    rank_position: Optional[int] = None
    mention_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedMentionResponse(BaseModel):
    data: List[MentionDTO]
    total: int
    page: int
    per_page: int

class SummaryResponse(BaseModel):
    total_mentions: int
    total_queries: int
    mention_percentage: float
    avg_rank: float
    sentiment_breakdown: List[dict]
    
class TrendPoint(BaseModel):
    date: str
    total: int
    mentioned: int

class TrendsResponse(BaseModel):
    data: List[TrendPoint]
