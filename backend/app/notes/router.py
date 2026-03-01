from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.notes.model import Note
from app.notes.schemas import AuthorEnum, NoteCreate, NoteListResponse, NoteResponse, NoteUpdate
from app.shared.errors import not_found

router = APIRouter(prefix="/notes", tags=["notes"])

DbSession = Annotated[Session, Depends(get_db)]
AuthorFilter = Annotated[AuthorEnum | None, Query()]


@router.get("/", response_model=NoteListResponse)
def list_notes(author: AuthorFilter = None, db: DbSession = ...) -> NoteListResponse:
    stmt = select(Note).order_by(Note.created_at.desc())
    if author:
        stmt = stmt.where(Note.author == author.value)
    notes = db.scalars(stmt).all()
    return NoteListResponse(items=list(notes), total=len(notes))


@router.post("/", response_model=NoteResponse, status_code=201)
def create_note(payload: NoteCreate, db: DbSession) -> Note:
    note = Note(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: DbSession) -> Note:
    note = db.get(Note, note_id)
    if not note:
        raise not_found("Note not found")
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, payload: NoteUpdate, db: DbSession) -> Note:
    note = db.get(Note, note_id)
    if not note:
        raise not_found("Note not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: DbSession) -> None:
    note = db.get(Note, note_id)
    if not note:
        raise not_found("Note not found")
    db.delete(note)
    db.commit()
