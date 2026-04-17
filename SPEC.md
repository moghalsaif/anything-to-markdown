# SPEC.md — MarkItDown Web App

## 1. Overview

**Project Name:** MarkItDown Web App
**Objective:** Build a web application that converts uploaded documents and website URLs into clean, structured Markdown using Microsoft's MarkItDown.
**Primary Use Case:** Transform unstructured content into Markdown for documentation, research, and AI pipelines.
**Target Users:** Developers, researchers, technical writers, and AI engineers.

---

## 2. Goals

### 2.1 Primary Goals

* Convert PDFs and documents into Markdown.
* Convert website URLs into Markdown.
* Provide a simple and intuitive web interface.
* Expose conversion functionality through APIs.

### 2.2 Secondary Goals

* Ensure scalability and modularity.
* Enable deployment in cloud environments.
* Support AI and RAG workflows.

---

## 3. Tech Stack

### Frontend

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Markdown Rendering:** React Markdown
* **HTTP Client:** Axios

### Backend

* **Framework:** FastAPI
* **Language:** Python 3.11
* **Conversion Engine:** Microsoft MarkItDown
* **Web Scraping:** Requests, BeautifulSoup, Readability-LXML
* **Server:** Uvicorn

### Infrastructure

* **Containerization:** Docker, Docker Compose
* **Frontend Hosting:** Vercel
* **Backend Hosting:** Render or Railway
* **Storage:** Local (MVP), AWS S3 (Production)
* **CI/CD:** GitHub Actions

---

## 4. Functional Requirements

| ID     | Requirement                                       |
| ------ | ------------------------------------------------- |
| FR-001 | Upload files for conversion.                      |
| FR-002 | Accept website URLs for conversion.               |
| FR-003 | Convert documents into Markdown using MarkItDown. |
| FR-004 | Display Markdown output in the UI.                |
| FR-005 | Download Markdown as a `.md` file.                |
| FR-006 | Copy Markdown to clipboard.                       |
| FR-007 | Provide REST API endpoints.                       |
| FR-008 | Provide a health-check endpoint.                  |
| FR-009 | Handle errors gracefully.                         |
| FR-010 | Enable CORS for frontend-backend communication.   |

---

## 5. Non-Functional Requirements

| ID      | Requirement                                 |
| ------- | ------------------------------------------- |
| NFR-001 | Process files under 10MB within 10 seconds. |
| NFR-002 | Support concurrent requests.                |
| NFR-003 | Ensure secure file handling.                |
| NFR-004 | Maintain modular architecture.              |
| NFR-005 | Ensure environment-based configuration.     |
| NFR-006 | Support Docker-based deployment.            |
| NFR-007 | Ensure cross-browser compatibility.         |

---

## 6. System Architecture

```
User
  │
  ▼
Frontend (Next.js)
  │
  ▼
Backend API (FastAPI)
  │
  ├── MarkItDown (Document Conversion)
  ├── Web Scraper (URL Processing)
  └── Temporary Storage
  │
  ▼
Markdown Output
```

---

## 7. Directory Structure

```
markitdown-webapp/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_convert.py
│   │   │   └── routes_health.py
│   │   ├── services/
│   │   │   ├── converter.py
│   │   │   └── scraper.py
│   │   ├── schemas/
│   │   │   └── conversion.py
│   │   ├── core/
│   │   │   └── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── README.md
└── SPEC.md
```

---

## 8. Environment Variables

### Backend (`.env`)

```
PROJECT_NAME=MarkItDown Web App
API_V1_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000
MAX_FILE_SIZE=10485760
TEMP_DIR=./tmp
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 9. API Specification

### 9.1 Health Check

**Endpoint**

```
GET /api/v1/health
```

**Response**

```json
{
  "status": "ok"
}
```

---

### 9.2 Convert File

**Endpoint**

```
POST /api/v1/convert/file
```

**Content-Type**

```
multipart/form-data
```

**Request**

* `file`: Binary file

**Response**

```json
{
  "filename": "output.md",
  "markdown": "# Converted Content"
}
```

---

### 9.3 Convert URL

**Endpoint**

```
POST /api/v1/convert/url
```

**Content-Type**

```
application/json
```

**Request**

```json
{
  "url": "https://example.com"
}
```

**Response**

```json
{
  "markdown": "# Converted Webpage"
}
```

---

### 9.4 Error Response

```json
{
  "error": "Invalid input",
  "detail": "Unsupported file type"
}
```

---

## 10. Data Models

### URL Request

```json
{
  "url": "string"
}
```

### Conversion Response

```json
{
  "filename": "string",
  "markdown": "string"
}
```

---

## 11. Core Logic

### 11.1 File Conversion Workflow

1. Receive uploaded file.
2. Validate file type and size.
3. Store temporarily.
4. Convert using MarkItDown.
5. Extract Markdown output.
6. Delete temporary file.
7. Return response.

### 11.2 URL Conversion Workflow

1. Receive URL input.
2. Validate URL.
3. Fetch webpage content.
4. Extract readable HTML.
5. Save HTML temporarily.
6. Convert using MarkItDown.
7. Return Markdown output.

---

## 12. Backend Dependencies

```
fastapi
uvicorn
markitdown
python-multipart
requests
beautifulsoup4
readability-lxml
pydantic
python-dotenv
aiofiles
```

---

## 13. Frontend Dependencies

```
next
react
react-dom
axios
tailwindcss
typescript
react-markdown
lucide-react
```

---

## 14. Docker Configuration

### Backend Dockerfile

```
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Docker Compose

```
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## 15. Development Commands

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```
cd frontend
npm install
npm run dev
```

### Docker

```
docker-compose up --build
```

---

## 16. Testing Strategy

| Layer       | Tool       |
| ----------- | ---------- |
| Backend     | Pytest     |
| Frontend    | Jest       |
| API Testing | Postman    |
| End-to-End  | Playwright |

---

## 17. Security Requirements

* Validate file types and sizes.
* Sanitize HTML content.
* Prevent path traversal attacks.
* Use environment variables for secrets.
* Enable CORS controls.
* Implement rate limiting in future releases.

---

## 18. Acceptance Criteria

| ID     | Criteria                                             |
| ------ | ---------------------------------------------------- |
| AC-001 | File uploads convert to Markdown successfully.       |
| AC-002 | URLs convert to Markdown successfully.               |
| AC-003 | Markdown is displayed correctly.                     |
| AC-004 | Users can download Markdown files.                   |
| AC-005 | APIs return valid JSON responses.                    |
| AC-006 | Application runs via Docker.                         |
| AC-007 | Frontend integrates with backend without errors.     |
| AC-008 | Application deploys successfully to cloud platforms. |

---

## 19. Deployment Targets

| Component  | Platform          |
| ---------- | ----------------- |
| Frontend   | Vercel            |
| Backend    | Render or Railway |
| Repository | GitHub            |
| CI/CD      | GitHub            |

---

## 20. Future Enhancements

* OCR support for scanned PDFs.
* AI-powered Markdown cleanup.
* Batch file processing.
* User authentication and dashboards.
* Conversion history.
* Public developer API.
* Browser extension.
* Notion and GitHub integrations.

---

## 21. Definition of Done

The project is considered complete when:

* All API endpoints function correctly.
* Files and URLs convert to Markdown accurately.
* The frontend renders and exports Markdown.
* Docker deployment runs successfully.
* The application is deployed and accessible online.
* Documentation is complete and reproducible.

---

**End of SPEC.md**
