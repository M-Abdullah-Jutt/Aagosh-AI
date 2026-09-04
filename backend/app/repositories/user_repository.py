from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User


class UserRepository:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """
        Query a user by normalized email address.
        """
        normalized_email = email.strip().lower()
        return db.query(User).filter(User.email == normalized_email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        """
        Query a user by primary key ID.
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(
        db: Session,
        full_name: str,
        email: str,
        password_hash: str
    ) -> User:
        """
        Create and persist a new user record in SQL Server.
        """
        user = User(
            full_name=full_name.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
