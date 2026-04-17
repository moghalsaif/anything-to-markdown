# MarkItDown Web App

Convert local documents and website URLs into clean Markdown through a FastAPI backend and a Next.js frontend.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Axios, React Markdown
- Backend: FastAPI, Python 3.11, Microsoft MarkItDown, BeautifulSoup, Readability-LXML
- Local orchestration: Docker Compose

## Features

- Upload supported files and convert them to Markdown
- Submit a URL and convert readable web content to Markdown
- Preview rendered Markdown in the browser
- Copy Markdown to the clipboard
- Download results as a `.md` file
- Use REST endpoints directly for integrations

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000/api/v1` by default.

## Docker

```bash
docker compose up --build
```

## API

- `GET /api/v1/health`
- `POST /api/v1/convert/file`
- `POST /api/v1/convert/url`

## Notes

- The backend uses Microsoft MarkItDown when installed and falls back to readable text extraction for HTML content if MarkItDown cannot parse the generated webpage file.
- Temporary files are written to `backend/tmp` by default and removed after conversion.
