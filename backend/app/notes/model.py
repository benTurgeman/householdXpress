import enum
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text

from app.database import Base


class Author(str, enum.Enum):
    ben = "Ben"
    wife = "Wife"


class Note(Base):  # type: ignore[misc]
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    author: Author = Column(Enum(Author, name="author_enum"), nullable=False, index=True)  # type: ignore[assignment]
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
