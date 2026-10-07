"""Portable column type for chunk embeddings.

The approved architecture names Postgres with the pgvector extension
(`vector(1536)`) for `chunks.embedding`, so similarity search can run as a
SQL query once a real database is attached. The scaffold's default
`DATABASE_URL` is local SQLite, though (see `app/database.py`), and SQLite has
no vector type -- a column type that only works against one engine would
crash the import on the other.

`EmbeddingVector` picks the real pgvector type when the engine is Postgres,
and falls back to a JSON column of floats on SQLite so the schema still
creates and a row still round-trips. Swap in the real `DATABASE_URL` and nothing
else about the model has to change; similarity search itself is implemented
once pgvector is actually in front of it.
"""

from sqlalchemy import JSON
from sqlalchemy.types import TypeDecorator

EMBEDDING_DIMENSIONS = 1536


class EmbeddingVector(TypeDecorator):
    """`vector(1536)` on Postgres (via pgvector), a JSON float array elsewhere."""

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from pgvector.sqlalchemy import Vector

            return dialect.type_descriptor(Vector(EMBEDDING_DIMENSIONS))
        return dialect.type_descriptor(JSON())
