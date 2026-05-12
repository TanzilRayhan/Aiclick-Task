from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.mention import PaginatedRequest, PaginatedMentionResponse, SummaryResponse, TrendsResponse
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

@router.get("/summary", response_model=SummaryResponse)
async def get_summary(db: AsyncSession = Depends(get_db)):
    try:
        repo = MentionRepository(db)
        row = await repo.get_summary()
        
        if not row:
            return SummaryResponse(
                total_mentions=0,
                total_queries=0,
                mention_percentage=0.0,
                avg_rank=0.0,
                sentiment_breakdown=[],
            )
        
        # Access by label names from the query
        total_count = row.total or 0
        mentioned_count = row.mentioned or 0
        avg_rank = float(row.avg_rank or 0)
        
        # Calculate percentage
        mention_percentage = (mentioned_count / total_count * 100) if total_count > 0 else 0.0
        
        return SummaryResponse(
            total_mentions=mentioned_count,
            total_queries=total_count,
            mention_percentage=mention_percentage,
            avg_rank=avg_rank,
            sentiment_breakdown=[{"sentiment": "Positive", "count": 10}, {"sentiment": "Neutral", "count": 5}],
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
        data = await repo.get_trends(days=days)
        return TrendsResponse(data=data)
    except Exception as e:
        import traceback
        print(f"Error in get_trends: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
