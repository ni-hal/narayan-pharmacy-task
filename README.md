# narayan-pharmacy-task

A pharmacy prescription management system with AI-powered drug interaction checking.

Built with **Next.js** (frontend) + **Express** (backend) + **SQLite** (via sql.js) + **Claude API**.

---

## Features

- **Screen 1 — New Prescription**: Enter patient, doctor, date, and multiple drugs. On submit, Claude checks all pairwise drug-drug interactions and shows a formatted clinical report inline.
- **Screen 2 — Prescriptions List**: Table of all saved prescriptions with drug count and severity badge.
- **Detail View**: Full prescription with AI interaction report showing mechanism, clinical effect, and pharmacist action for each interaction pair.
- **Caching**: Same drug combination is never sent to Claude twice — results cached in DB.
- **Error handling**: API errors shown in UI; form never crashes.

---

## Local Setup (5 commands)

```bash
# 1. Clone and enter project
git clone https://github.com/YOUR_USERNAME/narayan-pharmacy-task.git && cd narayan-pharmacy-task

# 2. Backend setup
cd backend && cp .env.example .env   # add your ANTHROPIC_API_KEY to .env
npm install && node server.js &

# 3. Frontend setup
cd ../frontend && cp .env.example .env.local
npm install && npm run dev
```

Open http://localhost:3000

---

## Environment Variables

**backend/.env**
| Key | Description |
|-----|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |
| `PORT` | Server port (default: 4000) |

**frontend/.env.local**
| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (default: http://localhost:4000) |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (Pages Router), plain CSS |
| Backend | Node.js + Express |
| Database | SQLite via sql.js (zero native deps) |
| AI | Anthropic Claude Sonnet (`@anthropic-ai/sdk`) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/prescriptions` | List all prescriptions |
| `GET` | `/api/prescriptions/:id` | Get single prescription with drugs + interaction |
| `POST` | `/api/prescriptions` | Create prescription, trigger AI check |

---

## Project Structure

```
narayan-pharmacy-task/
├── backend/
│   ├── server.js       # Express API + routes
│   ├── db.js           # SQLite database layer
│   ├── claude.js       # Anthropic SDK integration
│   └── .env.example
└── frontend/
    ├── pages/
    │   ├── index.js              # Prescriptions list
    │   ├── new.js                # New prescription form
    │   └── prescription/[id].js  # Detail view
    ├── components/
    │   └── InteractionResult.js  # Formatted AI result display
    └── .env.example
```
