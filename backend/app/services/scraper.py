from __future__ import annotations

from pathlib import Path

import requests
from bs4 import BeautifulSoup
from readability import Document


class ScraperError(Exception):
    pass


def fetch_readable_html(url: str, destination: Path) -> Path:
    try:
        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": (
                    "MarkItDownWebApp/1.0 (+https://localhost) "
                    "Readable markdown conversion"
                )
            },
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise ScraperError("Could not fetch the provided URL.") from exc

    readable = Document(response.text)
    title = readable.short_title() or "Converted Webpage"
    summary_html = readable.summary(html_partial=True)
    soup = BeautifulSoup(summary_html, "html.parser")

    html = f"""
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <article>
          {soup}
        </article>
      </body>
    </html>
    """.strip()

    destination.write_text(html, encoding="utf-8")
    return destination

