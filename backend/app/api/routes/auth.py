"""
Authentication routes: email/password signup+login, plus stubs for
Google and GitHub OAuth callback exchange (production wiring point for
Clerk or Auth.js).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "full_name": user.full_name}
    )
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "full_name": user.full_name}
    )
    return TokenResponse(access_token=token)


@router.post("/oauth/google", response_model=TokenResponse)
async def oauth_google(id_token: str, db: AsyncSession = Depends(get_db)):
    """Exchange a verified Google ID token for a ResearchOS session token.
    Wire this to Google's tokeninfo endpoint or Clerk's session verification
    in production."""
    raise HTTPException(status_code=501, detail="Configure Google OAuth verification in production")


@router.post("/oauth/github", response_model=TokenResponse)
async def oauth_github(code: str, db: AsyncSession = Depends(get_db)):
    """Exchange a GitHub OAuth code for a ResearchOS session token."""
    raise HTTPException(status_code=501, detail="Configure GitHub OAuth verification in production")
