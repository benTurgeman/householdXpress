# HouseholdXpress

Household management app. Phase 1: shared notes. Future: expenses, reminders, calendar integrations.

## Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Backend   | Python 3.12, FastAPI, Poetry      |
| Database  | PostgreSQL 16, SQLAlchemy 2, Alembic |
| Frontend  | React 18, TypeScript, Vite        |
| Infra     | Docker Compose                    |

## Repo Layout

```
househouldXpress/
├── backend/          # FastAPI app (Poetry project)
├── frontend/         # React/TS/Vite app
├── .claude/plan/     # Agent planning docs
│   ├── backend.md
│   ├── frontend.md
│   └── devops.md
├── docker-compose.yml
├── .env.example
└── CLAUDE.md
```

## How to Run

```bash
cp .env.example .env          # fill in secrets
docker compose up --build     # starts db, api, frontend
docker compose exec api alembic upgrade head  # run migrations
```

## Conventions

- One file per domain (notes, expenses, etc.) in each layer
- All frontend API calls live in `frontend/src/api/client.ts`
- Alembic manages all schema changes — no manual SQL
- New feature = new files in each layer + register router in `main.py`

## Auth

No auth in v1. Author field is a plain string enum (`"Ben"` / `"Wife"`). Will become a user FK when auth lands.

## Agent Team

This project is built by a team of specialized agents. Each domain has its own `CLAUDE.md` in its subdirectory (`backend/CLAUDE.md`, `frontend/CLAUDE.md`) with domain-specific context. Agents inherit this root file plus their subdirectory file.

## Agent Plans

- Backend: `.claude/plan/backend.md`
- Frontend: `.claude/plan/frontend.md`
- DevOps/Infra: `.claude/plan/devops.md`
