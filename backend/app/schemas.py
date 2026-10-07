"""Pydantic request/response models, one per shape the approved api_spec
declares.

These are the contract the routers are typed against. Every router handler
is a stub -- see `app/routers/` -- but its response_model is the real shape
from the spec, so the OpenAPI document a frontend or an SDK generator reads
is already correct, and a development ticket fills in the body behind a
signature that does not change.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    status: str


class DocumentListItem(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    status: str
    failure_reason: str | None = None
    uploaded_at: datetime


class DocumentListResponse(BaseModel):
    items: list[DocumentListItem]
    next_cursor: str | None = None


class DocumentRetryResponse(BaseModel):
    id: str
    status: str


class DocumentStatusItem(BaseModel):
    id: str
    status: str
    failure_reason: str | None = None


class DocumentStatusResponse(BaseModel):
    statuses: list[DocumentStatusItem]


class ThreadCreateResponse(BaseModel):
    id: str
    title: str
    created_at: datetime


class ThreadListItem(BaseModel):
    id: str
    title: str
    last_activity_at: datetime


class ThreadListResponse(BaseModel):
    items: list[ThreadListItem]
    next_cursor: str | None = None


class CitationOut(BaseModel):
    id: str
    document_id: str | None = None
    chunk_id: str | None = None
    document_name_snapshot: str
    passage_text: str
    location: str | None = None
    removed: bool = False


class MessageOut(BaseModel):
    role: str
    content: str
    incomplete: bool = False
    citations: list[CitationOut] = Field(default_factory=list)


class ThreadDetailResponse(BaseModel):
    id: str
    title: str
    messages: list[MessageOut]


class ThreadRenameRequest(BaseModel):
    title: str


class ThreadRenameResponse(BaseModel):
    id: str
    title: str


class MessageCreateRequest(BaseModel):
    content: str


class MessageFinalEvent(BaseModel):
    """The last event of the `POST /threads/{id}/messages` SSE stream.

    The stream itself is tokens of plain text followed by this JSON payload;
    it is documented here so the shape is typed somewhere, even though an
    `EventSourceResponse` does not use it as a `response_model`.
    """

    message_id: str
    citations: list[CitationOut] = Field(default_factory=list)
