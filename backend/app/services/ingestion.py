"""The ingestion job: chunk a document's stored original, embed each chunk
through the server-side provider call, and record the outcome on the row.

Runs as a FastAPI background task today (see `app/routers/documents.py`);
the body is written against a plain `Session` so it moves to a real queue
worker later without changing.
"""

from sqlalchemy.orm import Session

from app.models import Chunk, Document
from app.services.embeddings import ProviderError, embed_text
from app.services.storage import read_original

_CHUNK_SIZE = 1000


def _chunk_text(text: str) -> list[str]:
    text = text.strip()
    if not text:
        return [""]
    return [text[i : i + _CHUNK_SIZE] for i in range(0, len(text), _CHUNK_SIZE)]


def run_ingestion(document_id: str, db: Session) -> None:
    """Embed a Processing document's chunks and mark it Ready, or Failed
    with the provider's own error message on exhaustion/non-retry failure."""
    document = db.get(Document, document_id)
    if document is None:
        return

    try:
        raw = read_original(document.s3_key)
        text = raw.decode("utf-8", errors="replace")
        pieces = _chunk_text(text)

        db.query(Chunk).filter(Chunk.document_id == document.id).delete()

        new_chunks = []
        for position, piece in enumerate(pieces):
            vector = embed_text(piece)
            new_chunks.append(
                Chunk(document_id=document.id, content=piece, position=position, embedding=vector)
            )

        for chunk in new_chunks:
            db.add(chunk)
        document.status = "Ready"
        document.failure_reason = None
        db.add(document)
        db.commit()
    except ProviderError as exc:
        db.rollback()
        _mark_failed(db, document_id, str(exc))
    except Exception:
        # A non-provider failure (bad file read, etc.) still resolves the
        # document instead of leaving it stuck Processing forever, but never
        # risks leaking internals into failure_reason.
        db.rollback()
        _mark_failed(db, document_id, "ingestion failed unexpectedly")


def _mark_failed(db: Session, document_id: str, reason: str) -> None:
    document = db.get(Document, document_id)
    if document is None:
        return
    document.status = "Failed"
    document.failure_reason = reason
    db.add(document)
    db.commit()
