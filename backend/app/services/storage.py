"""Local filesystem stand-in for the architecture's S3 object store.

Keeps the original upload bytes addressable by `s3_key` so ingestion -- and a
later retry -- can re-read exactly the same file. Swap this for a real
boto3-backed implementation behind the same two functions once S3 is wired
up; nothing that calls `save_original`/`read_original` has to change.
"""

import os
import uuid

from app.config import settings


def save_original(content: bytes, filename: str) -> str:
    """Persist the uploaded bytes and return the key to re-read them by."""
    os.makedirs(settings.storage_dir, exist_ok=True)
    key = f"{uuid.uuid4()}-{filename}"
    path = os.path.join(settings.storage_dir, key)
    with open(path, "wb") as handle:
        handle.write(content)
    return key


def read_original(s3_key: str) -> bytes:
    """Read back exactly what `save_original` wrote for this key."""
    path = os.path.join(settings.storage_dir, s3_key)
    with open(path, "rb") as handle:
        return handle.read()
