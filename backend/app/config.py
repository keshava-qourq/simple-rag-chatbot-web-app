"""Process-wide configuration read once from the environment.

Every setting an ingestion job needs -- the provider's base URL, which model
to call, the key to call it with, and the retry bounds around a transient
failure -- lives here and nowhere else. Handlers and services read
`settings`/the functions below; none of them read `os.environ` directly, and
none of them ever put a key into a schema, a log line or an error response.
"""

import os


class ConfigError(Exception):
    """Raised when a required environment variable is missing."""


def get_database_url() -> str:
    """`DATABASE_URL`, or the local SQLite fallback `app/database.py` uses."""
    return os.getenv("DATABASE_URL", "sqlite:///./app.db")


def get_provider_api_key() -> str:
    """The shared hosted-provider key; raises, naming the variable, if unset."""
    value = os.getenv("PROVIDER_API_KEY")
    if not value:
        raise ConfigError("PROVIDER_API_KEY is required")
    return value


def get_s3_config() -> dict[str, str]:
    """The four S3-compatible object-store settings; raises on the first
    missing one, naming it."""
    required = ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]
    values: dict[str, str] = {}
    for name in required:
        value = os.getenv(name)
        if not value:
            raise ConfigError(f"{name} is required")
        values[name] = value
    return values


def get_allowed_origins() -> list[str]:
    """Comma-separated `ALLOWED_ORIGINS`, trimmed; empty list when unset."""
    raw = os.getenv("ALLOWED_ORIGINS", "")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def validate_required() -> None:
    """Fail fast at startup, naming the first missing required variable."""
    get_provider_api_key()
    get_s3_config()


class Settings:
    """Embedding-provider and storage settings; read at import time."""

    embedding_provider_url: str = os.getenv(
        "EMBEDDING_PROVIDER_URL", "https://api.openai.com/v1/embeddings"
    )
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    # Falls back to the shared PROVIDER_API_KEY so a single required
    # credential configures both startup validation and embedding calls; an
    # empty value still lets the app start (and its tests run with the HTTP
    # boundary faked), but a real ingestion call fails loudly instead of
    # silently shipping an empty Authorization header.
    embedding_api_key: str = os.getenv("EMBEDDING_API_KEY", "") or os.getenv("PROVIDER_API_KEY", "")
    embedding_max_retries: int = int(os.getenv("EMBEDDING_MAX_RETRIES", "3"))
    embedding_backoff_seconds: float = float(os.getenv("EMBEDDING_BACKOFF_SECONDS", "0.1"))
    # Local stand-in for the architecture's S3 object store -- see
    # app/services/storage.py.
    storage_dir: str = os.getenv("DOCUMENT_STORAGE_DIR", "./data/documents")


settings = Settings()
