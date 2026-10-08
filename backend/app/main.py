"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. Every generated route
is a stub that returns a typed placeholder, so the service starts, serves its
OpenAPI document and passes its tests before a single handler is implemented.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_allowed_origins, validate_required
from app.database import init_db
from app.routers import documents, threads

# Fail fast, naming the missing variable: a process that starts without a
# provider key or an object-storage credential should crash here, not surface
# a confusing 500 on a user's first upload or question. DATABASE_URL is not
# checked here -- it has a safe, non-secret SQLite fallback (app.config).
validate_required()

app = FastAPI(
    title="Simple RAG chatbot web app",
    description="Build a simple RAG chatbot web app with no sign-in or auth. Single shared workspace.",  # noqa: E501
    version="0.1.0",
)

# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins() or _dev_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creates the pgvector extension (Postgres only) and every table from the
# models in app/models.py. The scaffold ships no migrations beyond this; this
# is the migration path that runs at startup.
init_db()

app.include_router(documents.router)
app.include_router(threads.router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok"}
