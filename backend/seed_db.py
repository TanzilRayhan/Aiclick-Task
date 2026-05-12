#!/usr/bin/env python
"""
Seed database with sample mention data for development.

Run from backend directory:
    python seed_db.py
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import uuid

from app.models.mention import Mention, AIModel, SentimentType
from app.db.session import Base
from app.core.config import settings

# Sample data
AI_MODELS_DATA = [
    {"name": "ChatGPT", "provider": "OpenAI"},
    {"name": "Claude", "provider": "Anthropic"},
    {"name": "Gemini", "provider": "Google"},
    {"name": "Perplexity", "provider": "Perplexity AI"},
]

SENTIMENTS_DATA = [
    {"label": "Positive", "color_code": "#10b981"},
    {"label": "Neutral", "color_code": "#6b7280"},
    {"label": "Negative", "color_code": "#ef4444"},
]

SAMPLE_QUERIES = [
    "Best brand for productivity",
    "Which brand is most reliable",
    "Brand comparison 2024",
    "Top rated brand this year",
    "Brand recommendation for startups",
    "Which brand has best customer service",
    "Brand performance metrics",
    "Most innovative brand",
    "Brand trending on social media",
    "Brand partnership opportunities",
]

SAMPLE_SOURCES = [
    "https://twitter.com/brandname",
    "https://reddit.com/r/technology",
    "https://medium.com/@blog",
    "https://news.ycombinator.com",
    "https://github.com/trending",
    "https://producthunt.com",
    "https://techcrunch.com",
    "https://forbes.com",
]

async def seed_database():
    """Seed the database with sample data."""
    
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URI, echo=False)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            print("🌱 Starting database seeding...")
            
            # Create tables if they don't exist
            print("🏗️ Creating database tables...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            # Create AI Models
            print("📝 Checking AI models...")
            ai_models = {}
            for model_data in AI_MODELS_DATA:
                # Check if exists
                stmt = select(AIModel).where(AIModel.name == model_data["name"])
                res = await session.execute(stmt)
                existing = res.scalar_one_or_none()
                
                if not existing:
                    print(f"   + Adding model: {model_data['name']}")
                    model = AIModel(**model_data)
                    session.add(model)
                    ai_models[model_data["name"]] = model
                else:
                    print(f"   ~ Model exists: {model_data['name']}")
                    ai_models[model_data["name"]] = existing
            await session.commit()
            
            # Create Sentiment Types
            print("📝 Checking sentiment types...")
            sentiments = {}
            for sentiment_data in SENTIMENTS_DATA:
                # Check if exists
                stmt = select(SentimentType).where(SentimentType.label == sentiment_data["label"])
                res = await session.execute(stmt)
                existing = res.scalar_one_or_none()
                
                if not existing:
                    print(f"   + Adding sentiment: {sentiment_data['label']}")
                    sentiment = SentimentType(**sentiment_data)
                    session.add(sentiment)
                    sentiments[sentiment_data["label"]] = sentiment
                else:
                    print(f"   ~ Sentiment exists: {sentiment_data['label']}")
                    sentiments[sentiment_data["label"]] = existing
            await session.commit()
            
            # Create Sample Mentions only if database is sparse
            stmt = select(func.count()).select_from(Mention)
            res = await session.execute(stmt)
            count = res.scalar()
            
            if count < 50:
                print(f"📝 Creating sample mentions ({count} existing)...")
                base_date = datetime.utcnow() - timedelta(days=30)
                
                for i in range(100):
                    mention = Mention(
                        id=uuid.uuid4(),
                        query_text=SAMPLE_QUERIES[i % len(SAMPLE_QUERIES)],
                        source_url=SAMPLE_SOURCES[i % len(SAMPLE_SOURCES)],
                        ai_model=list(ai_models.keys())[i % len(ai_models)],
                        sentiment=list(sentiments.keys())[i % len(sentiments)],
                        mentioned=i % 3 != 0,
                        rank_position=(i % 20) + 1,
                        mention_date=base_date + timedelta(days=i % 30, hours=i % 24),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                    session.add(mention)
                await session.commit()
                print("✅ Successfully seeded database with sample mentions!")
            else:
                print(f"✅ Database already contains {count} mentions. Skipping sample data.")
            
            print(f"   - {len(AI_MODELS_DATA)} AI models configured")
            print(f"   - {len(SENTIMENTS_DATA)} sentiment types configured")
            
        except Exception as e:
            print(f"❌ Error seeding database: {e}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_database())
