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

@lesson_router.get("/api/lessons/all")
async def get_all_lessons():
    try: 
        lessons_ref = client.collection('lessons').stream()
        lessons = []
        for doc in lessons_ref:
            lesson_data = doc.to_dict()
            if lesson_data.get('is_active', False):
                lessons.append(lesson_data)
        
        # Sort by category, then by order
        category_order = {'alpha': 0, 'num': 1, 'gesture': 2}
        
        lessons.sort(key=lambda x: (
            category_order.get(x.get('lesson_id', '').split('_')[0], 999),
            x.get('order', 0)
        ))

        return {"lessons": lessons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lessons: {str(e)}")


@lesson_router.get("/api/lessons/alpha")
async def get_all_alpha_lessons():
    try: 
        query = client.collection('lessons')
        query = query.where('lesson_id', '>=', 'alpha')
        query = query.where('lesson_id', '<=', 'alpha_Z')

        lessons_ref = query.stream()
        lessons = [doc.to_dict() for doc in lessons_ref if doc.to_dict().get('is_active', False)]
        return{"lessons": lessons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lessons")


@lesson_router.get("/api/lessons/number")
async def get_all_number_lessons():
    try: 
        query = client.collection('lessons')
        query = query.where('lesson_id', '>=', 'num')

        lessons_ref = query.stream()
        lessons = [doc.to_dict() for doc in lessons_ref if doc.to_dict().get('is_active', False)]
        return{"lessons": lessons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lessons")
    

@lesson_router.get("/api/lessons/gesture")
async def get_all_gesture_lessons():
    try: 
        query = client.collection('lessons')
        query = query.where('lesson_id', '>=', 'gesture')
        query = query.where('lesson_id', '<=', 'num')

        lessons_ref = query.stream()
        lessons = [doc.to_dict() for doc in lessons_ref if doc.to_dict().get('is_active', False)]
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


import random
from datetime import datetime, timezone
from SessionManager import SessionManager

@lesson_router.get("/api/challenge/daily")
async def get_daily_challenge():
    """
    Returns the 'Challenge of the Day' (a random gesture lesson)
    and whether the current user has completed it *today*.
    """
    try:
        # 1. Get all gesture lessons
        query = client.collection('lessons')
        query = query.where('lesson_id', '>=', 'gesture')
        query = query.where('lesson_id', '<=', 'num') # Assuming 'num' comes after 'gesture' in lexicographical order or close enough logic
        # Ideally, we should just filter by category if possible, but based on get_all_gesture_lessons:
        
        # Reuse logic from get_all_gesture_lessons but we need the LIST, not the http response
        # It's better to duplicate the query logic to be safe and independent.
        
        # Better: Get ALL active gesture lessons
        lessons_ref = query.stream()
        gesture_lessons = [doc.to_dict() for doc in lessons_ref if doc.to_dict().get('is_active', False)]
        
        if not gesture_lessons:
             raise HTTPException(status_code=404, detail="No gesture lessons available for challenge")

        # 2. Select one deterministically based on date
        # Use UTC date to ensure consistency across timezones if needed, or server local time.
        # Ideally user's local time, but server time is easier for 'global' challenge.
        today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        # Seed random with today's date string hash
        seed_val = hash(today_str)
        random.seed(seed_val)
        
        daily_lesson = random.choice(gesture_lessons)
        
        # Reset random seed to avoid affecting other random operations if any
        random.seed() 
        
        # 3. Check if user completed it TODAY
        is_completed_today = False
        
        try:
            session = SessionManager()
            if session.get_current_uid(): # Only if logged in
                user_id = session.get_current_uid()
                
                # Check userProgress
                progress_query = client.collection('userProgress')\
                    .where('userId', '==', user_id)\
                    .where('lessonId', '==', daily_lesson['lesson_id'])\
                    .limit(1).stream()
                
                progress_docs = list(progress_query)
                if progress_docs:
                    prog_data = progress_docs[0].to_dict()
                    last_attempt = prog_data.get('lastAttemptDate')
                    
                    # Check if last attempt was today
                    if last_attempt:
                        # Firestore timestamp to datetime
                        # It might be a datetime object already given firebase-admin SDK
                        la_dt = last_attempt
                        if hasattr(la_dt, 'date'):
                             # Compare dates (UTC recommended if stored as UTC)
                             # Firestore timestamps are usually UTC.
                             # We'll compare the .date() part.
                             # Caution: timezone diffs. Simplified check:
                             # Convert both to same tz or just compares dates if safe.
                             # Assuming server time for consistency with challenge selection.
                             if la_dt.date() == datetime.now(timezone.utc).date() and prog_data.get('passed', False):
                                 is_completed_today = True

        except Exception as auth_warning:
            # If session check fails (not logged in), just return false for completion
            print(f"Auth check in daily challenge failed (likely not logged in): {auth_warning}")
            pass

        return {
            "lesson": daily_lesson,
            "isCompletedToday": is_completed_today,
            "date": today_str
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get daily challenge: {str(e)}")
