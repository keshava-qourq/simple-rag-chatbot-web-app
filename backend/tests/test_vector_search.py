"""Unit tests for app.vector_search.

Asserts the similarity search is a plain SQL query with pgvector's `<=>`
operator against the `chunks` table -- not a call to a separate vector store
or index client (AC-066) -- using a fake session so no database server is
required.
"""

from app.vector_search import similarity_search


class _FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def fetchall(self):
        return self._rows


class _FakeSession:
    def __init__(self):
        self.last_sql = None
        self.last_params = None

    def execute(self, statement, params=None):
        self.last_sql = str(statement)
        self.last_params = params
        return _FakeResult([])


def test_similarity_search_orders_by_pgvector_distance_operator() -> None:
    session = _FakeSession()

    similarity_search(session, [0.1, 0.2, 0.3], limit=3)

    assert "chunks" in session.last_sql
    assert "<=>" in session.last_sql
    assert "ORDER BY" in session.last_sql.upper()
    assert session.last_params["limit"] == 3
    assert session.last_params["query_vector"] == "[0.1,0.2,0.3]"


def test_similarity_search_returns_rows_from_execute() -> None:
    session = _FakeSession()

    rows = similarity_search(session, [0.0], limit=1)

    assert rows == []


def test_similarity_search_defaults_limit_to_five() -> None:
    session = _FakeSession()

    similarity_search(session, [1.0, 2.0])

    assert session.last_params["limit"] == 5
