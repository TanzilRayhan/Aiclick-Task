import asyncio
from app.db.session import AsyncSessionLocal
from app.repositories.mention_repository import MentionRepository

async def test():
    async with AsyncSessionLocal() as session:
        repo = MentionRepository(session)
        try:
            row = await repo.get_summary()
            print(f"Row: {row}")
            print(f"Type: {type(row)}")
            if row:
                print(f"total: {row.total if hasattr(row, 'total') else row[0]}")
                print(f"mentioned: {row.mentioned if hasattr(row, 'mentioned') else row[1]}")
                print(f"avg_rank: {row.avg_rank if hasattr(row, 'avg_rank') else row[2]}")
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
