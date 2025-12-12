# Внешние зависимости
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates


router = APIRouter()
templates = Jinja2Templates(directory="web_app/templates")


# Страница с таблицей с принимающими сторонами
@router.get("/", response_class=HTMLResponse)
async def receiving_page(request: Request):
    context = {
        "request": request,
        "title": "Уведомление о прибытии иностранного гражданина"
    }

    return templates.TemplateResponse('form.html', context=context)