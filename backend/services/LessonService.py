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
    Title: str
    category: str
    difficulty: str
    order: int
    instructions: str
    passing_accuracy: int
    gained_XP: int
    is_active: bool

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