"""Stub coverage for the `/documents` surface.

These assert the routes exist, are wired into the app and return the shape
the api_spec promises -- not that ingestion works, which is not implemented
yet. A development ticket replaces the stub bodies; these tests should keep
passing by construction since they only check the response_model's shape.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_documents_returns_paginated_shape() -> None:
    response = client.get("/documents")

    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "next_cursor" in body


def test_poll_status_returns_statuses_shape() -> None:
    response = client.get("/documents/status")

    assert response.status_code == 200
    assert response.json() == {"statuses": []}


def test_upload_document_accepts_multipart_file() -> None:
    response = client.post(
        "/documents",
        files={"file": ("notes.txt", b"hello world", "text/plain")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["filename"] == "notes.txt"
    assert body["status"] == "Processing"


def test_retry_document_returns_id_and_status() -> None:
    response = client.post("/documents/doc-1/retry")

    assert response.status_code == 200
    assert response.json() == {"id": "doc-1", "status": "Processing"}


def test_delete_document_returns_no_content() -> None:
    response = client.delete("/documents/doc-1")

    assert response.status_code == 204
