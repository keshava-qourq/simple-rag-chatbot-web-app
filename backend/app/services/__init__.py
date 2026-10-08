"""Server-only services behind the routers: the provider client, the
ingestion pipeline that uses it, and the original-file store it reads from.

Nothing under here is imported by a schema; these modules are where the
provider key and URL actually get used, and they stay out of any response
body, log line or error message.
"""
