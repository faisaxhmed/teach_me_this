"""Handles PDF upload requests: saves the file, runs it through the parser, and returns extracted text."""

import os
from fastapi import APIRouter, UploadFile, File

from app.pdf_parser import extract_text, clean_document
router = APIRouter()

UPLOAD_DIR = "data/uploads"


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Save the uploaded file to disk so PyMuPDF can open it by path
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)

    # Run it through the parser
    text, pages = extract_text(file_path)
    cleaned_text = clean_document(text, pages)

    return {
    "filename": file.filename,
    "page_count": len(pages),
    "text": cleaned_text
}