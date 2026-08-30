from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.routes import upload, topics, learn, quiz


 # Create the FastAPI application
app = FastAPI()

 # Connect the upload router and its endpoints to the main app
app.include_router(upload.router)
app.include_router(topics.router)
app.include_router(learn.router)
app.include_router(quiz.router)

@app.get("/")
def read_root():
    return {"status": "TeachMeThis backend is running"}