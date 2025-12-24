# Внешние зависимости
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
# Внутренние модули
from web_app.src.crud import get_user_forms
from web_app.src.dependencies import get_current_user_by_access_token
from web_app.src.models import UserInDB


router = APIRouter(
    prefix="/api/v1/user",
    tags=["user"]
)


@router.get(
    "/me",
    response_class=JSONResponse,
    summary="Получение данных текущего пользователя"
)
async def get_my_info(current_user: UserInDB = Depends(get_current_user_by_access_token)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "username": current_user.username
    }


@router.get(
    "/me/forms",
    response_class=JSONResponse,
    summary="Получение форм текущего пользователя"
)
async def get_my_forms(
    current_user: UserInDB = Depends(get_current_user_by_access_token),
    skip: int = 0,
    limit: int = 50
):
    forms = await get_user_forms(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )

    return {
        "forms": forms,
    }
