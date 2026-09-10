"""In-memory store for access tokens (the password-gate session) and unlock usage stats.

Same known limitation as session_store/quiz_store: in-memory only, lost on restart,
fragmented across multiple instances. Acceptable for this project's current stage.
"""

import secrets
import time
from datetime import datetime, timezone

TOKEN_LIFETIME_SECONDS = 24 * 60 * 60  # 24 hours

_tokens = {}  # token -> issued_at (epoch seconds)
_unlock_log = []  # list of epoch seconds, one per successful password verification


def issue_token():
    """Creates a new access token and records its issue time."""
    token = secrets.token_urlsafe(32)
    _tokens[token] = time.time()
    return token


def is_token_valid(token):
    """Returns True if the token exists and hasn't expired."""
    if not token:
        return False

    issued_at = _tokens.get(token)
    if issued_at is None:
        return False

    if time.time() - issued_at > TOKEN_LIFETIME_SECONDS:
        del _tokens[token]
        return False

    return True


def record_unlock():
    """Logs a successful password verification for usage tracking."""
    _unlock_log.append(time.time())


def get_stats():
    """Returns total successful unlocks and a per-day breakdown (UTC)."""
    per_day = {}
    for ts in _unlock_log:
        day = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
        per_day[day] = per_day.get(day, 0) + 1

    return {
        "total_unlocks": len(_unlock_log),
        "per_day": dict(sorted(per_day.items()))
    }
