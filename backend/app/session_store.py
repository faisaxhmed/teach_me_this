"""In-memory store for Learn Mode sessions, keyed by a random session ID.

Known limitation: sessions live only in this process's memory. A server restart,
redeploy, or running multiple backend instances will lose or fragment session data.
This is an accepted tradeoff for the current stage (no accounts, single local instance).
A production deployment with real concurrent users would replace this with a shared
store like Redis, with the same session_id-based interface.
"""

import secrets

_sessions = {}


def create_session(topic_id, topic_name, document_text):
    """Creates a new Learn session for a topic and returns its session_id."""
    session_id = secrets.token_urlsafe(32)
    _sessions[session_id] = {
        "topic_id": topic_id,
        "topic_name": topic_name,
        "document_text": document_text,
        "history": []
    }
    return session_id


def get_session(session_id):
    """Returns the session dict, or None if it doesn't exist."""
    return _sessions.get(session_id)


def add_message(session_id, role, content):
    """Appends a message to the session's conversation history."""
    _sessions[session_id]["history"].append({"role": role, "content": content})
