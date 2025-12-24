# Внешние зависимости
from typing import Dict, Annotated
from fastapi import APIRouter, Request, Depends, status, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import Field
# Внутренние модули
from web_app.src.dependencies import get_data_by_refresh_token
from web_app.src.utils import redis_service


router = APIRouter()
templates = Jinja2Templates(directory="web_app/templates")


# Страница аутентификации
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    context = {
        "request": request,
        "title": "Аутентификации"
    }

    return templates.TemplateResponse('login.html', context=context)


# Страница регистрации нового пользователя
@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    context = {
        "request": request,
        "title": "Регистрация - Система уведомлений ФМС"
    }

    return templates.TemplateResponse('register.html', context=context)


# Страница с формой заполнения
@router.get("/", response_class=HTMLResponse)
async def form_page(
    request: Request,
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token)
):
    context = {
        "request": request,
        "title": "Уведомление о прибытии иностранного гражданина",
        "edit": False
    }

    return templates.TemplateResponse('form.html', context=context)


# Список документов пользователя
@router.get("/documents", response_class=HTMLResponse)
async def documents_page(
    request: Request,
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token)
):
    context = {
        "request": request,
        "title": "Список документов - ФМС"
    }

    return templates.TemplateResponse('documents.html', context=context)


# Список документов пользователя
@router.get("/document/edit/{form_id}", response_class=HTMLResponse)
async def edit_document(
    request: Request,
    form_id: str,
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token)
):
    context = {
        "request": request,
        "title": "Список документов - ФМС",
        "edit": True
    }

    return templates.TemplateResponse('form.html', context=context)


# Страница для восстановления пароля
@router.get("/forgot-password", response_class=HTMLResponse)
async def forgot_password(
        request: Request
):
    context = {
        "request": request
    }
    return templates.TemplateResponse('forgot-password.html', context=context)


# Смена пароля
@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password(
    request: Request,
    token: Annotated[str, Field(strict=True)]
):
    # Проверяем токен
    email = await redis_service.get_reset_password_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    context = {
        "request": request
    }
    return templates.TemplateResponse('reset-password-confirm.html', context=context)