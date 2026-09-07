from typing import List, Union
from urllib.parse import quote_plus
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Aaghosh API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # PostgreSQL / Supabase Database Settings
    DB_SERVER: str = "aws-0-[REGION].pooler.supabase.com"
    DB_PORT: int = 6543
    DB_NAME: str = "postgres"
    DB_USER: str = "postgres.[your-project-ref]"
    DB_PASSWORD: str = "YourSupabasePassword"
    DB_ECHO: bool = False

    # JWT Authentication Settings
    JWT_SECRET: str = "aaghosh_jwt_secret_key_development_only_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # LLM Provider & Budget Settings
    LLM_PROVIDER: str = "mock"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_API_KEY: str = ""
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_TOKENS: int = 1000

    # Token & Context Budget Limits
    MAX_PROMPT_TOKENS: int = 4000
    MAX_KNOWLEDGE_CHUNKS: int = 5
    MAX_OBSERVATION_TEXT_LENGTH: int = 500
    MAX_RESPONSE_TOKENS: int = 1000
    MAX_CONVERSATION_MESSAGES: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """
        Build PostgreSQL SQLAlchemy connection URI via psycopg2 driver.
        """
        encoded_password = quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql+psycopg2://{self.DB_USER}:{encoded_password}@"
            f"{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()
