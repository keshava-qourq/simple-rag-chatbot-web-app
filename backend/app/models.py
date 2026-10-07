"""SQLAlchemy models for the approved data model.

Five entities, straight from the architecture: `documents` and their
`chunks` (the ingestion side), `threads` and `messages` (the chat side), and
`citations`, which links an answer back to the passage it was grounded in.
`Base` is bound to the engine in `app/database.py`; `main.py` imports this
module before it calls `create_all`, so every table here gets created.

Primary keys are stored as `String(36)` UUIDs rather than a native UUID
column: the scaffold's default engine is SQLite (see `app/database.py`),
which has no UUID type, and a column that only works on Postgres is a column
that cannot be developed against until the real database exists.
"""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy import DateTime as SqlDateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.vector_type import EmbeddingVector


def _uuid() -> str:
    return str(uuid.uuid4())


class Document(Base):
    """An uploaded original file and its ingestion status."""

    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    filename: Mapped[str] = mapped_column(Text, nullable=False)
    file_type: Mapped[str] = mapped_column(Text, nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    # Key into the original-file store (S3 in production; see architecture.objstore).
    s3_key: Mapped[str] = mapped_column(Text, nullable=False)
    # One of: Processing, Ready, Failed.
    status: Mapped[str] = mapped_column(Text, nullable=False, default="Processing")
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        SqlDateTime(timezone=True), default=datetime.utcnow
    )

    chunks: Mapped[list["Chunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class Chunk(Base):
    """One retrievable passage of a document, with its embedding."""

    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    # Human-readable source locator, e.g. "Page 4" or "Lines 10-20".
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    embedding: Mapped[list[float] | None] = mapped_column(EmbeddingVector, nullable=True)

    document: Mapped["Document"] = relationship(back_populates="chunks")


class Thread(Base):
    """A shared chat thread."""

    __tablename__ = "threads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(Text, nullable=False, default="New chat")
    created_at: Mapped[datetime] = mapped_column(
        SqlDateTime(timezone=True), default=datetime.utcnow
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        SqlDateTime(timezone=True), default=datetime.utcnow
    )

    messages: Mapped[list["Message"]] = relationship(
        back_populates="thread", cascade="all, delete-orphan", order_by="Message.created_at"
    )


class Message(Base):
    """One turn in a thread: a user question or an assistant answer."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    thread_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("threads.id", ondelete="CASCADE"), nullable=False
    )
    # One of: user, assistant.
    role: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # True when the SSE stream dropped mid-answer; the partial text is kept.
    incomplete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        SqlDateTime(timezone=True), default=datetime.utcnow
    )

    thread: Mapped["Thread"] = relationship(back_populates="messages")
    citations: Mapped[list["Citation"]] = relationship(
        back_populates="message", cascade="all, delete-orphan"
    )


class Citation(Base):
    """A grounding reference from an assistant message to a document passage.

    `document_name_snapshot` and `passage_text` are copied at answer time so a
    past answer still reads correctly after its source document is deleted;
    `removed` flips to true instead of the row being deleted, per the
    architecture note that a document delete marks historical citations
    rather than erasing them.
    """

    __tablename__ = "citations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    message_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False
    )
    document_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True
    )
    chunk_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("chunks.id", ondelete="SET NULL"), nullable=True
    )
    document_name_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    passage_text: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    removed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    message: Mapped["Message"] = relationship(back_populates="citations")


__all__ = [
    "Base",
    "Document",
    "Chunk",
    "Thread",
    "Message",
    "Citation",
]
