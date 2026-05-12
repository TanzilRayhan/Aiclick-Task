import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.session import Base
from typing import Optional

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    provider = Column(String, nullable=False)
    active = Column(Boolean, default=True)

class SentimentType(Base):
    __tablename__ = "sentiment_types"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String, unique=True, nullable=False)
    color_code = Column(String, nullable=False)

class Mention(Base):
    __tablename__ = "mentions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_text = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    ai_model = Column(String, nullable=False, index=True)
    sentiment = Column(String, nullable=True, index=True)
    mentioned = Column(Boolean, nullable=False, index=True)
    rank_position = Column(Integer, nullable=True, index=True)
    mention_date = Column(DateTime, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_mention_model_date', 'ai_model', 'mention_date'),
    )
