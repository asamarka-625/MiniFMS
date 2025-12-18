# Внешние зависимости
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
# Внутренние модули
from web_app.src.core import cfg
from web_app.src.schemas import FormRequest
from web_app.src.utils import run_generate_pdf, delete_file_safe
from web_app.src.crud import create_form, get_form_by_id, update_form, delete_form
from web_app.src.models import UserInDB
from web_app.src.dependencies import get_current_user_by_access_token, verify_csrf_token


router = APIRouter(
    prefix="/api/v1/forms",
    tags=["forms"]
)


@router.get(
    path="/cells",
    response_class=JSONResponse,
    summary="Выводим валидные ячейки"
)
async def get_cells():
    return cfg.VALID_CELLS


@router.post(
    path="/create",
    response_class=JSONResponse,
    summary="Создаем заполненную форму по данным"
)
async def create_form_from_data(
    data: FormRequest,
    current_user: UserInDB = Depends(get_current_user_by_access_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    if not str(current_user.id) == csrf_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    file_name = uuid.uuid4()
    run_generate_pdf(data=data, output_name=file_name)

    # Создаем форму
    created_form = await create_form(
        form_uuid=file_name,
        form_data=data,
        user_id=current_user.id
    )

    return {
        "message": "Form created successfully",
        "form_id": created_form["id"],
        "file_name": file_name
    }


@router.get(
    "/{form_id}",
    response_class=JSONResponse,
    summary="Получение формы по ID"
)
async def get_my_form(
    form_id: str,
    current_user: UserInDB = Depends(get_current_user_by_access_token),
):
    # Получаем форму
    form = await get_form_by_id(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    # Проверяем, что форма принадлежит пользователю
    if form["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this form"
        )

    del form["user_id"]
    return form


@router.put(
    "/{form_id}",
    response_class=JSONResponse,
    summary="Обновление формы"
)
async def update_my_form(
    form_id: str,
    data: FormRequest,
    current_user: UserInDB = Depends(get_current_user_by_access_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not user_id_str == csrf_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    # Получаем форму
    form = await get_form_by_id(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    # Проверяем, что форма принадлежит пользователю
    if form["user_id"] != user_id_str:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this form"
        )

    run_generate_pdf(data=data, output_name=form["uuid"])

    updated_form = await update_form(form_id, data)

    return {
        "message": "Form created successfully",
        "form_id": updated_form["id"],
        "file_name": updated_form["uuid"]
    }


@router.delete(
    "/{form_id}",
    response_class=JSONResponse,
    summary="Удаление формы"
)
async def delete_my_form(
    form_id: str,
    current_user: UserInDB = Depends(get_current_user_by_access_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not user_id_str == csrf_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    # Получаем форму
    form = await get_form_by_id(form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    # Проверяем, что форма принадлежит пользователю
    if form["user_id"] != user_id_str:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this form"
        )

    # Удаляем форму
    success = await delete_form(form_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete form"
        )

    delete_file_safe(file_path=f"{cfg.PDF_DIR}/{form["uuid"]}.pdf")
    return {"message": "Form deleted successfully"}

