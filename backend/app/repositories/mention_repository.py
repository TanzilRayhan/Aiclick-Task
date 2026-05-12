from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, Integer, cast
from typing import Optional, Tuple
from app.models.mention import Mention
from app.schemas.mention import PaginatedRequest

class MentionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _build_filter_query(self, base_query, filters):
        if not filters:
            return base_query
            
        if filters.model:
            base_query = base_query.where(Mention.ai_model == filters.model)
        if filters.sentiment:
            base_query = base_query.where(Mention.sentiment == filters.sentiment)
        if filters.date_from:
            base_query = base_query.where(Mention.mention_date >= filters.date_from)
        if filters.date_to:
            base_query = base_query.where(Mention.mention_date <= filters.date_to)
        if filters.mentioned is not None:
            base_query = base_query.where(Mention.mentioned == filters.mentioned)
        if filters.search:
            search_str = f"%{filters.search}%"
            base_query = base_query.where(
                or_(
                    Mention.query_text.ilike(search_str),
                    Mention.source_url.ilike(search_str)
                )
            )
        return base_query

    async def get_paginated_mentions(self, req: PaginatedRequest) -> Tuple[list, int]:
        base_query = select(Mention)
        count_query = select(func.count()).select_from(Mention)

        if req.filters:
            base_query = self._build_filter_query(base_query, req.filters)
            count_query = self._build_filter_query(count_query, req.filters)

        total = await self.session.scalar(count_query)

        sort_col = getattr(Mention, req.sort_by, Mention.mention_date)
        if req.sort_order == "desc":
            sort_col = desc(sort_col)
            
        base_query = base_query.order_by(sort_col)
        base_query = base_query.offset((req.page - 1) * req.per_page).limit(req.per_page)

        result = await self.session.execute(base_query)
        data = result.scalars().all()

        return data, total

    async def get_summary(self, date_from=None, date_to=None):
        query = select(
            func.count().label("total"),
            func.sum(cast(Mention.mentioned, Integer)).label("mentioned"),
            func.avg(Mention.rank_position).label("avg_rank")
        ).select_from(Mention)
        
        result = await self.session.execute(query)
        return result.fetchone()

    async def get_sentiment_breakdown(self):
        query = select(
            Mention.sentiment,
            func.count().label("count")
        ).select_from(Mention).group_by(Mention.sentiment)
        
        result = await self.session.execute(query)
        rows = result.all()
        
        # Initialize with all categories
        breakdown = {
            "Positive": 0,
            "Neutral": 0,
            "Negative": 0
        }
        
        for r in rows:
            s_val = (r.sentiment or "").strip().capitalize()
            if s_val in breakdown:
                breakdown[s_val] += r.count
            else:
                breakdown["Neutral"] += r.count
                
        total = sum(v for v in breakdown.values())
                
        return [
            {"sentiment": k, "count": int((v / total) * 100)}
            for k, v in breakdown.items()
        ]

    async def get_model_distribution(self):
        query = select(
            Mention.ai_model,
            func.count().label("count")
        ).select_from(Mention).group_by(Mention.ai_model)
        
        result = await self.session.execute(query)
        rows = result.all()
        
        total = sum(r.count for r in rows)
        if not total: return []

        return [
            {"model": r.ai_model, "count": r.count, "percentage": round((r.count / total) * 100, 1)}
            for r in rows
        ]

    async def get_top_sources(self, limit: int = 5):
        # Simplified domain extraction for the demo
        query = select(
            Mention.source_url,
            func.count().label("count"),
            func.avg(Mention.rank_position).label("avg_rank")
        ).select_from(Mention).group_by(Mention.source_url).order_by(desc("count")).limit(limit)
        
        result = await self.session.execute(query)
        rows = result.all()
        
        sources = []
        for r in rows:
            domain = (r.source_url or "Direct API").replace("https://", "").replace("http://", "").split('/')[0]
            sources.append({
                "domain": domain,
                "count": r.count,
                "avg_rank": round(float(r.avg_rank or 0), 1)
            })
        return sources

    async def get_rank_distribution(self):
        # Calculate buckets: #1-3, #4-10, #11-20, 20+
        query = select(Mention.rank_position).select_from(Mention)
        result = await self.session.execute(query)
        ranks = result.scalars().all()
        
        distribution = {
            "#1-3": 0,
            "#4-10": 0,
            "#11-20": 0,
            "20+": 0
        }
        
        for rank in ranks:
            if not rank: continue
            if rank <= 3: distribution["#1-3"] += 1
            elif rank <= 10: distribution["#4-10"] += 1
            elif rank <= 20: distribution["#11-20"] += 1
            else: distribution["20+"] += 1
            
        return [{"bucket": k, "count": v} for k, v in distribution.items()]

    async def get_trends(self, days: int = 30):
        # Calculate daily trends
        query = select(
            func.date(Mention.mention_date).label("date"),
            func.count().label("total"),
            func.sum(cast(Mention.mentioned, Integer)).label("mentioned"),
            func.avg(Mention.rank_position).label("avg_rank")
        ).select_from(Mention).group_by(func.date(Mention.mention_date)).order_by(func.date(Mention.mention_date))
        
        result = await self.session.execute(query)
        rows = result.all()
        
        return [
            {
                "date": str(r.date), 
                "total": r.total, 
                "mentioned": r.mentioned or 0,
                "avg_rank": round(float(r.avg_rank or 0), 1)
            } for r in rows
        ]
