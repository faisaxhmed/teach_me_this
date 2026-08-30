"""Handles Learn Mode requests: starting a topic session and answering follow-up questions."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.session_store import create_session, get_session, add_message
from app.learn import generate_explanation, answer_followup

router = APIRouter()


class StartLearnRequest(BaseModel):
    topic_id: str
    topic_name: str
    document_text: str


class FollowupRequest(BaseModel):
    session_id: str
    question: str


@router.post("/learn/start")
def start_learn(request: StartLearnRequest):
    explanation = generate_explanation(request.topic_name, request.document_text)

    session_id = create_session(request.topic_id, request.topic_name, request.document_text)
    add_message(session_id, "assistant", explanation)

    return {"session_id": session_id, "explanation": explanation}


@router.post("/learn/followup")
def followup(request: FollowupRequest):
    session = get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or has expired")

    answer = answer_followup(session["document_text"], session["history"], request.question)

    add_message(request.session_id, "user", request.question)
    add_message(request.session_id, "assistant", answer)

    return {"answer": answer} 