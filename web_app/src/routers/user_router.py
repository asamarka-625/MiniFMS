# Внешние зависимости
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
# Внутренние модули
from web_app.src.schemas import UserCreate
from web_app.src.crud import create_user, get_user_forms
from web_app.src.dependencies import get_current_user_by_access_token
from web_app.src.models import UserInDB


router = APIRouter(
    prefix="/api/v1/user",
    tags=["user"]
)


@router.post(
    "/register",
    response_class=JSONResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация нового пользователя"
)
async def register(user: UserCreate):
    try:
        created_user = await create_user(user)
        return {
            "message": "User registered successfully",
            "user": {
                "id": created_user["id"],
                "username": created_user["username"]
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
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
