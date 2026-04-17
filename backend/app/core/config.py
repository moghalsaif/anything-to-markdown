from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent if (BACKEND_DIR.parent / "frontend").exists() else BACKEND_DIR
load_dotenv(PROJECT_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    project_name: str = os.getenv("PROJECT_NAME", "MarkItDown Web App")
    api_v1_prefix: str = os.getenv("API_V1_PREFIX", "/api/v1")
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        ).split(",")
        if origin.strip()
    )
    max_file_size: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))
    temp_dir: Path = Path(os.getenv("TEMP_DIR", "./tmp"))


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    temp_dir = settings.temp_dir if settings.temp_dir.is_absolute() else BACKEND_DIR / settings.temp_dir
    temp_dir.mkdir(parents=True, exist_ok=True)
    return Settings(
        project_name=settings.project_name,
        api_v1_prefix=settings.api_v1_prefix,
        cors_origins=settings.cors_origins,
        max_file_size=settings.max_file_size,
        temp_dir=temp_dir,
    )
