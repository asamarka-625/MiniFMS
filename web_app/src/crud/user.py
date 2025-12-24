# Внешние зависимости
from typing import Optional, Dict, Any
from datetime import datetime, UTC
from bson import ObjectId
# Внутренние модули
from web_app.src.core import mongodb
from web_app.src.utils import convert_bson_types


# Создаем нового пользователя
async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    # Проверка уникальности
    existing_user = await mongodb.db.users.find_one(
        {"username": user_data["username"]}
    )

    if existing_user:
        raise ValueError("User with this username already exists")

    user_data.update({
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    })

    result = await mongodb.db.users.insert_one(user_data)
    created_user = await mongodb.db.users.find_one(
        {"_id": result.inserted_id}
    )

    if created_user:
        created_user["id"] = str(created_user.pop("_id"))

    return convert_bson_types(created_user)


# Получаем пользователя по ID
async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        user = await mongodb.db.users.find_one(
            {"_id": ObjectId(user_id)}
        )

        if user:
            user["id"] = str(user.pop("_id"))
            return convert_bson_types(user)

    except:
        return None


# Получаем пользователя по username
async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        try:
            user = await mongodb.db.users.find_one(
                {"username": username}
            )

            if user:
                user["id"] = str(user.pop("_id"))
                return convert_bson_types(user)

        except:
            return None


# Получаем пользователя по email
async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        try:
            user = await mongodb.db.users.find_one(
                {"email": email}
            )

            if user:
                user["id"] = str(user.pop("_id"))
                return convert_bson_types(user)

        except:
            return None


# Обновляем пароль пользователя
async def update_password_user_by_email(
    email: str,
    new_password_hash: str
) -> Optional[Dict[str, Any]]:
    await mongodb.db.users.update_one(
        {"email": email},
        {
            "$set": {
                "hashed_password": new_password_hash
            }
        }
    )

