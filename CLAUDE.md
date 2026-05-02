# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**findU** is a university discovery web app that ranks Korean universities by commute time from a user-supplied home address. It uses the Naver Maps API for geocoding and driving directions.

## Commands

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build
```

### Environment Variables
The backend requires a `.env` file in `backend/`:
```
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```
Without these, the app falls back to fake commute times (driving time × 1.3 + 15 min).

## Architecture

### Backend (`backend/`)
| File | Role |
|---|---|
| `main.py` | FastAPI app, CORS config, two endpoints |
| `models.py` | Pydantic models: `SearchRequest`, `SearchResponse`, `University` |
| `commute_service.py` | Orchestrates geocoding + route calculation for all universities |
| `naver_client.py` | Naver Geocoding API + Naver Directions 5 API calls |
| `universities.py` / `universities.json` | Static list of ~20 Seoul/metro-area universities |

**API endpoints:**
- `GET /api/universities` — returns the static university list
- `POST /api/commute` — takes `{ address, transport_mode, max_time }`, returns universities sorted by commute time

Transit time is mocked (no dedicated Naver transit API): `driving_minutes * 1.3 + 15`.

### Frontend (`frontend/src/`)
| Path | Role |
|---|---|
| `App.tsx` | React Router setup (`/`, `/universities`, `/about`) |
| `hooks/useSearch.ts` | Central search state and API call logic |
| `api.ts` | `fetch` wrappers for backend endpoints |
| `types/university.ts` | Shared TypeScript interfaces |
| `components/` | UI components (SearchForm, ResultList, MapContainer, etc.) |
| `data/` | Static university data + autocomplete list mirrored from backend |

**Data flow:** `MinimalSearchBar` → `useSearch` hook → `POST /api/commute` → `FadeInList` renders sorted results with Framer Motion animations.

## Tech Stack

- **Backend:** Python, FastAPI, Pydantic, python-dotenv, httpx
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v7, Framer Motion
- **External API:** Naver Cloud Platform (geocoding + Directions 5)
