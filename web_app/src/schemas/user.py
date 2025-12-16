# Внешние зависимости
from pydantic import BaseModel


# User модель
class UserBase(BaseModel):
    username: str


# Модель создания пользователя
class UserCreate(UserBase):
    password: str


