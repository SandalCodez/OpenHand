from typing import Optional
from datetime import datetime

class SessionManager:
    """Singleton class to manage user session data"""
    
    _instance: Optional['SessionManager'] = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.current_user_uid: Optional[str] = None
            self.current_user_email: Optional[str] = None
            self.current_user_name: Optional[str] = None
            self.login_timestamp: Optional[datetime] = None
            self.is_authenticated = False
            SessionManager._initialized = True
    
    def set_user_session(self, uid: str, email: str, user_name: str):
        """Set the current user session data"""
        self.current_user_uid = uid
        self.current_user_email = email
        self.current_user_name = user_name
        self.login_timestamp = datetime.now()
        self.is_authenticated = True
        print(f"Session set for user: {user_name} (UID: {uid})")
    
    def get_current_uid(self) -> Optional[str]:
        """Get the current user's UID"""
        return self.current_user_uid
    
    def get_current_user_info(self) -> dict:
        """Get all current user information"""
        return {
            'uid': self.current_user_uid,
            'email': self.current_user_email,
            'userName': self.current_user_name,
            'loginTime': self.login_timestamp,
            'isAuthenticated': self.is_authenticated
        }
    
    def is_user_logged_in(self) -> bool:
        """Check if a user is currently logged in"""
        return self.is_authenticated and self.current_user_uid is not None
    
    def clear_session(self):
        """Clear the current session (logout)"""
        print(f"Clearing session for user: {self.current_user_name}")
        self.current_user_uid = None
        self.current_user_email = None
        self.current_user_name = None
        self.login_timestamp = None
        self.is_authenticated = False
    
    def require_authentication(self):
        """Raise exception if user is not authenticated"""
        if not self.is_user_logged_in():
            raise Exception("User must be logged in to perform this action")