"""Stub coverage for the `/threads` surface, mirroring `test_documents.py`."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_thread_returns_a_new_thread() -> None:
    response = client.post("/threads", json={})

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "New chat"
    assert "id" in body and "created_at" in body


def test_list_threads_returns_paginated_shape() -> None:
    response = client.get("/threads")

    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "next_cursor" in body


def test_get_thread_returns_history_shape() -> None:
    response = client.get("/threads/thr-1")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "thr-1"
    assert body["messages"] == []


def test_rename_thread() -> None:
    response = client.patch("/threads/thr-1", json={"title": "Renamed"})

    assert response.status_code == 200
    assert response.json() == {"id": "thr-1", "title": "Renamed"}


def test_delete_thread_returns_no_content() -> None:
    response = client.delete("/threads/thr-1")

    assert response.status_code == 204


def test_ask_question_streams_server_sent_events() -> None:
    response = client.post("/threads/thr-1/messages", json={"content": "What changed?"})

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
