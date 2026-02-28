# Backend

FastAPI 0.115, Python 3.12, SQLAlchemy 2, Alembic, Poetry.

## Relevant Agents
- **backend-developer** — primary implementation agent
- **architect-reviewer** — reviews PRs before human merge

## Structure

```
app/
├── main.py          # FastAPI app, router registration, CORS
├── config.py        # pydantic-settings (reads .env)
├── database.py      # engine, SessionLocal, Base, get_db()
├── shared/          # cross-domain utilities
└── <domain>/        # one folder per feature (notes, expenses…)
    ├── models.py    # SQLAlchemy models
    ├── schemas.py   # Pydantic request/response schemas
    └── router.py    # APIRouter — register in main.py
```

## Commands

```bash
# Dev server (from repo root via Docker)
docker compose up api

# Tests (inside container or with local venv)
poetry run pytest

# New migration
docker compose exec api alembic revision --autogenerate -m "<description>"
docker compose exec api alembic upgrade head
```

## Conventions

- Inject DB session via `Depends(get_db)` — never import `SessionLocal` directly in routers
- All schema names: `<Model>Create`, `<Model>Update`, `<Model>Out`
- Router prefix: `/<domain>` (e.g. `/notes`)
- No auth in v1 — `author` is a string enum: `"Ben"` | `"Wife"`
- Type-hint everything; no `Any` unless unavoidable

## Adding a New Feature

1. Create `app/<domain>/models.py`, `schemas.py`, `router.py`
2. Register router in `app/main.py`
3. Generate + apply an Alembic migration
4. Add tests in `tests/<domain>/`

## Testing

- pytest with SQLite file DB (`tests/test.db`) — see `tests/conftest.py`
- Fixtures: `db` (session), `client` (TestClient with overridden `get_db`)
- `setup_db` fixture is `autouse=True` — creates/drops tables around each test
- No Docker needed for unit/integration tests
