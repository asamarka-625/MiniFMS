# Внешние зависимости
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
# Внутренние модули
from web_app.src.dependencies import authenticate_user, create_user_token, get_current_user
from web_app.src.models import UserInDB


router = APIRouter(tags=["authentication"])


@router.post(
    "/login",
    response_model=Token,
    summary="Аутентификация пользователя"
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_user_token(user)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Обновление токена"
)
async def refresh_token(current_user: UserInDB = Depends(get_current_user)):
    # Создаем новый токен
    return create_user_token(current_user)