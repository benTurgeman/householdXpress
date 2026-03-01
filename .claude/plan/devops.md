# HouseholdXpress — DevOps / Infra Plan (Phase 1)

## Services

Two containers, one network:

| Service | Image | Port (host→container) | Role |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432→5432 | PostgreSQL database |
| `api` | built from `backend/Dockerfile` | 8000→8000 | FastAPI app (uvicorn) |

> **Frontend is not containerised.** Expo runs on the host machine via `npx expo start`. Physical devices connect to the API over the LAN using `EXPO_PUBLIC_API_URL`.

---

## `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB:       ${POSTGRES_DB}
      POSTGRES_USER:     ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    build:
      context: ./backend
      target: runtime        # multi-stage: only the runtime layer
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      CORS_ORIGINS: '["http://localhost:8081"]'   # Metro bundler; only relevant for Expo Web / browser clients
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

**No migrations on startup.** Migrations are run explicitly:
```bash
docker compose exec api alembic upgrade head
```
This avoids race conditions and keeps migration output visible.

---

## Backend Dockerfile (`backend/Dockerfile`)

Multi-stage build — keeps the runtime image lean:

```dockerfile
# --- build stage ---
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.in-project true \
 && poetry install --without dev --no-root

# --- runtime stage ---
FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=builder /app/.venv .venv
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## `.env.example`

```env
# PostgreSQL
POSTGRES_DB=household
POSTGRES_USER=household
POSTGRES_PASSWORD=changeme

# Backend (these are derived in docker-compose — not needed in .env directly)
# DATABASE_URL is composed by docker-compose from the POSTGRES_* vars above

# Frontend (Expo — runs on host, not in Docker)
# Use your machine's LAN IP so physical devices can reach the API
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

---

## Startup Sequence

```bash
# 1. Configure secrets
cp .env.example .env   # edit POSTGRES_PASSWORD and set your LAN IP in EXPO_PUBLIC_API_URL

# 2. Build and start backend services
docker compose up --build

# 3. Run migrations (first time, and after every new migration file)
docker compose exec api alembic upgrade head

# 4. Verify backend
curl http://localhost:8000/health          # → {"status":"ok"}
curl http://localhost:8000/api/v1/notes/   # → {"items":[],"total":0}

# 5. Start frontend (separate terminal, on host)
cd frontend && npx expo start              # scan QR with Expo Go on your iPhone
```

---

## Service Dependency & Networking

```
Expo Go (iPhone / simulator)
  │  :8000  (EXPO_PUBLIC_API_URL → host LAN IP from device)
  ▼
api (FastAPI/uvicorn)
  │  :5432  (DATABASE_URL → db service on Docker network)
  ▼
db (PostgreSQL)
```

`EXPO_PUBLIC_API_URL` is baked into the JS bundle at Metro build time. The device makes native fetch calls directly to the API's LAN IP — there is no intermediate container and no browser-enforced CORS on native connections.

---

## Health Check

`GET /health` on the API has no DB dependency — returns `{"status":"ok"}` immediately after startup. Used by Docker's `depends_on` health probe and future load balancers.

---

## Future Considerations

- **Production builds:** Use EAS Build (`eas build --platform ios`) to produce a standalone `.ipa`. No Docker container is needed for the frontend at any stage.
- **Migrations in CI:** Add a step that spins up a throw-away Postgres container, runs `alembic upgrade head`, and verifies no errors.
- **Secrets management:** Move from `.env` file to Docker secrets or a secrets manager when the app goes beyond local use.
