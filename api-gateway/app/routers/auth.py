# Router de autenticación — Secure Workspace
# Endpoints: registro y login con JWT

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.deps import hash_password, verify_password, create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Registra un nuevo usuario.
    - Valida que el email no esté registrado.
    - Hashea la contraseña con bcrypt.
    """
    # Verificar si el email ya existe
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    # Crear usuario con contraseña hasheada
    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role="user",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Inicia sesión y retorna tokens JWT (access + refresh).
    - Verifica email y contraseña.
    - Genera par de tokens con el ID del usuario.
    """
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )
