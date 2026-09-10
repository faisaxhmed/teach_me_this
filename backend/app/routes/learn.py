"""Handles Learn Mode requests: starting a topic session and answering follow-up questions."""

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field

from app.session_store import create_session, get_session, add_message
from app.learn import generate_explanation, answer_followup
from app.constants import MAX_DOCUMENT_TEXT_LENGTH
from app.auth import require_access_token
from app.limiter import limiter

router = APIRouter()


class StartLearnRequest(BaseModel):
    topic_id: str = Field(..., min_length=1, max_length=200)
    topic_name: str = Field(..., min_length=1, max_length=300)
    document_text: str = Field(..., min_length=1, max_length=MAX_DOCUMENT_TEXT_LENGTH)


class FollowupRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=200)
    question: str = Field(..., min_length=1, max_length=500)


@router.post("/learn/start", dependencies=[Depends(require_access_token)])
@limiter.limit("10/hour")
def start_learn(request: Request, body: StartLearnRequest):
    explanation = generate_explanation(body.topic_name, body.document_text)

    session_id = create_session(body.topic_id, body.topic_name, body.document_text)
    add_message(session_id, "assistant", explanation)

    return {"session_id": session_id, "explanation": explanation}


@router.post("/learn/followup", dependencies=[Depends(require_access_token)])
@limiter.limit("10/hour")
def followup(request: Request, body: FollowupRequest):
    if not body.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    session = get_session(body.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or has expired")

    answer = answer_followup(session["document_text"], session["history"], body.question)

    add_message(body.session_id, "user", body.question)
    add_message(body.session_id, "assistant", answer)

    return {"answer": answer}
