"""Handles the password gate: verifying the shared access password and issuing tokens."""

import os
import secrets

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.access_store import issue_token, record_unlock
from app.limiter import limiter

router = APIRouter()


class VerifyRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=200)


@router.post("/access/verify")
@limiter.limit("5/hour")
def verify_access(request: Request, body: VerifyRequest):
    correct_password = os.environ.get("ACCESS_PASSWORD")

    if not correct_password or not secrets.compare_digest(body.password, correct_password):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    record_unlock()
    token = issue_token()
    return {"access_token": token}
