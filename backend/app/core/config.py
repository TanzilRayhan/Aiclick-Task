from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Brand Mentions API"
    API_V1_STR: str = "/api/v1"
    
    # DB configuration
    DATABASE_URI: str = os.getenv(
        "DATABASE_URI", 
        "postgresql+asyncpg://admin:password@localhost:5432/brandmentions"
    )

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
