from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import Settings, get_settings
from app.schemas.conversion import ConversionResponse, UrlConversionRequest
from app.services.converter import ConversionError, MarkItDownConverter, safe_delete
from app.services.scraper import ScraperError, fetch_readable_html


router = APIRouter(prefix="/convert", tags=["convert"])

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".doc",
    ".pptx",
    ".ppt",
    ".xlsx",
    ".xls",
    ".html",
    ".htm",
    ".txt",
    ".md",
    ".csv",
}


def get_converter() -> MarkItDownConverter:
    return MarkItDownConverter()


async def _persist_upload(upload: UploadFile, destination: Path, max_size: int) -> None:
    total_size = 0

    async with aiofiles.open(destination, "wb") as handle:
        while chunk := await upload.read(1024 * 1024):
            total_size += len(chunk)
            if total_size > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File exceeds the maximum allowed size of 10MB.",
                )
            await handle.write(chunk)


@router.post("/file", response_model=ConversionResponse)
async def convert_file(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    converter: MarkItDownConverter = Depends(get_converter),
) -> ConversionResponse:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type.",
        )

    temp_path = settings.temp_dir / f"{uuid4().hex}{suffix}"

    try:
        await _persist_upload(file, temp_path, settings.max_file_size)
        markdown = converter.convert_file(temp_path)
    except HTTPException:
        safe_delete(temp_path)
        raise
    except ConversionError as exc:
        safe_delete(temp_path)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    finally:
        safe_delete(temp_path)
        await file.close()

    output_name = f"{Path(file.filename or 'converted').stem}.md"
    return ConversionResponse(filename=output_name, markdown=markdown)


@router.post("/url", response_model=ConversionResponse)
async def convert_url(
    payload: UrlConversionRequest,
    settings: Settings = Depends(get_settings),
    converter: MarkItDownConverter = Depends(get_converter),
) -> ConversionResponse:
    temp_path = settings.temp_dir / f"{uuid4().hex}.html"

    try:
        html_path = fetch_readable_html(str(payload.url), temp_path)
        markdown = converter.convert_html_file(html_path)
    except ScraperError as exc:
        safe_delete(temp_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ConversionError as exc:
        safe_delete(temp_path)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    finally:
        safe_delete(temp_path)

    return ConversionResponse(filename="webpage.md", markdown=markdown)

