"""`/documents` -- upload, library listing, original download, retry, delete,
status poll.

Every handler below is a stub: it returns a typed placeholder so the route
exists, validates against its `response_model`, and shows up correctly in
the OpenAPI document before a development ticket gives it a real body backed
by `app.database.get_db`, S3 and the ingestion queue.
"""

from fastapi import APIRouter, UploadFile
from fastapi.responses import Response

from app.schemas import (
    DocumentListResponse,
    DocumentRetryResponse,
    DocumentStatusResponse,
    DocumentUploadResponse,
)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(file: UploadFile) -> DocumentUploadResponse:
    """Validate type/size, store in S3, create a Processing row, enqueue ingestion."""
    return DocumentUploadResponse(
        id="stub",
        filename=file.filename or "unknown",
        file_type=(file.content_type or "application/octet-stream"),
        size_bytes=0,
        status="Processing",
    )


@router.get("", response_model=DocumentListResponse)
async def list_documents(limit: int = 20, cursor: str | None = None) -> DocumentListResponse:
    """Paginated library listing with per-document ingestion status."""
    return DocumentListResponse(items=[], next_cursor=None)


@router.get("/status", response_model=DocumentStatusResponse)
async def poll_document_status(ids: str | None = None) -> DocumentStatusResponse:
    """Lightweight poll so the library view updates without a reload."""
    return DocumentStatusResponse(statuses=[])


@router.get("/{document_id}/original")
async def download_original(document_id: str) -> Response:
    """Stream the original file back with its original filename."""
    return Response(
        content=b"",
        media_type="application/octet-stream",
        headers={"Content-Disposition": 'attachment; filename="placeholder"'},
    )


@router.post("/{document_id}/retry", response_model=DocumentRetryResponse)
async def retry_document(document_id: str) -> DocumentRetryResponse:
    """Re-run ingestion for a Failed document from its stored original."""
    return DocumentRetryResponse(id=document_id, status="Processing")


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str) -> None:
    """Delete the document, its chunks/embeddings and its S3 original together,
    and mark historical citations to it as removed."""
    return None
