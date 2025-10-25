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
                'status': 'completed' if ever_passed else 'in_progress'
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
                'lastAttemptDate': firestore.SERVER_TIMESTAMP
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