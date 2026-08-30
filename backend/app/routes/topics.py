"""Handles topic extraction requests: takes a document's cleaned text and returns structured topics."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.topic_extraction import extract_topics

router = APIRouter()


class TopicRequest(BaseModel):
    text: str


@router.post("/topics")
def get_topics(request: TopicRequest):
    try:
        topics = extract_topics(request.text)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"topics": topics}
