# anything-to-markdown

Paste a URL or drop a file — get clean Markdown back.

Built with [Microsoft MarkItDown](https://github.com/microsoft/markitdown) under the hood.

---

## Why

Copy-pasting content from the web or documents into AI tools, note apps, or docs always comes out messy. This converts anything — PDFs, Word files, spreadsheets, web pages — into clean, usable Markdown in one click.

## What it supports

Files: PDF, Word, Excel, PowerPoint, HTML, CSV, TXT  
URLs: any public webpage

## Run it locally

**Requirements:** Python 3.11+, Node 18+

```bash
git clone https://github.com/moghalsaif/anything-to-markdown.git
cd anything-to-markdown
```

**Backend**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

Built by [moghalsaif](https://github.com/moghalsaif)
