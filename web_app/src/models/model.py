# Внешние зависимости
from typing import Annotated
from datetime import datetime, UTC
from uuid import UUID
from bson import ObjectId
from pydantic import Field, BeforeValidator, ConfigDict, PlainSerializer
# Внутренние модули
from web_app.src.schemas import UserBase, FormRequest


PyObjectId = Annotated[
    ObjectId,
    # 1. Валидатор: превращает входящую строку в ObjectId
    BeforeValidator(lambda v: ObjectId(v) if isinstance(v, str) else v),
    # 2. Сериализатор: превращает ObjectId в строку для JSON (ответа)
    PlainSerializer(lambda v: str(v), return_type=str),
]


# Модель пользователя
class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    model_config = ConfigDict(
        # Позволяет использовать id вместо _id при инициализации
        populate_by_name=True,
        # Позволяет работать с типом ObjectId напрямую
        arbitrary_types_allowed=True,
        # Автоматическое преобразование ObjectId в строку при выводе в JSON (API)
        json_encoders={ObjectId: str}
    )


# Модель данных формы
class FormInDB(FormRequest):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    uuid: UUID

    model_config = ConfigDict(
        # Позволяет использовать id вместо _id при инициализации
        populate_by_name=True,
        # Позволяет работать с типом ObjectId напрямую
        arbitrary_types_allowed=True,
        # Автоматическое преобразование ObjectId в строку при выводе в JSON (API)
        json_encoders={ObjectId: str}
    )