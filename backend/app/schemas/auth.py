from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Dict, Any
import re
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(BaseModel):
    email: str
    name: str
    password: Optional[str] = None
    provider: Optional[str] = None
    provider_id: Optional[str] = None
    temp_token: Optional[str] = None
    agreements: dict

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CouponResponse(BaseModel):
    code: str
    amount: int
    expiry_date: datetime

class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True

class SignupResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    user: UserResponse
    coupon: CouponResponse

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    user: UserResponse

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class SocialSignupComplete(BaseModel):
    name: str
    email: str
    provider: str
    agreements: Dict[str, bool]

class LoginSchema(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    name: str
    provider: str
    provider_id: str
    temp_token: str
    agreements: dict
    is_social: bool = True

    class Config:
        from_attributes = True