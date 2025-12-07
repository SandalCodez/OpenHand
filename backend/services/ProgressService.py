from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import firestore
from typing import Optional  
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from FireStoreDB import FireStoreDB
from SessionManager import SessionManager  

db = FireStoreDB()
firestore_client = db.connect()

progress_router = APIRouter()

class LessonAttempt(BaseModel):
    lesson_id: str
    score: float
    accuracy: float
    duration: Optional[int] = None
    
def calculate_understanding_level(score: float) -> str:
    """Calculate understanding level based on score"""
    if score >= 90:
        return "excellent"
    elif score >= 80:
        return "good"
    elif score >= 70:
        return "fair"
    elif score >= 60:
        return "needs_improvement"
    else:
        return "poor"

@progress_router.post("/api/progress")
async def save_lesson_progress(attempt: LessonAttempt):
    """Save user's lesson attempt and update progress"""
    try:
        session = SessionManager()
        session.require_authentication()
        user_id = session.get_current_uid()
        
        # Get lesson to check passing_accuracy requirement
        lesson_doc = firestore_client.collection('lessons').document(attempt.lesson_id).get()
        if not lesson_doc.exists:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        lesson_data = lesson_doc.to_dict()
        passing_accuracy = lesson_data.get('passing_accuracy', 75)
        gained_xp_amount = lesson_data.get('gained_XP', 10)
        
        # Determine pass/fail
        passed = attempt.score >= passing_accuracy
        understanding = calculate_understanding_level(attempt.score)
        
        # Check if progress record exists
        progress_ref = firestore_client.collection('userProgress')\
            .where('userId', '==', user_id)\
            .where('lessonId', '==', attempt.lesson_id)\
            .limit(1).stream()
        
        existing_progress = list(progress_ref)
        
        if existing_progress:
            # Update existing progress
            doc = existing_progress[0]
            doc_ref = firestore_client.collection('userProgress').document(doc.id)
            current_data = doc.to_dict()
            
            attempts = current_data.get('attempts', 0) + 1
            best_score = max(current_data.get('bestScore', 0), attempt.score)
            best_accuracy = max(current_data.get('bestAccuracy', 0), attempt.accuracy)
            
            # Only mark as completed if they've passed at least once
            ever_passed = current_data.get('isCompleted', False) or passed
            
            doc_ref.update({
                'attempts': attempts,
                'bestScore': best_score,
                'bestAccuracy': best_accuracy,
                'lastScore': attempt.score,
                'lastAccuracy': attempt.accuracy,
                'lastAttemptDate': firestore.SERVER_TIMESTAMP,
                'isCompleted': ever_passed,
                'passed': passed,
                'understandingLevel': understanding,
                'status': 'completed' if ever_passed else 'in_progress',
                'xpEarned': gained_xp_amount if ever_passed else 0
            })
        else:
            # Create new progress record
            firestore_client.collection('userProgress').add({
                'userId': user_id,
                'lessonId': attempt.lesson_id,
                'attempts': 1,
                'bestScore': attempt.score,
                'bestAccuracy': attempt.accuracy,
                'lastScore': attempt.score,
                'lastAccuracy': attempt.accuracy,
                'isCompleted': passed,
                'passed': passed,
                'understandingLevel': understanding,
                'status': 'completed' if passed else 'in_progress',
                'firstAttemptDate': firestore.SERVER_TIMESTAMP,
                'lastAttemptDate': firestore.SERVER_TIMESTAMP,
                'xpEarned': gained_xp_amount if passed else 0
            })
        
        return {
            "message": "Progress saved successfully",
            "score": attempt.score,
            "passed": passed,
            "understandingLevel": understanding,
            "requiredScore": passing_accuracy
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save progress: {str(e)}")
    
@progress_router.get("/api/user/progress")
async def get_user_progress():
    """Get all progress records for the current user"""
    try:
        session = SessionManager()
        session.require_authentication()
        user_id = session.get_current_uid()
        
        # Fetch all progress records for this user
        progress_ref = firestore_client.collection('userProgress')\
            .where('userId', '==', user_id)\
            .stream()
        
        progress_records = []
        for doc in progress_ref:
            data = doc.to_dict()
            data['id'] = doc.id  # Include document ID
            progress_records.append(data)
        
        # Sort by last attempt date (most recent first)
        progress_records.sort(
            key=lambda x: x.get('lastAttemptDate', 0), 
            reverse=True
        )
        
        return progress_records
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")


@progress_router.get("/api/user/stats")
async def get_user_stats():
    """Get summary statistics for the current user"""
    try:
        session = SessionManager()
        session.require_authentication()
        user_id = session.get_current_uid()
        
        # Fetch all progress records for this user
        progress_ref = firestore_client.collection('userProgress')\
            .where('userId', '==', user_id)\
            .stream()
        
        progress_records = list(progress_ref)
        
        if not progress_records:
            return {
                "totalLessons": 0,
                "completedLessons": 0,
                "averageScore": 0,
                "totalAttempts": 0,
                "totalXP": 0
            }
        
        total_lessons = len(progress_records)
        completed = sum(1 for doc in progress_records if doc.to_dict().get('isCompleted', False))
        
        scores = [doc.to_dict().get('bestScore', 0) for doc in progress_records]
        average_score = sum(scores) / len(scores) if scores else 0
        
        total_attempts = sum(doc.to_dict().get('attempts', 0) for doc in progress_records)
        
        # Calculate XP from DB records
        # If 'xpEarned' is missing (old records), fallback to 10 if completed, else 0
        total_xp = sum(
            doc.to_dict().get('xpEarned', 10 if doc.to_dict().get('isCompleted', False) else 0) 
            for doc in progress_records
        )
        
        return {
            "totalLessons": total_lessons,
            "completedLessons": completed,
            "averageScore": round(average_score, 2),
            "totalAttempts": total_attempts,
            "totalXP": total_xp
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")
