"""Handles quiz generation and submission: generates a quiz, stores the answer key server-side,
returns a sanitized version to the client, and grades submissions against the stored key."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.quiz import generate_quiz, explain_missed_questions
from app.quiz_store import store_quiz, get_quiz as get_stored_quiz

router = APIRouter()


class QuizRequest(BaseModel):
    topic_name: str
    document_text: str


class QuizSubmission(BaseModel):
    quiz_id: str
    answers: dict  # {"q1": 2, "q2": 0, ...} -- question id -> selected option index


@router.post("/quiz")
def get_quiz(request: QuizRequest):
    try:
        questions = generate_quiz(request.topic_name, request.document_text)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    quiz_id = store_quiz(request.topic_name, questions)

    # Strip correct_index before sending to the client -- never trust the client to grade itself
    sanitized_questions = [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in questions
    ]

    return {"quiz_id": quiz_id, "questions": sanitized_questions}


@router.post("/quiz/submit")
def submit_quiz(submission: QuizSubmission):
    quiz = get_stored_quiz(submission.quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found or has expired")

    results = []
    missed_questions = []

    for question in quiz["questions"]:
        qid = question["id"]
        submitted_index = submission.answers.get(qid)
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

class ExplainRequest(BaseModel):
    quiz_id: str
    missed_questions: list
    document_text: str


@router.post("/quiz/explain")
def explain_quiz(request: ExplainRequest):
    try:
        result = explain_missed_questions(request.missed_questions, request.document_text)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result