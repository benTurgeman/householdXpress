from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class AuthorEnum(str, Enum):
    ben = "Ben"
    wife = "Wife"


class NoteCreate(BaseModel):
    author: AuthorEnum
    title: str = Field(..., min_length=1, max_length=255)
    body: str | None = None


class NoteUpdate(BaseModel):
    """All fields optional — PATCH semantics."""

    title: str | None = Field(None, min_length=1, max_length=255)
    body: str | None = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("title cannot be blank")
        return v


class NoteResponse(BaseModel):
    id: int
    author: AuthorEnum
    title: str
    body: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteListResponse(BaseModel):
    items: list[NoteResponse]
    total: int
