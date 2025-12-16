# Внешние зависимости
from typing import Optional, Dict, Any
from bson import ObjectId
from datetime import datetime, UTC
# Внутренние модули
from web_app.src.core import mongodb
from web_app.src.schemas import UserCreate
from web_app.src.utils import get_password_hash


# Создаем нового пользователя
async def create_user(user_data: UserCreate) -> Dict[str, Any]:
    # Проверка уникальности
    existing_user = await mongodb.db.users.find_one(
        {"username": user_data.username}
    )

    if existing_user:
        raise ValueError("User with this username already exists")

    # Хеширование пароля
    hashed_password = get_password_hash(user_data.password)

    user_dict = user_data.model_dump(exclude={"password"})
    user_dict.update({
        "hashed_password": hashed_password,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    })

    result = await mongodb.db.users.insert_one(user_dict)
    created_user = await mongodb.db.users.find_one(
        {"_id": result.inserted_id}
    )

    if created_user:
        created_user["id"] = str(created_user.pop("_id"))

    return created_user


# Получаем пользователя по ID
async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        user = await mongodb.db.users.find_one(
            {"_id": ObjectId(user_id)}
        )

        if user:
            user["id"] = str(user.pop("_id"))

        return user

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

            return user

        except:
            return None