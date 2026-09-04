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

    # Microsoft SQL Server Database Settings
    DB_SERVER: str = r"localhost\SQLEXPRESS"
    DB_PORT: int = 1433
    DB_NAME: str = "AaghoshDB"
    DB_USER: str = "sa"
    DB_PASSWORD: str = "YourStrongPassw0rd!"
    DB_DRIVER: str = "ODBC Driver 17 for SQL Server"
    DB_TRUSTED_CONNECTION: bool = True
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
        Build Microsoft SQL Server SQLAlchemy connection URI via pyodbc driver.
        Supports both SQL user/password and Windows Authentication (Trusted Connection).
        """
        encoded_driver = quote_plus(self.DB_DRIVER)
        if self.DB_TRUSTED_CONNECTION:
            return (
                f"mssql+pyodbc://@{self.DB_SERVER}/{self.DB_NAME}?"
                f"driver={encoded_driver}&trusted_connection=yes"
            )
        encoded_password = quote_plus(self.DB_PASSWORD)
        return (
            f"mssql+pyodbc://{self.DB_USER}:{encoded_password}@"
            f"{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}?"
            f"driver={encoded_driver}"
        )


settings = Settings()
