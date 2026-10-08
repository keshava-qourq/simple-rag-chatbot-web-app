"""Similarity search over `chunks.embedding`.

Runs as one SQL query against the same Postgres instance that stores the
relational data: pgvector's `<=>` cosine-distance operator in an `ORDER BY`
clause, issued through SQLAlchemy's `text()`. No separate vector store, no
external index client -- see AC-066.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session

_SIMILARITY_SQL = text(
    "SELECT id, document_id, content, position, location "
    "FROM chunks "
    "WHERE embedding IS NOT NULL "
    "ORDER BY embedding <=> :query_vector "
    "LIMIT :limit"
)


def similarity_search(db: Session, query_embedding: list[float], limit: int = 5):
    """Return up to `limit` chunk rows nearest `query_embedding`.

    `query_embedding` is serialized to pgvector's text input format
    (`[v1,v2,...]`) because the parameter travels through a plain SQL string
    rather than the ORM column type.
    """
    query_vector = "[" + ",".join(str(v) for v in query_embedding) + "]"
    result = db.execute(_SIMILARITY_SQL, {"query_vector": query_vector, "limit": limit})
    return result.fetchall()
