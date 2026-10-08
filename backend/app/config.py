"""Process-wide configuration read once from the environment.

Every setting an ingestion job needs -- the provider's base URL, which model
to call, the key to call it with, and the retry bounds around a transient
failure -- lives here and nowhere else. Handlers and services read
`settings`; none of them read `os.environ` directly, and none of them ever
put the key into a schema, a log line or an error response.
"""

import os


class Settings:
    """Values are read at import time; override via environment variables."""

    embedding_provider_url: str = os.getenv(
        "EMBEDDING_PROVIDER_URL", "https://api.openai.com/v1/embeddings"
    )
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    # No default: an empty key still lets the app start (and its tests run with
    # the HTTP boundary faked), but a real ingestion call fails loudly instead
    # of silently shipping an empty Authorization header.
    embedding_api_key: str = os.getenv("EMBEDDING_API_KEY", "")
    embedding_max_retries: int = int(os.getenv("EMBEDDING_MAX_RETRIES", "3"))
    embedding_backoff_seconds: float = float(os.getenv("EMBEDDING_BACKOFF_SECONDS", "0.1"))
    # Local stand-in for the architecture's S3 object store -- see
    # app/services/storage.py.
    storage_dir: str = os.getenv("DOCUMENT_STORAGE_DIR", "./data/documents")


settings = Settings()
