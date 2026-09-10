"""Access-control dependencies: the X-Access-Token gate for protected endpoints, and the
separate X-Admin-Key gate for the admin stats endpoint."""

import os
import secrets

from fastapi import Header, HTTPException, Query

from app.access_store import is_token_valid


def require_access_token(x_access_token: str | None = Header(default=None)):
    """FastAPI dependency: raises 401 unless a valid, unexpired access token is present."""
    if not is_token_valid(x_access_token):
        raise HTTPException(status_code=401, detail="Invalid or expired access token.")


def require_admin_key(
    x_admin_key: str | None = Header(default=None),
    admin_key_param: str | None = Query(default=None, alias="admin_key"),
):
    """FastAPI dependency: raises 401 unless the correct admin key is present, either as the
    X-Admin-Key header or an admin_key query param (so the endpoint can be opened directly
    in a browser as a link, not just called from curl/Postman)."""
    admin_key = os.environ.get("ADMIN_KEY")
    submitted = x_admin_key or admin_key_param

    if not admin_key or not submitted or not secrets.compare_digest(submitted, admin_key):
        raise HTTPException(status_code=401, detail="Invalid admin key.")
