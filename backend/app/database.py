"""Engine, session factory and the request-scoped session dependency.

SQLite by default so a fresh clone runs with nothing but `pip install -r
requirements.txt` -- the approved architecture names Postgres with pgvector,
but naming one is not the same as having one, and a scaffold that cannot
start without a database server is a scaffold nobody runs. Point
`DATABASE_URL` (read via `app.config`) at the real thing when it exists;
nothing else has to change.
"""

from collections.abc import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_database_url

DATABASE_URL = get_database_url()

# SQLite rejects a connection made on one thread and used on another, which is
# exactly what happens when FastAPI runs a sync dependency in its threadpool.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base that every generated model inherits."""


def init_db() -> None:
    """Create the pgvector extension (Postgres only), then every table.

    Called once at startup from `app/main.py`. On Postgres this issues
    `CREATE EXTENSION IF NOT EXISTS vector` before `create_all`, so
    `chunks.embedding`'s real `vector(1536)` column type (see
    `app/vector_type.py`) is available when the table is created -- this is
    the migration AC-066 requires running at startup. On SQLite there is no
    extension to create, so this step is skipped and only `create_all` runs,
    which is what lets the service and its tests start without a Postgres
    server.
    """
    if engine.dialect.name == "postgresql":
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    from app import models  # noqa: F401 -- registers tables before create_all

    Base.metadata.create_all(bind=engine)


def get_db() -> Iterator[Session]:
    """One session per request, closed even when the handler raises."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
