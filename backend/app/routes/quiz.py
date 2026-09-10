"""Handles quiz generation and submission: generates a quiz, stores the answer key server-side,
returns a sanitized version to the client, and grades submissions against the stored key."""

import logging

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field

from app.quiz import generate_quiz, explain_missed_questions
from app.quiz_store import store_quiz, get_quiz as get_stored_quiz
from app.constants import MAX_DOCUMENT_TEXT_LENGTH
from app.auth import require_access_token
from app.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


class QuizRequest(BaseModel):
    topic_name: str = Field(..., min_length=1, max_length=300)
    document_text: str = Field(..., min_length=1, max_length=MAX_DOCUMENT_TEXT_LENGTH)


class QuizSubmission(BaseModel):
    quiz_id: str = Field(..., min_length=1, max_length=200)
    answers: dict[str, int]  # {"q1": 2, "q2": 0, ...} -- question id -> selected option index


class ExplainRequest(BaseModel):
    quiz_id: str = Field(..., min_length=1, max_length=200)
    missed_questions: list = Field(..., max_length=50)
    document_text: str = Field(..., min_length=1, max_length=MAX_DOCUMENT_TEXT_LENGTH)


@router.post("/quiz", dependencies=[Depends(require_access_token)])
@limiter.limit("10/hour")
def get_quiz(request: Request, body: QuizRequest):
    try:
        questions = generate_quiz(body.topic_name, body.document_text)
    except ValueError:
        logger.exception("Quiz generation failed")
        raise HTTPException(status_code=500, detail="Could not generate a quiz for this topic.")

    quiz_id = store_quiz(body.topic_name, questions)

    # Strip correct_index before sending to the client -- never trust the client to grade itself
    sanitized_questions = [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in questions
    ]

    return {"quiz_id": quiz_id, "questions": sanitized_questions}


@router.post("/quiz/submit", dependencies=[Depends(require_access_token)])
def submit_quiz(submission: QuizSubmission):
    quiz = get_stored_quiz(submission.quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found or has expired")

    valid_question_ids = {q["id"] for q in quiz["questions"]}
    unknown_ids = set(submission.answers) - valid_question_ids
    if unknown_ids:
        raise HTTPException(status_code=422, detail="Submission references questions that don't belong to this quiz.")

    results = []
    missed_questions = []

    for question in quiz["questions"]:
        qid = question["id"]
        option_count = len(question["options"])
        submitted_index = submission.answers.get(qid)

        if submitted_index is not None and not (0 <= submitted_index < option_count):
            raise HTTPException(status_code=422, detail="Submitted answer is out of range for its question.")

        correct = submitted_index == question["correct_index"]

        results.append({
            "id": qid,
            "question": question["question"],
            "correct": correct,
            "correct_index": question["correct_index"],
            "submitted_index": submitted_index
        })

        if not correct:
            missed_questions.append(question)

    return {
        "results": results,
        "score": sum(1 for r in results if r["correct"]),
        "total": len(results),
        "missed_questions_raw": missed_questions
    }


@router.post("/quiz/explain", dependencies=[Depends(require_access_token)])
@limiter.limit("10/hour")
def explain_quiz(request: Request, body: ExplainRequest):
    try:
        result = explain_missed_questions(body.missed_questions, body.document_text)
    except ValueError:
        logger.exception("Quiz explanation generation failed")
        raise HTTPException(status_code=500, detail="Could not generate explanations for these questions.")

    return result
