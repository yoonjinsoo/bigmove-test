from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.database import get_db
from sqlalchemy import select

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_user(self, email: str, name: str, provider: str) -> User:
        """신규 사용자 생성"""
        user = User(
            email=email,
            name=name,
            provider=provider,
            terms_agreed=False
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user 