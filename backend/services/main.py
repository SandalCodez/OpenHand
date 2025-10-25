from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from UserAuth import auth_router as auth_router
from LessonService import lesson_router as lesson_router

app = FastAPI(title="OpenHand ASL API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://openhand-9l72bu5i3-estebans-projects-ddc68837.vercel.app",
        "https://openhand-eight.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(lesson_router)
# app.include_router(progress_router)  # Add when ready

@app.get("/")
async def root():
    return {"message": "OpenHand API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)