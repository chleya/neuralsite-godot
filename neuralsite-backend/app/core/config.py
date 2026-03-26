"""
Application settings.
"""

from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "NeuralSite"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, description="Debug mode")

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/neuralsite",
        description="Primary SQLAlchemy database URL",
    )
    DATABASE_POOL_SIZE: int = Field(default=10, description="Database pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, description="Database pool max overflow")
    SITE_ASSISTANT_DB_PATH: str = Field(
        default="./site_assistant.db",
        description="SQLite database path for Site Assistant",
    )

    REDIS_HOST: str = Field(default="localhost", description="Redis host")
    REDIS_PORT: int = Field(default=6379, description="Redis port")
    REDIS_DB: int = Field(default=0, description="Redis database index")
    REDIS_PASSWORD: Optional[str] = Field(default=None, description="Redis password")

    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000", "http://localhost:5173"],
        description="Allowed CORS origins",
    )

    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="JWT signing key",
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Token expiration in minutes")

    BLOCKCHAIN_ENABLED: bool = Field(default=False, description="Enable blockchain integration")
    BLOCKCHAIN_NODE_URL: Optional[str] = Field(default=None, description="Blockchain node URL")

    UPLOAD_DIR: str = Field(default="./uploads", description="Upload directory")
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, description="Max upload size in bytes")

    COORDINATE_SYSTEM: str = Field(default="CGCS2000", description="Coordinate system")
    DEFAULT_LATERAL_OFFSET: float = Field(default=0.0, description="Default lateral offset")
    SPATIAL_INDEX_TYPE: str = Field(default="rtree", description="Spatial index type")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
