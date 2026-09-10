from dotenv import load_dotenv
load_dotenv()

import logging
import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.routes import upload, topics, learn, quiz, access, admin
from app.limiter import limiter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

 # Create the FastAPI application
app = FastAPI()

app.state.limiter = limiter

# Comma-separated list of allowed frontend origins, e.g.
# "http://localhost:5173,https://your-vercel-url.vercel.app". Falls back to just the
# local Vite dev server if the env var isn't set, so local dev still works safely.
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS")
allowed_origins = (
    [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    if allowed_origins_env
    else ["http://localhost:5173"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "You've reached the hourly limit. Please try again later."}
    )


@app.exception_handler(RequestValidationError)
def validation_error_handler(request: Request, exc: RequestValidationError):
    # Keep the client-facing message short and non-technical; log the full detail
    # (field paths, types) server-side only.
    logger.info("Request validation failed for %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": "The request contains invalid or missing data."}
    )


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."}
    )

 # Connect the routers and their endpoints to the main app
app.include_router(access.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(topics.router)
app.include_router(learn.router)
app.include_router(quiz.router)

@app.get("/")
def read_root():
    return {"status": "TeachMeThis backend is running"}
