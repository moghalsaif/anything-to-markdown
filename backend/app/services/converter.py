from __future__ import annotations

import shutil
from pathlib import Path

from bs4 import BeautifulSoup


class ConversionError(Exception):
    pass


def _normalize_markdown(markdown: str) -> str:
    lines = [line.rstrip() for line in markdown.replace("\r\n", "\n").split("\n")]
    cleaned: list[str] = []
    previous_blank = False

    for line in lines:
        is_blank = not line.strip()
        if is_blank and previous_blank:
            continue
        cleaned.append(line)
        previous_blank = is_blank

    return "\n".join(cleaned).strip() + "\n"


def _html_to_basic_markdown(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(strip=True) if soup.title else "Converted Content"
    body_text = "\n".join(
        block.get_text(" ", strip=True)
        for block in soup.find_all(["h1", "h2", "h3", "p", "li", "blockquote", "pre"])
        if block.get_text(" ", strip=True)
    )
    markdown = f"# {title}\n\n{body_text or 'No readable content found.'}"
    return _normalize_markdown(markdown)


class MarkItDownConverter:
    def __init__(self) -> None:
        try:
            from markitdown import MarkItDown
        except ImportError as exc:
            raise ConversionError(
                "The 'markitdown' package is not installed. Install backend dependencies first."
            ) from exc

        self._client = MarkItDown()

    def convert_file(self, source_path: Path) -> str:
        try:
            result = self._client.convert(str(source_path))
            text = getattr(result, "text_content", None) or str(result)
        except Exception as exc:
            raise ConversionError(f"MarkItDown failed to convert '{source_path.name}'.") from exc

        return _normalize_markdown(text)

    def convert_html_file(self, html_path: Path) -> str:
        try:
            return self.convert_file(html_path)
        except ConversionError:
            html = html_path.read_text(encoding="utf-8", errors="ignore")
            return _html_to_basic_markdown(html)


def safe_delete(path: Path) -> None:
    if path.exists():
        if path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
        else:
            path.unlink(missing_ok=True)

