# Backend

FastAPI service for the single shared-workspace RAG chatbot. No sign-in, no
auth, one implicit workspace -- see `app/models.py`.

## Configuration

All credentials and connection strings are read from server-side environment
variables only (`app/config.py`); none has a default that embeds a secret,
and none is ever returned in a response body, a header, a log line or the
OpenAPI schema.

Copy `.env.example` to `.env` and fill in real values for local development,
or set the same variables directly in whatever supplies the process's
environment in deployment (the container platform, a secrets manager, etc.).
The Dockerfile does not read or copy a `.env` file; it expects the runtime to
inject these at container start.

| Variable               | Required | Notes                                                    |
|-------------------------|----------|-----------------------------------------------------------|
| `PROVIDER_API_KEY`      | yes      | Hosted AI provider (embeddings + generation).              |
| `DATABASE_URL`          | no       | `postgresql+psycopg://...`; falls back to local SQLite.    |
| `S3_ENDPOINT`           | yes      | Object storage for original uploaded files.                |
| `S3_BUCKET`             | yes      |                                                             |
| `S3_ACCESS_KEY_ID`      | yes      |                                                             |
| `S3_SECRET_ACCESS_KEY`  | yes      |                                                             |
| `ALLOWED_ORIGINS`       | no       | Comma-separated; defaults to the Vite dev server origins.  |

Startup fails fast, naming the missing variable, if any required one above is
unset (`app.config.validate_required`, called from `app/main.py`).

## Running

```
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Without `DATABASE_URL` set this uses a local SQLite file (`app.db`) so the
service and its tests run without a Postgres server. Point `DATABASE_URL` at
a Postgres instance with pgvector available to get the real `vector(1536)`
column and SQL-level similarity search (`app/vector_search.py`); the
`CREATE EXTENSION IF NOT EXISTS vector` statement and the table migration run
automatically at startup (`app.database.init_db`).

## Tests

```
pytest
ruff check .
```

`tests/conftest.py` sets placeholder values for the required environment
variables so the suite runs without real credentials.
