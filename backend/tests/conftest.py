"""Test-only environment.

`app.main` calls `app.config.validate_required()` at import time, which
raises if the provider key or object-storage credentials are unset. These
are placeholder values for the suite, not real credentials, set before any
test module imports the app.
"""

import os

os.environ.setdefault("PROVIDER_API_KEY", "test-provider-key")
os.environ.setdefault("S3_ENDPOINT", "http://localhost:9000")
os.environ.setdefault("S3_BUCKET", "test-bucket")
os.environ.setdefault("S3_ACCESS_KEY_ID", "test-access-key-id")
os.environ.setdefault("S3_SECRET_ACCESS_KEY", "test-secret-access-key")
