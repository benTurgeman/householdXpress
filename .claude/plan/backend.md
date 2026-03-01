# HouseholdXpress — Backend Plan (Phase 1: Shared Notes)

## 1. Project Structure

```
backend/
├── pyproject.toml
├── poetry.lock
├── alembic.ini
├── Dockerfile
├── .env.example
│
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 0001_create_notes.py
│
└── app/
    ├── __init__.py
    ├── main.py          # App factory, CORS, router registration
    ├── config.py        # pydantic-settings
    ├── database.py      # Engine, SessionLocal, get_db dep
    │
    ├── notes/
    │   ├── __init__.py
    │   ├── model.py     # Note ORM model + Author enum
    │   ├── schemas.py   # Pydantic request/response schemas
    │   └── router.py    # APIRouter for /notes
    │
    └── shared/
        ├── __init__.py
        └── errors.py    # Standardised HTTP error helpers
```

Convention: one directory per domain (`notes/`), each with `model.py`, `schemas.py`, `router.py`.
Future domains (expenses, reminders) replicate this pattern.

---

## 2. Database Model (`app/notes/model.py`)

```python
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from app.database import Base


class Author(str, enum.Enum):
    ben = "Ben"
    wife = "Wife"


class Note(Base):
    __tablename__ = "notes"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    author     = Column(Enum(Author, name="author_enum"), nullable=False, index=True)
    title      = Column(String(255), nullable=False)
    body       = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False,
                        default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False,
                        default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `INTEGER` serial | PK | Simple surrogate; upgrade to UUID in later migration if needed |
| `author` | `ENUM('Ben','Wife')` | NOT NULL, indexed | Enforced at DB level; index for filtered list queries |
| `title` | `VARCHAR(255)` | NOT NULL | Never empty |
| `body` | `TEXT` | nullable | Title-only stub is valid |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Always UTC |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Auto-updated on every change |

**Auth migration path:** When auth lands, drop `author_enum` column, add `author_id FK → users.id`, seed `users` table with `Ben`/`Wife` rows, back-fill `author_id`.

---

## 3. Alembic Setup

### `alembic.ini` key setting
```ini
sqlalchemy.url = %(DATABASE_URL)s   # interpolated from env at runtime
```

### `alembic/env.py` key configuration
```python
import os
from app.database import Base
from app.notes.model import Note  # noqa — registers metadata

config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])
target_metadata = Base.metadata
```

### `alembic/versions/0001_create_notes.py`
```python
def upgrade() -> None:
    op.execute("CREATE TYPE author_enum AS ENUM ('Ben', 'Wife')")
    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("author", sa.Enum("Ben", "Wife", name="author_enum"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notes_author", "notes", ["author"])

def downgrade() -> None:
    op.drop_index("ix_notes_author", table_name="notes")
    op.drop_table("notes")
    op.execute("DROP TYPE author_enum")
```

Migration file naming: zero-padded sequential prefix (`0001_`, `0002_`, ...).

---

## 4. Pydantic Schemas (`app/notes/schemas.py`)

```python
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class AuthorEnum(str, Enum):
    ben = "Ben"
    wife = "Wife"


class NoteCreate(BaseModel):
    author: AuthorEnum
    title: str = Field(..., min_length=1, max_length=255)
    body: Optional[str] = None


class NoteUpdate(BaseModel):
    """All fields optional — PATCH semantics."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    body: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("title cannot be blank")
        return v


class NoteResponse(BaseModel):
    id: int
    author: AuthorEnum
    title: str
    body: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class NoteListResponse(BaseModel):
    items: list[NoteResponse]
    total: int
```

Key decisions:
- `NoteUpdate` all-optional → proper HTTP PATCH (only supplied fields applied).
- `NoteCreate` never accepts `created_at`/`updated_at` — server-generated only.
- `NoteListResponse` envelope with `total` enables future pagination without an API change.

---

## 5. API Endpoints (`app/notes/router.py`)

All paths are relative to the router prefix `/notes`; registered globally under `/api/v1`.

| Method | Path | Request | Response | Status |
|---|---|---|---|---|
| `GET` | `/` | `?author=Ben\|Wife` (optional) | `NoteListResponse` | 200 |
| `POST` | `/` | `NoteCreate` body | `NoteResponse` | 201 |
| `GET` | `/{note_id}` | — | `NoteResponse` | 200 |
| `PATCH` | `/{note_id}` | `NoteUpdate` body | `NoteResponse` | 200 |
| `DELETE` | `/{note_id}` | — | empty | 204 |

```python
router = APIRouter(prefix="/notes", tags=["notes"])

@router.get("/", response_model=NoteListResponse)
def list_notes(author: Optional[AuthorEnum] = Query(None), db: Session = Depends(get_db)):
    stmt = select(Note).order_by(Note.created_at.desc())
    if author:
        stmt = stmt.where(Note.author == author.value)
    notes = db.scalars(stmt).all()
    return NoteListResponse(items=notes, total=len(notes))

@router.post("/", response_model=NoteResponse, status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    note = Note(**payload.model_dump())
    db.add(note); db.commit(); db.refresh(note)
    return note

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note: raise HTTPException(404, "Note not found")
    return note

@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note: raise HTTPException(404, "Note not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit(); db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note: raise HTTPException(404, "Note not found")
    db.delete(note); db.commit()
```

---

## 6. FastAPI App (`app/main.py`)

```python
app.add_middleware(CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Note: CORS is only enforced by browsers. Native iOS/Android clients (Expo Go,
# standalone app) do not send CORS preflight requests — the middleware is a no-op
# for them. It only matters for Expo Web or when accessing /docs from a browser.

@app.get("/health", include_in_schema=False)
def health(): return {"status": "ok"}

app.include_router(notes_router, prefix="/api/v1")
# Future: app.include_router(expenses_router, prefix="/api/v1")
```

All domain routers registered with `prefix="/api/v1"`. Each router carries its own sub-prefix (e.g. `/notes`), yielding final paths like `/api/v1/notes/`.

---

## 7. Environment Variables

| Variable | Example | Required | Notes |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://household:secret@db:5432/household` | Yes | Full PostgreSQL DSN |
| `CORS_ORIGINS` | `["http://localhost:8081"]` | No | JSON list; Metro bundler port. Only enforced by browser clients (Expo Web, Swagger UI) — native clients ignore CORS. |
| `DEBUG` | `false` | No | Enables SQLAlchemy echo logging |

---

## 8. Dependencies (`pyproject.toml`)

```toml
[tool.poetry.dependencies]
python       = "^3.12"
fastapi      = "^0.115"
uvicorn      = {extras = ["standard"], version = "^0.29"}
sqlalchemy   = "^2.0"
alembic      = "^1.13"
psycopg2-binary = "^2.9"
pydantic-settings = "^2.3"

[tool.poetry.group.dev.dependencies]
pytest       = "^8.2"
pytest-asyncio = "^0.23"
httpx        = "^0.27"
```

---

## 9. Implementation Order

1. `pyproject.toml` + lockfile
2. `app/config.py`
3. `app/database.py`
4. `app/notes/model.py`
5. `alembic/` setup + `0001_create_notes.py`
6. `app/notes/schemas.py`
7. `app/notes/router.py`
8. `app/main.py`
9. `Dockerfile`
10. Smoke test: `docker compose up`, run migration, hit `/docs`, exercise all 5 endpoints
