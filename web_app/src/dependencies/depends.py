# Внешние зависимости
from typing import Optional
from datetime import datetime, timedelta, UTC
import uuid
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
# Внутренние модули
from web_app.src.models import UserInDB
from web_app.src.utils import verify_password
from web_app.src.crud import get_user_by_username, get_user_by_id
from web_app.src.core import cfg


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# Аутентификация пользователя
async def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = await get_user_by_username(username=username)
    if not user:
        return None

    user_obj = UserInDB(**user)

    if not verify_password(password, user_obj.hashed_password):
        return None

    return user_obj


# Создание JWT токена
def create_jwt_token(
    data: dict,
    expires_minutes: int,
    secret_key: str
) -> str:
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(minutes=expires_minutes)

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(UTC)
    })
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=cfg.ALGORITHM)

    return encoded_jwt


# Создание refresh токена
def create_refresh_token(user: UserInDB) -> str:
    refresh_token = create_jwt_token(
        data={
            "sub": str(user.id),
            "type": "refresh",
            "jti": str(uuid.uuid4())
        },
        expires_minutes=cfg.REFRESH_TOKEN_EXPIRE_MINUTES,
        secret_key=cfg.SECRET_REFRESH_KEY
    )

    return refresh_token


# Создание access токена
def create_access_token(user: UserInDB) -> str:
    access_token = create_jwt_token(
        data={
            "sub": str(user.id),
            "type": "access"
        },
        expires_minutes=cfg.ACCESS_TOKEN_EXPIRE_MINUTES,
        secret_key=cfg.SECRET_ACCESS_KEY
    )

    return access_token


# Создание csrf токена
def create_csrf_token(user: UserInDB) -> str:
    csrf_token = create_jwt_token(
        data={
            "sub": str(user.id),
            "type": "csrf"
        },
        expires_minutes=cfg.CSRF_TOKEN_EXPIRE_MINUTES,
        secret_key=cfg.SECRET_CSRF_KEY
    )

    return csrf_token


# Получаем пользователя по access токену
async def get_current_user(
    access_token: Optional[str] = Depends(oauth2_scheme)
) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            access_token,
            cfg.SECRET_ACCESS_KEY,
            algorithms=[cfg.ALGORITHM],
            leeway=10
        )
        user_id: str = payload.get("sub")
        type_token: str = payload.get("type")

        if user_id is None or type_token != "access":
            raise credentials_exception

    except jwt.PyJWTError:
        raise credentials_exception

    user = await get_user_by_id(user_id=user_id) # класть в redis на ACCESS_TOKEN_EXPIRE_MINUTES для кэширования и забирать потом оттуда
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserInDB(**user)