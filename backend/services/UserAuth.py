import hashlib
import secrets
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from firebase_admin import auth, firestore, storage
import sys
import os
from uuid import uuid4

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from FireStoreDB import FireStoreDB
from SessionManager import SessionManager
from pathlib import Path
import shutil


# ================== FIRESTORE INIT ==================

db = FireStoreDB()
firestore_client = db.connect()

if not firestore_client:
    raise Exception("Failed to connect to Firestore")

# Create router (instead of app)
auth_router = APIRouter()

# ================== MODELS ==================

class UserRegistration(BaseModel):
    email: str
    password: str
    userName: str


class UserLogin(BaseModel):
    email: str
    password: str


class OAuthLogin(BaseModel):
    idToken: str

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    username: Optional[str] = None
    level: Optional[str] = None
    dob: Optional[str] = None  # ISO string like "2000-01-01"
    bio: Optional[str] = None  
    avatarSrc: Optional[str] = None
    title: Optional[str] = None
    titleColor: Optional[str] = None
   

class FriendUpdate(BaseModel):
    friendUid: str
    action: str  # "add" or "remove"
    
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


class PasswordUtils:
    """Utility class for password hashing and verification"""

    @staticmethod
    def hash_password_with_salt(password: str) -> tuple[str, str]:
        salt = secrets.token_hex(32)
        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
        ).hex()
        return salt, password_hash

    @staticmethod
    def verify_password(password: str, salt: str, stored_hash: str) -> bool:
        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
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
            "userName": self.userName,
            "email": self.email,
            "createdAt": self.created_at.isoformat()
            if isinstance(self.created_at, datetime)
            else str(self.created_at),
        }


# ================== HELPERS ==================

def is_owned(auth_user_uid: Optional[str], profile_uid: str) -> bool:
    """
    Return True if the authenticated user owns the profile being accessed.
    """
    if auth_user_uid is None:
        return False
    return auth_user_uid == profile_uid


def get_auth_uid_from_session() -> Optional[str]:
    """
    Returns current authenticated UID from SessionManager.
    """
    session = SessionManager()
    uid = session.get_current_uid()
    if not uid:
        return None
    return uid


def map_user_doc(uid: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map Firestore user document -> frontend User shape.
    """
    created_at = user_data.get("createdAt")
    if isinstance(created_at, datetime):
        join_date = created_at.isoformat()
    else:
        join_date = str(created_at) if created_at else None

    return {
        "id": uid,
        "userName": user_data.get("userName", ""),
        "email": user_data.get("email", ""),
        "avatarSrc": user_data.get("avatarSrc") or user_data.get("photoURL"),

        # Stats
        "xp": user_data.get("xp", 0),
        "dailyStreak": user_data.get("dailyStreak", 0),
        "friendCount": len(user_data.get("friends", [])),

        # Dates
        "joinDate": join_date,
        "dob": user_data.get("dob"),
        
        # Bio
        "bio": user_data.get("bio"),

        # Weekly stats
        "weeklyThis": user_data.get("weeklyThis", [0, 0, 0, 0, 0, 0, 0]),
        "weeklyLast": user_data.get("weeklyLast", [0, 0, 0, 0, 0, 0, 0]),

        "level": user_data.get("level", "beginner"),
        "nickname": user_data.get("nickname", user_data.get("userName", "")),
        "username": user_data.get("username", user_data.get("userName", "")),
        "title": user_data.get("title"),
        "titleColor": user_data.get("titleColor"),
        "badges": user_data.get("badges", []),
    }


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
            # Create user in Firebase Auth WITH password so they can log in
            user_record = self.auth.create_user(
                email=email, 
                password=password,
                display_name=userName
            )
            uid = user_record.uid

            salt, password_hash = PasswordUtils.hash_password_with_salt(password)

            user_data = {
                "userName": userName,
                "email": email,
                "hashedPass": password_hash,
                "salt": salt,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "authProvider": "email",
                "xp": 0,
                "lessonsAvgGrade": 0,
                "dailyStreak": 0,
                "followers": 0,
                "following": 0,
                "level": "beginner",
                "nickname": userName,
                "weeklyThis": [0, 0, 0, 0, 0, 0, 0],
                "weeklyLast": [0, 0, 0, 0, 0, 0, 0],
                "badges": [],
            }

            self.db.collection("users").document(uid).set(user_data)

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

            user_doc = self.db.collection("users").document(uid).get()

            if not user_doc.exists:
                raise Exception("User data not found in database")

            user_data = user_doc.to_dict()

            if user_data.get("authProvider") in ["google", "github"]:
                raise Exception(
                    f"This account uses {user_data.get('authProvider')} sign-in. Please use that method."
                )

            stored_hash = user_data.get("hashedPass")
            salt = user_data.get("salt")

            if not stored_hash or not salt:
                raise Exception("Invalid user data - missing password information")

            if not PasswordUtils.verify_password(password, salt, stored_hash):
                raise Exception("Invalid password")

            self.db.collection("users").document(uid).update(
                {"lastLogin": firestore.SERVER_TIMESTAMP}
            )

            self.current_user_uid = uid

            user = User(
                userName=user_data.get("userName", ""),
                email=user_data.get("email", ""),
                created_at=user_data.get("createdAt", datetime.now()),
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
            uid = decoded_token["uid"]

            user_record = self.auth.get_user(uid)

            user_doc = self.db.collection("users").document(uid).get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                self.db.collection("users").document(uid).update(
                    {"lastLogin": firestore.SERVER_TIMESTAMP}
                )
            else:
                provider_data = (
                    user_record.provider_data[0]
                    if user_record.provider_data
                    else None
                )
                provider_id = (
                    provider_data.provider_id if provider_data else "unknown"
                )

                auth_provider = (
                    provider_id.split(".")[0] if "." in provider_id else provider_id
                )

                user_data = {
                    "userName": user_record.display_name
                    or user_record.email.split("@")[0],
                    "email": user_record.email,
                    "authProvider": auth_provider,
                    "photoURL": user_record.photo_url,
                    "createdAt": firestore.SERVER_TIMESTAMP,
                    "lastLogin": firestore.SERVER_TIMESTAMP,
                }

                self.db.collection("users").document(uid).set(user_data)
                print(f"New OAuth user created: {user_record.email}")

            self.current_user_uid = uid

            user = User(
                userName=user_data.get("userName", ""),
                email=user_data.get("email", ""),
                created_at=user_data.get("createdAt", datetime.now()),
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


# ================== INSTANCE ==================

user_auth = UserAuth(firestore_client)

# ================== ROUTES ==================


@auth_router.post("/api/register")
async def register_endpoint(user_data: UserRegistration):
    """API endpoint for user registration"""
    try:
        uid = user_auth.register_user(
            email=user_data.email,
            password=user_data.password,
            userName=user_data.userName,
        )
        return {"message": "User registered successfully", "uid": uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@auth_router.post("/api/login")
async def login_endpoint(user_data: UserLogin):
    """API endpoint for user login"""
    try:
        user = user_auth.login_user(user_data.email, user_data.password)
        uid = user_auth.get_current_user_uid()

        session = SessionManager()
        session.set_user_session(uid=uid, email=user.email, user_name=user.userName)

        return {"message": "Login successful", "uid": uid, "user": user.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@auth_router.post("/api/oauth/login")
async def oauth_login_endpoint(oauth_data: OAuthLogin):
    """API endpoint for OAuth login (Google, GitHub)"""
    try:
        user = user_auth.login_oauth_user(oauth_data.idToken)
        uid = user_auth.get_current_user_uid()

        session = SessionManager()
        session.set_user_session(uid=uid, email=user.email, user_name=user.userName)

        return {"message": "OAuth login successful", "uid": uid, "user": user.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@auth_router.post("/api/logout")
async def logout_endpoint():
    """API endpoint for user logout"""
    try:
        session = SessionManager()
        session.clear_session()
        user_auth.logout()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@auth_router.get("/api/users/me")
async def get_me():
    """
    Return the currently authenticated user's profile from Firestore.
    """
    uid = get_auth_uid_from_session()
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    doc_ref = firestore_client.collection("users").document(uid)
    user_doc = doc_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict() or {}
    return map_user_doc(uid, user_data)


@auth_router.patch("/api/users/me")
async def update_me(update: UserUpdate):
    """
    Update the currently authenticated user's profile.
    Only updates fields that are provided (partial patch).
    """
    uid = get_auth_uid_from_session()
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    doc_ref = firestore_client.collection("users").document(uid)
    user_doc = doc_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = update.model_dump(exclude_unset=True)
    if not update_data:
        return {"message": "No changes provided"}

    print("🔧 update_me for UID:", uid, "data:", update_data)  # DEBUG

    doc_ref.update(update_data)

    user_data = user_doc.to_dict() or {}
    user_data.update(update_data)

    return map_user_doc(uid, user_data)


@auth_router.get("/api/users/{uid}")
async def get_user_by_id(uid: str):
    """
    Return ANY user's profile (visitor mode) from Firestore.
    """
    doc_ref = firestore_client.collection("users").document(uid)
    user_doc = doc_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict() or {}
    return map_user_doc(uid, user_data)

@auth_router.get("/api/users")
async def list_users():
    """
    Return all users (used for 'Find Friends').
    Requires authentication.
    """
    uid = get_auth_uid_from_session()
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    users_ref = firestore_client.collection("users")
    docs = users_ref.stream()

    users = []
    for doc in docs:
        data = doc.to_dict() or {}
        users.append(map_user_doc(doc.id, data))

    return users

@auth_router.get("/api/users/me/friends")
async def get_my_friends():
    """
    Return the current user's friends as full user objects.
    """
    uid = get_auth_uid_from_session()
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    me_ref = firestore_client.collection("users").document(uid)
    me_doc = me_ref.get()
    if not me_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    me_data = me_doc.to_dict() or {}
    friend_ids = me_data.get("friends", []) or []

    if not friend_ids:
        return []

    users_ref = firestore_client.collection("users")
    friends = []
    for fid in friend_ids:
        if not fid:
            continue
        fd = users_ref.document(fid).get()
        if fd.exists:
            friends.append(map_user_doc(fd.id, fd.to_dict() or {}))

    return friends


@auth_router.post("/api/users/me/friends")
async def update_my_friends(body: FriendUpdate):
    """
    Add or remove a friend for the current user.
    Returns the updated friend list as user objects.
    """
    uid = get_auth_uid_from_session()
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    me_ref = firestore_client.collection("users").document(uid)
    me_doc = me_ref.get()
    if not me_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    me_data = me_doc.to_dict() or {}
    friends = list(me_data.get("friends", []) or [])

    if body.action == "add":
        if body.friendUid not in friends and body.friendUid != uid:
            friends.append(body.friendUid)
    elif body.action == "remove":
        friends = [f for f in friends if f != body.friendUid]
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    me_ref.update({"friends": friends})

    # Return updated friends as user objects
    users_ref = firestore_client.collection("users")
    friend_users = []
    for fid in friends:
        fd = users_ref.document(fid).get()
        if fd.exists:
            friend_users.append(map_user_doc(fd.id, fd.to_dict() or {}))

    return {"friends": friend_users}

@auth_router.post("/api/users/me/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    """
    Upload a new avatar for the currently authenticated user.
    Saves file to disk and stores its URL in Firestore as `avatarSrc`.
    """
    uid = get_auth_uid_from_session()
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")

    upload_dir = Path("uploads") / "avatars"
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "").suffix or ".png"
    filename = f"{uid}{ext}"
    filepath = upload_dir / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"http://localhost:8000/static/avatars/{filename}"

    firestore_client.collection("users").document(uid).update(
        {"avatarSrc": avatar_url}
    )

    return {"avatarSrc": avatar_url}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
