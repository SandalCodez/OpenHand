from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import firestore

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from FireStoreDB import FireStoreDB

db = FireStoreDB()
client = db.connect()

lesson_router = APIRouter()

class LessonResponse(BaseModel):
    lesson_id: str
    title: str
    category: str
    difficulty: str
    order: int
    instructions: str
    passing_accuracy: int
    gained_XP: int
    is_active: bool
    image_url: str # had to add this for frontend

@lesson_router.get("/api/lessons")
async def get_all_lessons():
    try: 
        lessons_ref = client.collection('lessons').stream()
        lessons = []
        for doc in lessons_ref:
            lesson_data = doc.to_dict()
            if lesson_data.get('is_active', False):
                lessons.append(lesson_data)
        
        # lessons.sort(key = lambda x: x.get('order',0))

        return{"lessons": lessons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lessons")
    

@lesson_router.get("/api/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(lesson_id: str):
    try:
        # Option A: lesson_id is a *field* in the document
        query = (
            client.collection("lessons")
            .where("lesson_id", "==", lesson_id)
            .limit(1)
            .stream()
        )

        for doc in query:
            lesson_data = doc.to_dict()
            if not lesson_data.get("is_active", False):
                raise HTTPException(status_code=404, detail="Lesson is inactive")
            return lesson_data  # matches LessonResponse

        # If we didn't return inside the loop → not found
        raise HTTPException(status_code=404, detail="Lesson not found")

    except HTTPException:
        # re-raise clean HTTP errors
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch lesson")
