from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserResponse, TokenResponse
from backend.auth.security import get_password_hash, verify_password, create_access_token
import re

router = APIRouter(prefix="/api/auth", tags=["auth"])

def is_valid_email(email: str) -> bool:
    """Basic email validation - accepts any email with @ and a dot after."""
    pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
    return bool(re.match(pattern, email))

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    email = user.email.strip().lower()
    
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=email, password=hashed_password, is_guest=False)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/guest")
def create_guest(db: Session = Depends(get_db)):
    guest_user = User(is_guest=True)
    db.add(guest_user)
    db.commit()
    db.refresh(guest_user)
    
    access_token = create_access_token(data={"sub": str(guest_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_id": guest_user.id}

@router.get("/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db)):
    """Simple health check endpoint."""
    return {"message": "ok"}
