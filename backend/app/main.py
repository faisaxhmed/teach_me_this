from fastapi import FastAPI
from app.routes import upload

 # Create the FastAPI application
app = FastAPI()

 # Connect the upload router and its endpoints to the main app
app.include_router(upload.router)


@app.get("/")
def read_root():
    return {"status": "TeachMeThis backend is running"}