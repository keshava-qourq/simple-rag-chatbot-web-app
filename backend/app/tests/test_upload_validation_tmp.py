"""Not collected: `backend/pytest.ini` sets `testpaths = tests` (i.e.
`backend/tests/`), and this ticket's file scope (`backend/app/`,
`backend/app/routers/`) does not include that directory, so new upload
validation tests for `POST /documents` (413 over 25 MB, 415 outside the
pdf/docx/txt/md allowlist) could not be added as a discoverable pytest
module here. See the task report's `risk` field; `backend/tests/test_documents.py`
is the file a reviewer should extend with these cases.
"""
