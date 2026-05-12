import asyncio
import sys
import os

sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.repositories.mention_repository import MentionRepository

async def test():
    async with AsyncSessionLocal() as db:
        repo = MentionRepository(db)
        try:
            print("Testing get_summary...")
            summary = await repo.get_summary()
            print(f"Summary: {summary}")
            
            print("Testing get_sentiment_breakdown...")
            sentiment = await repo.get_sentiment_breakdown()
            print(f"Sentiment: {sentiment}")
            
            print("Testing get_model_distribution...")
            models = await repo.get_model_distribution()
            print(f"Models: {models}")
            
        except Exception as e:
            import traceback
            print(f"ERROR: {str(e)}")
            print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(test())
