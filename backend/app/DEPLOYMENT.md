# Deployment posture

This API has no authentication, no login, no session, and no per-user
identity. This is by design for release one, not an oversight. Every route
runs the request as the single shared workspace; there is no role check, no
ownership filter, and no per-user attribution anywhere in the codebase.

Protection comes entirely from where the service is deployed, not from
anything the application checks:

- Deploy behind an unlisted URL that is not linked from a public index, or
- Deploy on an internal network that is not reachable from the public
  internet (a VPN, a private subnet, an internal load balancer).

Anyone who reaches the deployed URL, with no credentials at all, can read
every document in the library, read every chat thread, ask questions against
the shared content, and delete any document or thread. There is no
confirmation step beyond what the UI itself presents, and no way to scope
access to a subset of users or content. If the URL leaks, the workspace is
fully exposed.

## Environment variables

Every environment variable the server reads is listed below. None of them
are ever sent to the browser: they are read once at process startup by
`app/config.py`, used only inside server-side service code
(`app/services/embeddings.py`, `app/services/storage.py`,
`app/database.py`), and never placed in a response body, a schema field, or
a log line.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PROVIDER_API_KEY` | yes | Shared hosted-provider key; startup fails if unset. |
| `S3_ENDPOINT` | yes | Object-store endpoint for original file storage. |
| `S3_BUCKET` | yes | Object-store bucket name. |
| `S3_ACCESS_KEY_ID` | yes | Object-store access key. |
| `S3_SECRET_ACCESS_KEY` | yes | Object-store secret key. |
| `DATABASE_URL` | no | Database connection string; falls back to a local SQLite file. |
| `ALLOWED_ORIGINS` | no | Comma-separated list of origins the CORS middleware allows; falls back to the local dev server origins. |
| `EMBEDDING_PROVIDER_URL` | no | Embedding API endpoint; defaults to OpenAI's. |
| `EMBEDDING_MODEL` | no | Embedding model name. |
| `EMBEDDING_API_KEY` | no | Embedding-specific key; falls back to `PROVIDER_API_KEY` when unset. |
| `EMBEDDING_MAX_RETRIES` | no | Retry bound for a retryable embedding failure. |
| `EMBEDDING_BACKOFF_SECONDS` | no | Base backoff between embedding retries. |
| `DOCUMENT_STORAGE_DIR` | no | Local directory standing in for the S3 object store. |

## Scope

The only scope in release one is a single shared workspace. There are no
tenants, no accounts, and no per-user data partitioning. Every document and
every thread is visible to, and mutable by, anyone who can reach the
deployed URL.
