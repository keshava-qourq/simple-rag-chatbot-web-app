"""`/documents` -- upload, library listing, original download, retry, delete,
status poll.

Upload, status and retry are backed by `app.database.get_db`, the local
object-store stand-in in `app.services.storage` and the ingestion pipeline in
`app.services.ingestion`. Ingestion itself runs as a `BackgroundTasks` job so
the upload/retry response returns immediately with `status: "Processing"`;
`GET /documents/status` is how a client observes the resulting Ready/Failed
transition.
"""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Citation, Document
from app.schemas import (
    DocumentListItem,
    DocumentListResponse,
    DocumentRetryResponse,
    DocumentStatusItem,
    DocumentStatusResponse,
    DocumentUploadResponse,
)
from app.services.ingestion import run_ingestion
from app.services.storage import read_original, save_original

router = APIRouter(prefix="/documents", tags=["documents"])

DbSession = Annotated[Session, Depends(get_db)]


@router.post("", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: DbSession,
) -> DocumentUploadResponse:
    """Store the upload, create a Processing row, enqueue ingestion."""
    content = await file.read()
    filename = file.filename or "unknown"
    s3_key = save_original(content, filename)

    document = Document(
        filename=filename,
        file_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        s3_key=s3_key,
        status="Processing",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    background_tasks.add_task(run_ingestion, document.id, db)

    return DocumentUploadResponse(
        id=document.id,
        filename=document.filename,
        file_type=document.file_type,
        size_bytes=document.size_bytes,
        status=document.status,
    )


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    db: DbSession, limit: int = 20, cursor: str | None = None
) -> DocumentListResponse:
    """Paginated library listing with per-document ingestion status."""
    query = db.query(Document).order_by(Document.uploaded_at.desc(), Document.id.desc())
    if cursor:
        anchor = db.get(Document, cursor)
        if anchor is not None:
            query = query.filter(
                (Document.uploaded_at < anchor.uploaded_at)
                | ((Document.uploaded_at == anchor.uploaded_at) & (Document.id < anchor.id))
            )
    rows = query.limit(limit + 1).all()
    next_cursor = rows[limit].id if len(rows) > limit else None
    rows = rows[:limit]
    return DocumentListResponse(
        items=[
            DocumentListItem(
                id=d.id,
                filename=d.filename,
                file_type=d.file_type,
                size_bytes=d.size_bytes,
                status=d.status,
                failure_reason=d.failure_reason,
                uploaded_at=d.uploaded_at,
            )
            for d in rows
        ],
        next_cursor=next_cursor,
    )


@router.get("/status", response_model=DocumentStatusResponse)
async def poll_document_status(
    db: DbSession, ids: str | None = None
) -> DocumentStatusResponse:
    """Lightweight poll so the library view updates without a reload."""
    query = db.query(Document)
    if ids:
        id_list = [i for i in ids.split(",") if i]
        query = query.filter(Document.id.in_(id_list))
    rows = query.all()
    return DocumentStatusResponse(
        statuses=[
            DocumentStatusItem(id=d.id, status=d.status, failure_reason=d.failure_reason)
            for d in rows
        ]
    )


@router.get("/{document_id}/original")
async def download_original(document_id: str, db: DbSession) -> Response:
    """Stream the original file back with its original filename."""
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="document not found")
    content = read_original(document.s3_key)
    return Response(
        content=content,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{document.filename}"'},
    )


@router.post("/{document_id}/retry", response_model=DocumentRetryResponse)
async def retry_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: DbSession,
) -> DocumentRetryResponse:
    """Re-run ingestion for a Failed document from its stored original."""
    document = db.get(Document, document_id)
    if document is None:
        # No row to re-run: report the requested state without scheduling work.
        return DocumentRetryResponse(id=document_id, status="Processing")
    if document.status != "Failed":
        raise HTTPException(status_code=409, detail="document is not in a Failed state")

    document.status = "Processing"
    document.failure_reason = None
    db.add(document)
    db.commit()

    background_tasks.add_task(run_ingestion, document.id, db)

    return DocumentRetryResponse(id=document.id, status=document.status)


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, db: DbSession) -> None:
    """Delete the document, its chunks/embeddings and its S3 original together,
    and mark historical citations to it as removed."""
    document = db.get(Document, document_id)
    if document is None:
        return None
    db.query(Citation).filter(Citation.document_id == document_id).update({"removed": True})
    db.delete(document)
    db.commit()
    return None
