from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import firestore
from typing import Optional  
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from FireStoreDB import FireStoreDB
from SessionManager import SessionManager  

from datetime import datetime, timedelta, timezone

db = FireStoreDB()
firestore_client = db.connect()

progress_router = APIRouter()

# ================== HELPERS ==================

def _get_iso_week_year(date_obj):
    """Return (ISO year, ISO week number)"""
    return date_obj.isocalendar()[:2]

def _update_user_activity_stats(user_id: str):
    """
    Update daily streak and weekly lesson counts.
    Call this AFTER a successful lesson save.
    """
    try:
        user_ref = firestore_client.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return

        data = user_doc.to_dict()
        # Use local time, not UTC, to match user's wall clock
        now = datetime.now()
        today = now.date()
        
        # --- STREAK LOGIC ---
        current_streak = data.get('dailyStreak', 0)
        last_update_ts = data.get('lastStreakUpdate')
        
        # Determine if we need to update streak
        if isinstance(last_update_ts, datetime):
            # Check local date of last update
            last_date = last_update_ts.date()
        else:
            last_date = None

        new_streak = current_streak
        
        if last_date == today:
            # Already played today, keep streak
            pass
        elif last_date == today - timedelta(days=1):
            # Played yesterday, increment streak
            new_streak += 1
        else:
            # Missed a day (or first time), reset to 1
            new_streak = 1
            
        # --- WEEKLY STATS LOGIC ---
        weekly_this = data.get('weeklyThis', [0] * 7)
        weekly_last = data.get('weeklyLast', [0] * 7)
        last_week_info = data.get('lastWeekInfo') # Store (year, week) to track resets
        
        current_year_week = _get_iso_week_year(today) # (2023, 45)
        
        # Check if we moved to a new week
        if last_week_info and tuple(last_week_info) != current_year_week:
            # Shift data
            weekly_last = weekly_this
            weekly_this = [0] * 7
            
        # Increment today's count 
        # Python weekday(): 0=Mon, ... 6=Sun
        # Frontend Chart:   0=Sun, 1=Mon ... 6=Sat
        # Mapping: (py_day + 1) % 7
        py_day = today.weekday()
        chart_day_idx = (py_day + 1) % 7
        
        weekly_this[chart_day_idx] += 1
            
        # --- SAVE UPDATES ---
        update_payload = {
            'dailyStreak': new_streak,
            'lastStreakUpdate': now,
            'weeklyThis': weekly_this,
            'weeklyLast': weekly_last,
            'lastWeekInfo': current_year_week
        }
        
        user_ref.update(update_payload)
        print(f"Stats updated for {user_id}: Streak={new_streak}, ChartIdx={chart_day_idx} (Day {py_day})")
        
    except Exception as e:
        print(f"Error updating user activity stats: {e}") 

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
        
        response_data = {
            "message": "Progress saved successfully",
            "score": attempt.score,
            "passed": passed,
            "understandingLevel": understanding,
            "requiredScore": passing_accuracy,
            "totalXP": _calculate_and_update_total_xp(user_id)
        }
        
        # Fire-and-forget stats update (could be async background task, but calling directly for now)
        _update_user_activity_stats(user_id)
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save progress: {str(e)}")

def _calculate_and_update_total_xp(user_id: str) -> int:
    """
    Calculate total XP from all completed lessons and update the user's profile.
    Returns the new total XP.
    """
    try:
        # Sum up xpEarned from all progress records
        progress_ref = firestore_client.collection('userProgress')\
            .where('userId', '==', user_id)\
            .stream()
            
        total_xp = 0
        for doc in progress_ref:
            data = doc.to_dict()
            # Use get() with default 0 in case field is missing
            total_xp += data.get('xpEarned', 0)
            
        # Update user document
        firestore_client.collection('users').document(user_id).update({
            'xp': total_xp
        })
        
        return total_xp
    except Exception as e:
        print(f"Error syncing XP for user {user_id}: {e}")
        # Return 0 or current count if failed, but don't crash the request
        return 0
    
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
