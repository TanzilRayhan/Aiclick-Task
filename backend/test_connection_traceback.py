import asyncio
import traceback
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def test_connection():
    print("Testing connection...")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            print("Connection successful:", result.scalar())
    except Exception:
        print("Caught exception:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
