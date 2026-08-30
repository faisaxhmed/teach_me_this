"""Handles quiz generation requests: takes a topic and document text, returns a multiple-choice quiz."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.quiz import generate_quiz

router = APIRouter()


class QuizRequest(BaseModel):
    topic_name: str
    document_text: str


@router.post("/quiz")
def get_quiz(request: QuizRequest):
    try:
        questions = generate_quiz(request.topic_name, request.document_text)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"questions": questions}
