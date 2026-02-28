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

## General Rules

Always use the Context7 MCP when needing library/API documentation, code generation, or setup and configuration steps — do not wait to be asked explicitly.

## Conventions

- One file per domain (notes, expenses, etc.) in each layer
- All frontend API calls live in `frontend/src/api/client.ts`
- Alembic manages all schema changes — no manual SQL
- New feature = new files in each layer + register router in `main.py`

## Git Workflow

### Branching

- `main` is protected — **never commit or push directly to `main`**
- Branch naming: `feature/<name>`, `fix/<name>`, `refactor/<name>`
- Each agent works in its own branch for each task (use worktrees for true parallel work)

### Commits

- Conventional Commits format: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`
- Title ≤ 72 chars, imperative mood ("add", not "added")
- Append co-author footer to every commit:
  ```
  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
  ```
- Never commit `.env` or any file containing secrets

### Safety Rules (hard limits)

- **Never** `git push --force` or `git push --force-with-lease` to any shared branch
- **Never** bypass hooks (`--no-verify`, `--no-gpg-sign`)
- **Never** `git reset --hard` or `git clean -f` without explicit user approval
- **Ask before pushing** — default is: finish work on branch, then ask user before `git push`

### Pull Requests

- Use `gh pr create` with a title (≤70 chars) and body describing what + why
- PR body must include a **Test plan** checklist (what to manually verify)
- **Humans merge all PRs** — agents never run `gh pr merge`
- PRs should be squash-merged to keep `main` history clean

### Multi-Agent Coordination

- Backend agent finishes and pushes its branch before frontend agent begins API integration
- Use `.claude/plan/` files to communicate contracts (API shapes, routes) between agents
- Architect-reviewer runs on the PR branch before it is sent for human review
- If two agents need to work in parallel, each must use a separate branch/worktree

## Auth

No auth in v1. Author field is a plain string enum (`"Ben"` / `"Wife"`). Will become a user FK when auth lands.

## Agent Team

This project is built by a team of specialized agents. Each domain has its own `CLAUDE.md` in its subdirectory (`backend/CLAUDE.md`, `frontend/CLAUDE.md`) with domain-specific context. Agents inherit this root file plus their subdirectory file.

## Agent Plans

- Backend: `.claude/plan/backend.md`
- Frontend: `.claude/plan/frontend.md`
- DevOps/Infra: `.claude/plan/devops.md`
