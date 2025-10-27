import hashlib
import secrets
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import auth, firestore
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from FireStoreDB import FireStoreDB
from SessionManager import SessionManager

# Initialize Firestore
db = FireStoreDB()
firestore_client = db.connect()

if not firestore_client:
    raise Exception("Failed to connect to Firestore")

# Create router (instead of app)
auth_router = APIRouter()

# Pydantic models
class UserRegistration(BaseModel):
    email: str
    password: str
    userName: str

class UserLogin(BaseModel):
    email: str
    password: str

class OAuthLogin(BaseModel):
    idToken: str

class PasswordUtils:
    """Utility class for password hashing and verification"""
    
    @staticmethod
    def hash_password_with_salt(password: str) -> tuple[str, str]:
        salt = secrets.token_hex(32)
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return salt, password_hash
    
    @staticmethod
    def verify_password(password: str, salt: str, stored_hash: str) -> bool:
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return password_hash == stored_hash

class User:
    """User model class"""
    def __init__(self, userName: str, email: str, created_at: datetime):
        self.userName = userName
        self.email = email
        self.created_at = created_at
    
    def __str__(self):
        return f"User({self.userName} {self.email})"
    
    def to_dict(self):
        return {
           'userName': self.userName,
            'email': self.email,
            'createdAt': self.created_at.isoformat() if isinstance(self.created_at, datetime) else str(self.created_at)
        }
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

class UserAuth:
    """Firebase Authentication and User Management"""
    
    def __init__(self, firestore_client):
        self.db = firestore_client
        self.auth = auth
        self.current_user_uid: Optional[str] = None
        self.current_user: Optional[User] = None

    def register_user(self, email: str, password: str, userName: str) -> str:
        """Register a new user with Firebase Auth and Firestore"""
        try:
            user_record = self.auth.create_user(
                email=email,
                display_name=userName
            )
            uid = user_record.uid
            
            salt, password_hash = PasswordUtils.hash_password_with_salt(password)
            
            user_data = {
                'userName': userName,
                'email': email,
                'hashedPass': password_hash,
                'salt': salt,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'authProvider': 'email'
            }
            
            self.db.collection('users').document(uid).set(user_data)
            
            print(f"User registered successfully with UID: {uid}")
            return uid
            
        except Exception as e:
            print(f"Registration failed: {e}")
            raise Exception(f"Failed to register user: {str(e)}")
    
    def login_user(self, email: str, password: str) -> User:
        """Authenticate a user and retrieve their information"""
        try:
            user_record = self.auth.get_user_by_email(email)
            uid = user_record.uid
            
            user_doc = self.db.collection('users').document(uid).get()
            
            if not user_doc.exists:
                raise Exception("User data not found in database")
            
            user_data = user_doc.to_dict()
            
            if user_data.get('authProvider') in ['google', 'github']:
                raise Exception(f"This account uses {user_data.get('authProvider')} sign-in. Please use that method.")
            
            stored_hash = user_data.get('hashedPass')
            salt = user_data.get('salt')
            
            if not stored_hash or not salt:
                raise Exception("Invalid user data - missing password information")
            
            if not PasswordUtils.verify_password(password, salt, stored_hash):
                raise Exception("Invalid password")
            
            self.db.collection('users').document(uid).update({
                'lastLogin': firestore.SERVER_TIMESTAMP
            })
            
            self.current_user_uid = uid
            
            user = User(
                userName=user_data.get('userName', ''),
                email=user_data.get('email', ''),
                created_at=user_data.get('createdAt', datetime.now()),
            )
            
            self.current_user = user
            
            print(f"User {email} logged in successfully")
            return user
            
        except auth.UserNotFoundError:
            raise Exception(f"No user found with email: {email}")
        except Exception as e:
            print(f"Login failed: {e}")
            raise Exception(f"Login failed: {str(e)}")
    
    def login_oauth_user(self, id_token: str) -> User:
        """Authenticate user via OAuth (Google, GitHub) using Firebase ID token"""
        try:
            decoded_token = self.auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
            user_record = self.auth.get_user(uid)
            
            user_doc = self.db.collection('users').document(uid).get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                self.db.collection('users').document(uid).update({
                    'lastLogin': firestore.SERVER_TIMESTAMP
                })
            else:
                provider_data = user_record.provider_data[0] if user_record.provider_data else None
                provider_id = provider_data.provider_id if provider_data else 'unknown'
                
                auth_provider = provider_id.split('.')[0] if '.' in provider_id else provider_id
                
                user_data = {
                    'userName': user_record.display_name or user_record.email.split('@')[0],
                    'email': user_record.email,
                    'authProvider': auth_provider,
                    'photoURL': user_record.photo_url,
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'lastLogin': firestore.SERVER_TIMESTAMP
                }
                
                self.db.collection('users').document(uid).set(user_data)
                print(f"New OAuth user created: {user_record.email}")
            
            self.current_user_uid = uid
            
            user = User(
                userName=user_data.get('userName', ''),
                email=user_data.get('email', ''),
                created_at=user_data.get('createdAt', datetime.now()),
            )
            
            self.current_user = user
            
            print(f"OAuth user {user.email} logged in successfully")
            return user
            
        except Exception as e:
            print(f"OAuth login failed: {e}")
            raise Exception(f"OAuth login failed: {str(e)}")
    
    def get_current_user_uid(self) -> Optional[str]:
        return self.current_user_uid
    
    def get_logged_in_user(self) -> Optional[User]:
        return self.current_user
    
    def logout(self):
        self.current_user_uid = None
        self.current_user = None
        print("User logged out successfully")

# Initialize UserAuth
user_auth = UserAuth(firestore_client)

# API Endpoints - Change @app to @router
@auth_router.post("/api/register")
async def register_endpoint(user_data: UserRegistration):
    """API endpoint for user registration"""
    try:
        uid = user_auth.register_user(
            email=user_data.email,
            password=user_data.password,
            userName=user_data.userName
        )
        return {
            "message": "User registered successfully",
            "uid": uid
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@auth_router.post("/api/login")
async def login_endpoint(user_data: UserLogin):
    """API endpoint for user login"""
    try:
        user = user_auth.login_user(user_data.email, user_data.password)
        uid = user_auth.get_current_user_uid()

        session = SessionManager()
        session.set_user_session(
            uid=uid,
            email=user.email,
            user_name=user.userName
        )
        return {
            "message": "Login successful",
            "uid": uid,
            "user": user.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@auth_router.post("/api/oauth/login")
async def oauth_login_endpoint(oauth_data: OAuthLogin):
    """API endpoint for OAuth login (Google, GitHub)"""
    try:
        user = user_auth.login_oauth_user(oauth_data.idToken)
        uid = user_auth.get_current_user_uid()

        session = SessionManager()
        session.set_user_session(
            uid=uid,
            email=user.email,
            user_name=user.userName
        )
        return {
            "message": "OAuth login successful",
            "uid": uid,
            "user": user.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@auth_router.post("/api/logout")
async def logout_endpoint():
    """API endpoint for user logout"""
    try:
        session = SessionManager()
        session.clear_session()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)