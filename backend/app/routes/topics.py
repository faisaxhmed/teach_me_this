"""Handles topic extraction requests: takes a document's cleaned text and returns structured topics."""

import logging

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field

from app.topic_extraction import extract_topics
from app.constants import MAX_DOCUMENT_TEXT_LENGTH
from app.auth import require_access_token
from app.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


class TopicRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_DOCUMENT_TEXT_LENGTH)


@router.post("/topics", dependencies=[Depends(require_access_token)])
@limiter.limit("10/hour")
def get_topics(request: Request, body: TopicRequest):
    try:
        topics = extract_topics(body.text)
    except ValueError:
        logger.exception("Topic extraction failed")
        raise HTTPException(status_code=500, detail="Could not generate topics for this document.")

    return {"topics": topics}
