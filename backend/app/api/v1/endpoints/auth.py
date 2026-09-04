from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new parent account"
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new parent account. Checks for existing email and securely hashes password with Argon2.
    """
    existing_user = UserRepository.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_pwd = hash_password(user_in.password)
    user = UserRepository.create_user(
        db,
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_pwd
    )
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate parent and return JWT access token"
)
def login(
    user_in: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate parent user credentials, verify Argon2 password hash, and return JWT access token.
    """
    user = UserRepository.get_by_email(db, email=user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated parent profile"
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get profile information of the current authenticated user. Protected endpoint.
    """
    return current_user
