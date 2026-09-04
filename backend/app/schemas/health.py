from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "healthy"})
    service: str = Field(..., json_schema_extra={"example": "aaghosh-api"})
    version: str = Field(default="1.0.0", json_schema_extra={"example": "1.0.0"})
    db_status: Optional[str] = Field(default=None, json_schema_extra={"example": "connected"})
