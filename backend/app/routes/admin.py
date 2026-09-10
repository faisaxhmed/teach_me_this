"""Admin-only usage stats. Protected by X-Admin-Key, separate from the access password.
Not linked from anywhere in the frontend UI."""

from fastapi import APIRouter, Depends

from app.access_store import get_stats
from app.auth import require_admin_key

router = APIRouter()


@router.get("/admin/stats", dependencies=[Depends(require_admin_key)])
def admin_stats():
    return get_stats()
