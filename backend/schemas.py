from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    # Using str instead of EmailStr so any email format like dev@hello.com is accepted
    # without needing the email-validator package.
    email: str
    password: str

class GuestCreate(BaseModel):
    pass

class UserResponse(BaseModel):
    id: int
    email: Optional[str] = None
    is_guest: bool
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryCreate(BaseModel):
    prompt: str
    response: str

class HistoryResponse(BaseModel):
    id: int
    user_id: int
    prompt: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    content_type: str
    topic: str
    tone: str
    target_audience: str
    content_length: str
    output_format: str
    keywords: Optional[str] = ""

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
