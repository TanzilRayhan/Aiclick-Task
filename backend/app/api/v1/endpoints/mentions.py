from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.mention import (
    PaginatedRequest, 
    PaginatedMentionResponse, 
    SummaryResponse, 
    TrendsResponse, 
    ExtendedSummaryResponse, 
    TrendPoint
)
from app.repositories.mention_repository import MentionRepository

router = APIRouter()

@router.post("/", response_model=PaginatedMentionResponse)
async def get_mentions(req: PaginatedRequest, db: AsyncSession = Depends(get_db)):
    repo = MentionRepository(db)
    data, total = await repo.get_paginated_mentions(req)
    
    return PaginatedMentionResponse(
        data=data,
        total=total,
        page=req.page,
        per_page=req.per_page
    )

@router.get("/summary", response_model=ExtendedSummaryResponse)
async def get_summary(db: AsyncSession = Depends(get_db)):
    try:
        repo = MentionRepository(db)
        row = await repo.get_summary()
        sentiment_data = await repo.get_sentiment_breakdown()
        model_data = await repo.get_model_distribution()
        top_sources = await repo.get_top_sources()
        rank_dist = await repo.get_rank_distribution()
        
        if not row:
            return ExtendedSummaryResponse(
                total_mentions=0,
                total_queries=0,
                mention_percentage=0.0,
                avg_rank=0.0,
                sentiment_breakdown=[],
            )
        
        total_count = row.total or 0
        mentioned_count = row.mentioned or 0
        avg_rank = float(row.avg_rank or 0)
        mention_percentage = (mentioned_count / total_count * 100) if total_count > 0 else 0.0
        
        positive_rate = next((s["count"] for s in sentiment_data if s["sentiment"] == "Positive"), 0.0)
        
        return ExtendedSummaryResponse(
            total_mentions=mentioned_count,
            total_queries=total_count,
            mention_percentage=mention_percentage,
            avg_rank=avg_rank,
            sentiment_breakdown=sentiment_data,
            top_models=model_data,
            top_sources=top_sources,
            rank_distribution=rank_dist,
            positive_sentiment_rate=positive_rate
        )
    except Exception as e:
        import traceback
        print(f"Error in get_summary: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends", response_model=TrendsResponse)
async def get_trends(days: int = Query(30), db: AsyncSession = Depends(get_db)):
    try:
        repo = MentionRepository(db)
        raw_data = await repo.get_trends(days=days)
        
        # Format the real data for the frontend
        enhanced_data = []
        for r in raw_data:
            enhanced_data.append(TrendPoint(
                date=r["date"],
                total=r["total"],
                mentioned=r["mentioned"],
                avg_rank=r["avg_rank"]
            ))
            
        return TrendsResponse(data=enhanced_data)
    except Exception as e:
        import traceback
        print(f"Error in get_trends: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
