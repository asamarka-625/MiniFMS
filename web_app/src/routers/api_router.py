# Внешние зависимости
import uuid
from fastapi import APIRouter
from fastapi.responses import JSONResponse
# Внутренние модули
from web_app.src.core import config
from web_app.src.schemas import FormRequest
from web_app.src.utils import create_xlsx_from_data


router = APIRouter(
    prefix="/api/v1",
    tags=["API"]
)


@router.get(
    path="/cells",
    response_class=JSONResponse,
    summary="Выводим валидные ячейки"
)
async def get_cells():
    return config.VALID_CELLS


@router.post(
    path="/create",
    response_class=JSONResponse,
    summary="Создаем заполненную форму по данным"
)
async def create_form_from_data(data: FormRequest):
    for key, value in data.model_dump().items():
        print(f"{key}: -{value}-")

    file_name = uuid.uuid4()
    # create_xlsx_from_data(data=data, output_name=file_name)

    return {
        "status": "success",
        "file_name": file_name
    }