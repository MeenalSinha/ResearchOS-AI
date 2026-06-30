"""
Application configuration loaded from environment variables.
Lemma SDK keys, OpenAI keys, database URLs, and auth secrets all live here.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ResearchOS AI"
    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://researchos:researchos@localhost:5432/researchos"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Vector DB
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "researchos_papers"

    # AI Models
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-5.5"
    EMBEDDING_MODEL: str = "text-embedding-3-large"

    # Lemma SDK
    LEMMA_API_KEY: str = ""
    LEMMA_DATASTORE_URL: str = "https://api.lemma.dev/datastore"
    LEMMA_DOCSTORE_URL: str = "https://api.lemma.dev/documents"

    # Auth
    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7
    CLERK_SECRET_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # Storage
    STORAGE_BACKEND: str = "local"  # local | s3 | lemma
    STORAGE_LOCAL_PATH: str = "./storage"
    S3_BUCKET: str = ""
    S3_REGION: str = ""

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
