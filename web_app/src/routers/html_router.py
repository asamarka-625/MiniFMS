# Внешние зависимости
from typing import Dict
from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
# Внутренние модули
from web_app.src.dependencies import get_data_by_refresh_token


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