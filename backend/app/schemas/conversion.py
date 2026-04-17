from pydantic import BaseModel, HttpUrl


class UrlConversionRequest(BaseModel):
    url: HttpUrl


class ConversionResponse(BaseModel):
    filename: str | None = None
    markdown: str


class ErrorResponse(BaseModel):
    error: str
    detail: str


class HealthResponse(BaseModel):
    status: str = "ok"

