# Внешние зависимости
from typing import Optional, List, Dict, Any
from datetime import datetime, UTC
from uuid import UUID
from bson import ObjectId
# Внутренние модули
from web_app.src.core import mongodb
from web_app.src.schemas import FormRequest
from web_app.src.utils import convert_bson_types


# Создаем новую форму
async def create_form(
    form_uuid: UUID,
    form_data: FormRequest,
    user_id: ObjectId
) -> Dict[str, Any]:
    form_dict = form_data.model_dump()
    form_dict.update({
        "uuid": str(form_uuid),
        "user_id": user_id,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    })

    result = await mongodb.db.forms.insert_one(form_dict)
    created_form = await mongodb.db.forms.find_one(
        {"_id": result.inserted_id}
    )

    if created_form:
        created_form["id"] = str(created_form.pop("_id"))
        return convert_bson_types(created_form)

    return {}

# Получаем форму по ID
async def get_form_by_id(form_id: str) -> Optional[Dict[str, Any]]:
    try:
        form = await mongodb.db.forms.find_one(
            {"_id": ObjectId(form_id)}
        )

        if form:
            form["id"] = str(form.pop("_id"))
            return convert_bson_types(form)

    except:
        return None


# Получаем форму пользователя
async def get_user_forms(
        user_id: ObjectId,
        skip: int = 0,
        limit: int = 100,
) -> List[Dict[str, Any]]:
    query = {"user_id": user_id}

    projection = {
        "_id": 1,
        "created_at": 1,
        "updated_at": 1,
        "uuid": 1
    }

    cursor = mongodb.db.forms.find(query, projection).sort("updated_at", -1).skip(skip).limit(limit)
    forms = await cursor.to_list(length=limit)

    return convert_bson_types(forms)


# Обновляем форму
async def update_form(form_id: str, form_data: FormRequest) -> Optional[Dict[str, Any]]:
    new_data = form_data.model_dump()

    if not new_data:
        return None

    new_data["updated_at"] = datetime.now(UTC)

    await mongodb.db.forms.update_one(
        {"_id": ObjectId(form_id)},
        {"$set": new_data}
    )

    return await get_form_by_id(form_id)


# Удаляем форму
async def delete_form(form_id: str) -> bool:
    result = await mongodb.db.forms.delete_one(
        {"_id": ObjectId(form_id)}
    )
    return result.deleted_count > 0