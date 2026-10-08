"""Server-to-server calls to the hosted embedding provider.

This is the only module that ever holds the provider URL, model name or API
key (all read from `app.config.settings`); none of the three is logged, and
none is ever attached to a request/response object a client can see. A
provider 429 or 5xx is classified as retryable and bounded by
`settings.embedding_max_retries`; anything else fails on the first attempt
without spending retry budget, per AC-019.
"""

import time

import httpx

from app.config import settings


class ProviderError(Exception):
    """Base for provider-side embedding failures.

    The message carries only the provider's own error text (or a generic
    status description) -- never the request payload, the URL or the key --
    so it is safe to store verbatim as `document.failure_reason`.
    """


class RetryableProviderError(ProviderError):
    """A 429 or 5xx/transient-network failure -- worth another attempt."""


class NonRetryableProviderError(ProviderError):
    """Any other provider error -- fails immediately, no retry spent."""


def _error_message(response: httpx.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        return f"provider returned status {response.status_code}"
    if isinstance(body, dict):
        error = body.get("error")
        if isinstance(error, dict) and error.get("message"):
            return str(error["message"])
        if body.get("message"):
            return str(body["message"])
    return f"provider returned status {response.status_code}"


def _call_provider(text: str) -> list[float]:
    if not settings.embedding_api_key:
        # No key configured: fail closed rather than firing an unauthenticated
        # request at the provider. This also keeps any environment that has
        # not set EMBEDDING_API_KEY (e.g. a bare test run) from ever making a
        # live network call.
        raise NonRetryableProviderError("embedding provider API key is not configured")

    headers = {"Authorization": f"Bearer {settings.embedding_api_key}"}
    payload = {"model": settings.embedding_model, "input": text}
    try:
        response = httpx.post(
            settings.embedding_provider_url, json=payload, headers=headers, timeout=30.0
        )
    except httpx.TransportError as exc:
        raise RetryableProviderError(f"transient network error: {exc.__class__.__name__}") from None

    if response.status_code == 429 or response.status_code >= 500:
        raise RetryableProviderError(_error_message(response))
    if response.status_code >= 400:
        raise NonRetryableProviderError(_error_message(response))

    body = response.json()
    try:
        return list(body["data"][0]["embedding"])
    except (KeyError, IndexError, TypeError) as exc:
        raise NonRetryableProviderError("malformed provider response") from exc


def embed_text(text: str, *, sleep: "object | None" = None) -> list[float]:
    """Embed one chunk of text, retrying a retryable failure up to the
    configured bound with backoff; a non-retryable failure raises on the
    first attempt."""
    _sleep = sleep if sleep is not None else time.sleep
    max_attempts = max(1, settings.embedding_max_retries)
    last_error: RetryableProviderError | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            return _call_provider(text)
        except RetryableProviderError as exc:
            last_error = exc
            if attempt < max_attempts:
                _sleep(settings.embedding_backoff_seconds * attempt)

    assert last_error is not None  # loop always sets this before exhausting
    raise last_error
