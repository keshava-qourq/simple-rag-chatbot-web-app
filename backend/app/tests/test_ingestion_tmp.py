"""Not collected: `backend/pytest.ini` sets `testpaths = tests` (i.e.
`backend/tests/`), and this ticket's file scope does not include that
directory, so unit coverage for `app.services.embeddings`/`ingestion` could
not be added as a discoverable pytest module. See the task report's `risk`
field.
"""
