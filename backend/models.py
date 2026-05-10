from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Request models

class MentionFilters(BaseModel):
    model: Optional[str] = None  # chatgpt, claude, gemini, perplexity
    sentiment: Optional[str] = None  # positive, neutral, negative
    date_from: Optional[str] = None  # YYYY-MM-DD
    date_to: Optional[str] = None  # YYYY-MM-DD
    search: Optional[str] = None
    mentioned: Optional[bool] = None

class MentionsRequest(BaseModel):
    page: int = 1
    per_page: int = 25
    filters: Optional[MentionFilters] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"

class SummaryRequest(BaseModel):
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class TrendsRequest(BaseModel):
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    group_by: str = "day"  # "day" or "week"


# Response models

class Mention(BaseModel):
    id: str
    query_text: str
    model: str
    mentioned: bool
    position: Optional[int] = None
    sentiment: Optional[str] = None
    citation_url: Optional[str] = None
    created_at: datetime


class MentionsResponse(BaseModel):
    data: list[Mention]
    total: int
    page: int
    per_page: int


class TrendPoint(BaseModel):
    date: str
    total: int
    mentioned: int


class TrendsResponse(BaseModel):
    data: list[TrendPoint]

class ModelDistribution(BaseModel):
    model: str
    count: int

class SentimentDistribution(BaseModel):
    sentiment: str
    count: int

class SourceDistribution(BaseModel):
    source: str
    count: int

class SummaryResponse(BaseModel):
    total_mentions: int
    mentioned_count: int
    avg_position: Optional[float]
    models: list[ModelDistribution]
    sentiments: list[SentimentDistribution]
    sources: list[SourceDistribution]
