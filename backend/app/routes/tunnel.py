"""
Sentry Envelope Tunnel

Proxies Sentry envelopes through our own domain so that browser
ad-blockers and privacy extensions do not drop the requests.

The frontend POSTs envelopes to  POST /api/oversight
and this route forwards them to the real Sentry ingest endpoint
parsed from the DSN inside the envelope header.
"""

import logging
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Request, Response

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Internal"])

# Sentry hosts we accept (prevent open-relay abuse)
_ALLOWED_HOSTS = {"sentry.io", "ingest.sentry.io"}


def _is_allowed_host(host: str) -> bool:
    """Return True if the host ends with an allowed Sentry domain."""
    for allowed in _ALLOWED_HOSTS:
        if host == allowed or host.endswith(f".{allowed}"):
            return True
    return False


@router.post("/api/oversight")
async def sentry_tunnel(request: Request) -> Response:
    """
    Accept a Sentry envelope, extract the real ingest URL from the
    envelope header's ``dsn`` field, and forward the payload.
    """
    try:
        body = await request.body()
        # The first line of a Sentry envelope is a JSON header containing the DSN
        header_line = body.split(b"\n", 1)[0]

        import json
        header = json.loads(header_line)
        dsn = header.get("dsn")
        if not dsn:
            return Response(status_code=400, content="Missing DSN in envelope header")

        parsed = urlparse(dsn)
        if not _is_allowed_host(parsed.hostname or ""):
            return Response(status_code=403, content="Disallowed Sentry host")

        project_id = parsed.path.strip("/")
        upstream = f"https://{parsed.hostname}/api/{project_id}/envelope/"

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                upstream,
                content=body,
                headers={"Content-Type": "application/x-sentry-envelope"},
                timeout=10.0,
            )

        return Response(
            status_code=resp.status_code,
            content=resp.content,
        )

    except Exception as exc:
        logger.warning("Sentry tunnel error: %s", exc)
        # Return 200 so misbehaving clients do not retry storms; Sentry already lost this envelope.
        return Response(status_code=200, content="ok")
