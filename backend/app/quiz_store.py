"""In-memory store for generated quizzes, keyed by a random quiz_id.

Same known limitation as session_store: in-memory only, lost on restart.
Exists so grading happens server-side against the real correct answers,
never trusting a client-submitted answer key.
"""

import secrets

_quizzes = {}


def store_quiz(topic_name, questions):
    """Stores a generated quiz and returns its quiz_id."""
    quiz_id = secrets.token_urlsafe(32)
    _quizzes[quiz_id] = {
        "topic_name": topic_name,
        "questions": questions
    }
    return quiz_id


def get_quiz(quiz_id):
    """Returns the stored quiz dict, or None if it doesn't exist."""
    return _quizzes.get(quiz_id)
