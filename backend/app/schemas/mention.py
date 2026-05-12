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
    
    # Deltas for KPIs
    mentions_delta: float = 12.4
    queries_delta: float = 8.1
    percentage_delta: float = 2.3
    rank_delta: float = -1.09 # Negative is good
    
    sentiment_breakdown: List[dict]

class ModelDistributionItem(BaseModel):
    model: str
    count: int
    percentage: float

class TopSourceItem(BaseModel):
    domain: str
    count: int
    avg_rank: float

class RankDistributionItem(BaseModel):
    bucket: str
    count: int

class ExtendedSummaryResponse(SummaryResponse):
    top_models: List[ModelDistributionItem] = []
    top_sources: List[TopSourceItem] = []
    rank_distribution: List[RankDistributionItem] = []
    positive_sentiment_rate: float = 0.0
    
class TrendPoint(BaseModel):
    date: str
    total: int
    mentioned: int
    avg_rank: float = 0.0
    sentiment_score: float = 0.0
    chatgpt_mentions: int = 0
    claude_mentions: int = 0
    gemini_mentions: int = 0
    perplexity_mentions: int = 0

class TrendsResponse(BaseModel):
    data: List[TrendPoint]
