import aiosqlite
from typing import AsyncGenerator
from contextlib import asynccontextmanager
import pathlib

DB_PATH = pathlib.Path(__file__).parent / "mentions.db"

async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
