from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import aiosqlite
from models import MentionsRequest, MentionsResponse, TrendsRequest, TrendsResponse, Mention, TrendPoint, SummaryRequest, SummaryResponse
from database import get_db

app = FastAPI(title="Brand Mentions API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your exact Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/mentions", response_model=MentionsResponse)
async def get_mentions(request: MentionsRequest, db: aiosqlite.Connection = Depends(get_db)):
    base_query = "FROM mentions WHERE 1=1"
    params = []
    
    if request.filters:
        if request.filters.model:
            base_query += " AND model = ?"
            params.append(request.filters.model)
        if request.filters.sentiment:
            base_query += " AND sentiment = ?"
            params.append(request.filters.sentiment)
        if request.filters.date_from:
            base_query += " AND date(created_at) >= ?"
            params.append(request.filters.date_from)
        if request.filters.date_to:
            base_query += " AND date(created_at) <= ?"
            params.append(request.filters.date_to)
        if request.filters.mentioned is not None:
            base_query += " AND mentioned = ?"
            params.append(1 if request.filters.mentioned else 0)
        if request.filters.search:
            search_str = f"%{request.filters.search}%"
            base_query += " AND (query_text LIKE ? OR citation_url LIKE ?)"
            params.extend([search_str, search_str])
            
    # Get total count
    count_query = f"SELECT count(*) {base_query}"
    async with db.execute(count_query, params) as cursor:
        total = (await cursor.fetchone())[0]
        
    # Get paginated data
    offset = (request.page - 1) * request.per_page
    
    # Safe sorting
    sort_column = "created_at"
    valid_sorts = ["created_at", "query_text", "model", "sentiment", "mentioned", "position"]
    if request.sort_by in valid_sorts:
        sort_column = request.sort_by
    sort_dir = "DESC" if request.sort_order == "desc" else "ASC"
    
    data_query = f"SELECT * {base_query} ORDER BY {sort_column} {sort_dir} LIMIT ? OFFSET ?"
    params.extend([request.per_page, offset])
    
    async with db.execute(data_query, params) as cursor:
        rows = await cursor.fetchall()
        
    mentions = []
    for row in rows:
        mentions.append(Mention(
            id=row["id"],
            query_text=row["query_text"],
            model=row["model"],
            mentioned=bool(row["mentioned"]),
            position=row["position"],
            sentiment=row["sentiment"],
            citation_url=row["citation_url"],
            created_at=row["created_at"]
        ))
        
    return MentionsResponse(
        data=mentions,
        total=total,
        page=request.page,
        per_page=request.per_page
    )


@app.post("/mentions/trends", response_model=TrendsResponse)
async def get_trends(request: TrendsRequest, db: aiosqlite.Connection = Depends(get_db)):
    base_query = "FROM mentions WHERE 1=1"
    params = []
    
    if request.date_from:
        base_query += " AND date(created_at) >= ?"
        params.append(request.date_from)
    if request.date_to:
        base_query += " AND date(created_at) <= ?"
        params.append(request.date_to)
        
    if request.group_by == "week":
        # SQLite: strftime('%Y-%W', date) gives year and week number
        date_expr = "strftime('%Y-%W', created_at)"
    else:  # day
        date_expr = "date(created_at)"
        
    query = f"""
    SELECT 
        {date_expr} as date,
        COUNT(*) as total,
        SUM(CASE WHEN mentioned = 1 THEN 1 ELSE 0 END) as mentioned
    {base_query}
    GROUP BY date
    ORDER BY date ASC
    """
    
    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()
        
    points = []
    for row in rows:
        if row["date"]:  # filter out any potential null dates
            points.append(TrendPoint(
                date=row["date"],
                total=row["total"],
                mentioned=row["mentioned"]
            ))
            
    return TrendsResponse(data=points)


@app.post("/mentions/summary", response_model=SummaryResponse)
async def get_summary(request: SummaryRequest, db: aiosqlite.Connection = Depends(get_db)):
    base_query = "FROM mentions WHERE 1=1"
    params = []
    
    if request.date_from:
        base_query += " AND date(created_at) >= ?"
        params.append(request.date_from)
    if request.date_to:
        base_query += " AND date(created_at) <= ?"
        params.append(request.date_to)
        
    async with db.execute(f"SELECT COUNT(*), SUM(CASE WHEN mentioned=1 THEN 1 ELSE 0 END), AVG(position) {base_query}", params) as cur:
        row = await cur.fetchone()
        total_mentions = row[0] or 0
        mentioned_count = row[1] or 0
        avg_position = row[2]
        
    async with db.execute(f"SELECT model, COUNT(*) {base_query} AND model IS NOT NULL GROUP BY model ORDER BY count(*) DESC LIMIT 5", params) as cur:
        models = [{"model": row[0], "count": row[1]} for row in await cur.fetchall()]
        
    async with db.execute(f"SELECT sentiment, COUNT(*) {base_query} AND sentiment IS NOT NULL GROUP BY sentiment ORDER BY count(*) DESC", params) as cur:
        sentiments = [{"sentiment": row[0], "count": row[1]} for row in await cur.fetchall()]
        
    # Get domain basically from citation_url if possible, or just raw sources if domain extracting is hard
    # SQLite doesn't have an easy URL parser, we'll just group by URL directly but filter nulls
    async with db.execute(f"SELECT citation_url, COUNT(*) {base_query} AND citation_url IS NOT NULL GROUP BY citation_url ORDER BY count(*) DESC LIMIT 5", params) as cur:
        sources = [{"source": row[0], "count": row[1]} for row in await cur.fetchall()]
        
    return SummaryResponse(
        total_mentions=total_mentions,
        mentioned_count=mentioned_count,
        avg_position=avg_position,
        models=models,
        sentiments=sentiments,
        sources=sources
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
