from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Dict, Optional, Literal
from uuid import uuid4
from datetime import datetime, timedelta

from jose import jwt, JWTError
from passlib.context import CryptContext

router = APIRouter()
security = HTTPBearer()

# ---- Config ----
JWT_SECRET = "dev-secret-change-me"  # move to env var later
JWT_ALG = "HS256"
JWT_EXPIRES_MIN = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Role = Literal["teacher", "student", "admin"]

# ---- Admin Credentials ----
ADMIN_EMAIL = "admin@aac.com"
ADMIN_PASSWORD = "admin123"  # Change this to a secure password

# ---- In-memory users ----
class User(BaseModel):
    id: str
    email: str
    name: str
    role: Role
    password_hash: str
    created_at: str

# Initialize empty users dict (admin will be created on first access)
USERS_BY_EMAIL: Dict[str, User] = {}

# Helper to initialize admin on first use
def _ensure_admin_exists():
    """Create admin user if it doesn't exist"""
    if ADMIN_EMAIL not in USERS_BY_EMAIL:
        try:
            USERS_BY_EMAIL[ADMIN_EMAIL] = User(
                id="admin_0000000001",
                email=ADMIN_EMAIL,
                name="Administrator",
                role="admin",
                password_hash=_hash_password(ADMIN_PASSWORD),
                created_at=datetime.utcnow().isoformat() + "Z",
            )
            print(f"Admin user created successfully: {ADMIN_EMAIL}")
        except Exception as e:
            print(f"Error creating admin user: {e}")
            import traceback
            traceback.print_exc()
            raise


# ---- Schemas ----
class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=120)
    name: str = Field(..., min_length=1, max_length=80)
    role: Role = "teacher"
    password: str = Field(..., min_length=6, max_length=128)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeResponse(BaseModel):
    id: str
    email: str
    name: str
    role: Role


# ---- Helpers ----
def _hash_password(password: str) -> str:
    return pwd_context.hash(password)

def _verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def _create_token(user: User) -> str:
    now = datetime.utcnow()
    exp = now + timedelta(minutes=JWT_EXPIRES_MIN)
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def _decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = creds.credentials
    try:
        payload = _decode_token(token)
        email = payload.get("email")
        if not email or email not in USERS_BY_EMAIL:
            raise HTTPException(status_code=401, detail="Invalid token")
        return USERS_BY_EMAIL[email]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Routes ----
@router.get("/ping")
def ping():
    return {"ok": True, "route": "auth"}

@router.post("/register", response_model=MeResponse, status_code=201)
def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    
    # Prevent registering with admin email
    if email == ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Cannot register with admin email")
    
    if email in USERS_BY_EMAIL:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.utcnow().isoformat() + "Z"
    user = User(
        id="user_" + uuid4().hex[:10],
        email=email,
        name=payload.name.strip(),
        role=payload.role,
        password_hash=_hash_password(payload.password),
        created_at=now,
    )
    USERS_BY_EMAIL[email] = user

    return MeResponse(id=user.id, email=user.email, name=user.name, role=user.role)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    try:
        # Ensure admin exists on first login attempt
        _ensure_admin_exists()
        
        email = payload.email.strip().lower()
        print(f"Login attempt for: {email}")
        print(f"Available users: {list(USERS_BY_EMAIL.keys())}")
        
        user = USERS_BY_EMAIL.get(email)
        if not user:
            print(f"User not found: {email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not _verify_password(payload.password, user.password_hash):
            print(f"Password verification failed for: {email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        print(f"Login successful for: {email}")
        token = _create_token(user)
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)):
    return MeResponse(id=user.id, email=user.email, name=user.name, role=user.role)
