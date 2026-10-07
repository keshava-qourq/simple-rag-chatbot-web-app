"""`/threads` -- create, list, read history, ask a question, rename, delete.

Every handler below is a stub: it returns a typed placeholder so the route
exists, validates against its `response_model`, and shows up correctly in
the OpenAPI document before a development ticket gives it a real body backed
by `app.database.get_db`, the embedding/retrieval pipeline and the provider.
"""

from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas import (
    MessageCreateRequest,
    ThreadCreateResponse,
    ThreadDetailResponse,
    ThreadListResponse,
    ThreadRenameRequest,
    ThreadRenameResponse,
)

router = APIRouter(prefix="/threads", tags=["threads"])


@router.post("", response_model=ThreadCreateResponse, status_code=201)
async def create_thread() -> ThreadCreateResponse:
    """Create a new empty shared thread."""
    return ThreadCreateResponse(id="stub", title="New chat", created_at=datetime.utcnow())


@router.get("", response_model=ThreadListResponse)
async def list_threads(limit: int = 20, cursor: str | None = None) -> ThreadListResponse:
    """All shared threads, newest activity first."""
    return ThreadListResponse(items=[], next_cursor=None)


@router.get("/{thread_id}", response_model=ThreadDetailResponse)
async def get_thread(thread_id: str) -> ThreadDetailResponse:
    """Full ordered history of a thread, with preserved citations."""
    return ThreadDetailResponse(id=thread_id, title="New chat", messages=[])


@router.patch("/{thread_id}", response_model=ThreadRenameResponse)
async def rename_thread(thread_id: str, body: ThreadRenameRequest) -> ThreadRenameResponse:
    """Rename a thread for the whole workspace."""
    return ThreadRenameResponse(id=thread_id, title=body.title)


@router.delete("/{thread_id}", status_code=204)
async def delete_thread(thread_id: str) -> None:
    """Delete a thread and all its messages for everyone; documents are untouched."""
    return None


@router.post("/{thread_id}/messages")
async def ask_question(thread_id: str, body: MessageCreateRequest) -> StreamingResponse:
    """Embed the question, retrieve across the library, stream a grounded
    answer (or the I-don't-know fallback), then persist the turn and citations.

    The real handler streams `text/event-stream` tokens followed by a final
    `{message_id, citations}` event (see `app.schemas.MessageFinalEvent`). The
    stub below closes the stream immediately so the route is exercised without
    a provider key configured.
    """

    async def _empty_stream():
        if False:  # pragma: no cover - makes this an async generator
            yield b""

    return StreamingResponse(_empty_stream(), media_type="text/event-stream")
