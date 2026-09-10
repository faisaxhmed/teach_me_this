"""Shared limits used across upload and request validation."""

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15MB

# Extracted text from a 15MB PDF is comfortably under this even for dense, text-heavy
# documents. Applied to any endpoint that accepts document_text directly, so a client
# can't bypass the upload size limit by sending a giant text payload straight to
# /topics, /quiz, or /learn/start instead of going through /upload.
MAX_DOCUMENT_TEXT_LENGTH = 2_000_000
