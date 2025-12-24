# Внешние зависимости
from typing import Annotated
import html
import re
from pydantic import BaseModel, Field, field_validator
from email_validator import validate_email, EmailNotValidError


# Модель email
class EmailBase(BaseModel):
    email: Annotated[str, Field(strict=True)]

    @field_validator('email')
    @classmethod
    def validate_and_normalize_email(cls, value: str) -> str:
        """Валидирует и нормализует email адрес"""
        if not value:
            raise ValueError('Email не может быть пустым')

        try:
            # Используем email-validator для полноценной проверки
            email_info = validate_email(value.strip(), check_deliverability=False)
            return email_info.normalized.lower()
        except EmailNotValidError as e:
            raise ValueError(f'Некорректный email адрес: {str(e)}')


# User модель
class UserBase(EmailBase):
    username: Annotated[str, Field(strict=True, max_length=25)]

    @field_validator('username')
    @classmethod
    def validate_username_format(cls, value: str) -> str:
        """Проверяет формат имени пользователя"""
        if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
            raise ValueError(
                'Имя пользователя может содержать только буквы, цифры, точку, дефис и подчеркивание'
            )
        if len(value) < 3:
            raise ValueError('Имя пользователя должно быть не менее 3 символов')

        return html.escape(value.strip())


# Модель создания пользователя
class UserCreate(UserBase):
    password: Annotated[str, Field(strict=True, max_length=100)]


# Модель верификации пользователя
class VerifyRequest(EmailBase):
    code: Annotated[str, Field(strict=True, max_length=6)]

    @field_validator('code')
    @classmethod
    def validate_verification_code(cls, value: str) -> str:
        """Проверяет, что код состоит только из цифр"""
        if not value:
            raise ValueError('Код подтверждения не может быть пустым')

        value = value.strip()

        if not value.isdigit():
            raise ValueError('Код подтверждения должен содержать только цифры')

        return value


# Модель создания нового пароля
class PasswordResetConfirmRequest(BaseModel):
    token: Annotated[str, Field(strict=True)]
    new_password: Annotated[str, Field(strict=True, max_length=100)]
