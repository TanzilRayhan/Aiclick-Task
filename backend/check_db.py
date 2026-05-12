import asyncio
import sys
import os

# Add the current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.models.mention import Mention
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as s:
        query = select(Mention.sentiment, func.count()).group_by(Mention.sentiment)
        result = await s.execute(query)
        rows = result.all()
        print("DATABASE SENTIMENT COUNTS:")
        for r in rows:
            print(f"  {r[0]}: {r[1]}")

if __name__ == "__main__":
    asyncio.run(check())
