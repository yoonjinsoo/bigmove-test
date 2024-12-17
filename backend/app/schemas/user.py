from enum import Enum
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List, Dict

class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"
    DRIVER = "driver"
    STAFF = "staff"

class UserAgreements(BaseModel):
    terms: bool
    privacy: bool
    privacy_third_party: bool
    marketing: bool = False

class UserBase(BaseModel):
    email: str
    name: str
    phone: str
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: Optional[str] = None
    provider: str = 'email'
    social_id: Optional[str] = None
    agreements: UserAgreements

    @validator('password')
    def validate_password(cls, v, values):
        if values.get('provider') == 'email' and not v:
            raise ValueError('Password is required for email registration')
        return v

    @validator('email')
    def validate_email(cls, v):
        if not v or not '@' in v:
            raise ValueError('Invalid email format')
        return v.lower()

class UserSocialCreate(UserBase):
    provider: str
    social_id: str
    agreements: UserAgreements

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    provider: str
    is_active: bool
    created_at: datetime
    agreements: Optional[UserAgreements] = None

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SignupRequest(BaseModel):
    email: str
    name: str
    password: Optional[str] = None
    provider: Optional[str] = None
    provider_id: Optional[str] = None
    agreements: Dict[str, bool]
    is_social: bool = False

    class Config:
        from_attributes = True
