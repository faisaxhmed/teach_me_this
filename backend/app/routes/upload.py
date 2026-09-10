"""Handles PDF upload requests: saves the file, runs it through the parser, and returns extracted text."""

import os
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends

from app.pdf_parser import extract_text, clean_document
from app.constants import MAX_UPLOAD_BYTES
from app.auth import require_access_token
from app.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = "data/uploads"

PDF_MAGIC_BYTES = b"%PDF-"


@router.post("/upload", dependencies=[Depends(require_access_token)])
@limiter.limit("10/hour")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    # Reject oversized uploads before reading the body into memory or disk.
    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Please upload a file under 15MB.")

    contents = await file.read()

    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Please upload a file under 15MB.")

    # Don't trust the filename extension -- confirm the file is actually a PDF by
    # checking its magic bytes.
    if not contents.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF.")

    # Save the uploaded file to disk so PyMuPDF can open it by path
    safe_filename = os.path.basename(file.filename or "upload.pdf")
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    try:
        text, pages = extract_text(file_path)
    except Exception:
        logger.exception("Failed to parse uploaded PDF: %s", file_path)
        raise HTTPException(status_code=400, detail="Could not read this PDF. Please try a different file.")

    cleaned_text = clean_document(text, pages)

    return {
    "filename": file.filename,
    "page_count": len(pages),
    "text": cleaned_text
}
