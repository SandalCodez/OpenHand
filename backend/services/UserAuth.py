import hashlib
import secrets
from datetime import datetime
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import auth, firestore
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from FireStoreDB import FireStoreDB
from SessionManager import SessionManager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API requests
class UserRegistration(BaseModel):
    email: str
    password: str
    userName: str

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordUtils:
    """Utility class for password hashing and verification"""
    
    @staticmethod
    def hash_password_with_salt(password: str) -> tuple[str, str]:
        """
        Hash a password with a random salt
        Returns: (salt, hashed_password)
        """
        # Generate a random salt
        salt = secrets.token_hex(32)
        
        # Hash the password with the salt
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # iterations
        ).hex()
        
        return salt, password_hash
    
    @staticmethod
    def verify_password(password: str, salt: str, stored_hash: str) -> bool:
        """Verify a password against a stored hash and salt"""
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


class UserAuth:
    """Firebase Authentication and User Management"""
    
    def __init__(self, firestore_client):
        """
        Initialize UserAuth with Firestore client
        
        Args:
            firestore_client: Firestore client instance from FireStoreDB
        """
        self.db = firestore_client
        self.auth = auth
        self.current_user_uid: Optional[str] = None
        self.current_user: Optional[User] = None

    def register_user(self, email: str, password: str, userName: str) -> str:
        """
        Register a new user with Firebase Auth and Firestore
        """
        try:
            # Create user in Firebase Auth
            user_record = self.auth.create_user(
                email=email,
                display_name=userName
            )
            uid = user_record.uid
            
            # Hash the password with salt
            salt, password_hash = PasswordUtils.hash_password_with_salt(password)
            
            # Prepare user data for Firestore
            user_data = {
                'userName': userName,
                'email': email,
                'hashedPass': password_hash,
                'salt': salt,
                'createdAt': firestore.SERVER_TIMESTAMP,
            }
            
            # Store user data in Firestore
            self.db.collection('users').document(uid).set(user_data)
            
            print(f"User registered successfully with UID: {uid}")
            return uid
            
        except Exception as e:
            print(f"Registration failed: {e}")
            raise Exception(f"Failed to register user: {str(e)}")
    
    def login_user(self, email: str, password: str) -> User:
        """
        Authenticate a user and retrieve their information
        """
        try:
            # Get user by email from Firebase Auth
            user_record = self.auth.get_user_by_email(email)
            uid = user_record.uid
            
            # Get user data from Firestore
            user_doc = self.db.collection('users').document(uid).get()
            
            if not user_doc.exists:
                raise Exception("User data not found in database")
            
            user_data = user_doc.to_dict()
            
            # Verify password
            stored_hash = user_data.get('hashedPass')
            salt = user_data.get('salt')
            
            if not stored_hash or not salt:
                raise Exception("Invalid user data - missing password information")
            
            if not PasswordUtils.verify_password(password, salt, stored_hash):
                raise Exception("Invalid password")
            
            # Update last login timestamp
            self.db.collection('users').document(uid).update({
                'lastLogin': firestore.SERVER_TIMESTAMP
            })
            
            # Store current user UID for session management
            self.current_user_uid = uid
            
            # Create User object
            user = User(
                userName=user_data.get('userName', ''),
                email=user_data.get('email', ''),
                created_at=user_data.get('createdAt', datetime.now()),
            )
            
            # Store current user object
            self.current_user = user
            
            print(f"User {email} logged in successfully")
            return user
            
        except auth.UserNotFoundError:
            raise Exception(f"No user found with email: {email}")
        except Exception as e:
            print(f"Login failed: {e}")
            raise Exception(f"Login failed: {str(e)}")
    
    def get_current_user_uid(self) -> Optional[str]:
        """Get the UID of the currently logged-in user"""
        return self.current_user_uid
    
    def get_logged_in_user(self) -> Optional[User]:
        """Get the currently logged-in User object"""
        return self.current_user
    
    def logout(self):
        """Clear the current session"""
        self.current_user_uid = None
        self.current_user = None
        print("User logged out successfully")


# Initialize Firebase and UserAuth
db = FireStoreDB()
firestore_client = db.connect()

if not firestore_client:
    raise Exception("Failed to connect to Firestore")

user_auth = UserAuth(firestore_client)

# API Endpoints
@app.post("/api/register")
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

@app.post("/api/login")
async def login_endpoint(user_data: UserLogin):
    """API endpoint for user login"""
    try:
        user = user_auth.login_user(user_data.email, user_data.password)

        uid=user_auth.get_current_user_uid()

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

@app.get("/")
async def root():
    return {"message": "openHand API is running!"}

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)