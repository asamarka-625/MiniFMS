# Внешние зависимости
from typing import Optional
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
# Внутренние модули
from web_app.src.core.config import get_config


cfg = get_config()


# Класс для управления подключением к MongoDB
class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls):
        """Подключение к MongoDB и инициализация"""
        try:
            cls.client = AsyncIOMotorClient(
                cfg.MONGO_URL,
                maxPoolSize=100,  # Максимальный размер пула соединений
                minPoolSize=10,  # Минимальный размер пула
                retryWrites=True,
                w="majority"
            )

            # Проверка подключения
            await cls.client.admin.command('ping')
            cls.db = cls.client[cfg.MONGO_DB]

            cfg.logger.info(f"Connected to MongoDB: {cfg.MONGO_URL}")
            cfg.logger.info(f"Database: {cfg.MONGO_DB}")

            # Инициализация базы данных
            await cls.initialize_database()

        except Exception as e:
            cfg.logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def initialize_database(cls):
        """Инициализация коллекций и индексов"""
        if cls.db is None:
            raise RuntimeError("Database not connected")

        cfg.logger.info("Initializing database...")

        # Создание индексов для коллекции users
        await cls.create_user_indexes()

        # Создание индексов для коллекции forms
        await cls.create_form_indexes()

        cfg.logger.info("Database initialized successfully")

    @classmethod
    async def create_user_indexes(cls):
        """Создание индексов для коллекции users"""
        await cls.db.users.create_index("username", unique=True, name="username_unique")

        cfg.logger.info("User indexes created")

    @classmethod
    async def create_form_indexes(cls):
        """Создание индексов для коллекции forms"""
        await cls.db.forms.create_index("uuid", unique=True, name="form_uuid_unique")

        cfg.logger.info("Form indexes created")

    @classmethod
    async def close(cls):
        """Закрытие подключения"""
        if cls.client:
            cls.client.close()
            cfg.logger.info("MongoDB connection closed")

    @classmethod
    async def get_database(cls) -> AsyncIOMotorDatabase:
        """Получение экземпляра базы данных"""
        if cls.db is None:
            await cls.connect()
        return cls.db

    """
    @classmethod
    @asynccontextmanager
    async def transaction(cls, **kwargs):
        async with await cls.client.start_session() as session:
            async with session.start_transaction(**kwargs):
                yield session
    """