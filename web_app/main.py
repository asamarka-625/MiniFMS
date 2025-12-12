# Внешние зависимости
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
# Внутренние модули
from web_app.src.core import config
from web_app.src.routers import router
from web_app.src.utils import get_valid_cells


async def startup():
    config.logger.info("Инициализируем валидные ячейки из шаблона")
    get_valid_cells()


async def shutdown():
    config.logger.info("Останавливаем приложение...")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup логика
    await startup()
    yield
    # Shutdown логика
    await shutdown()


app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory="web_app/src/static"), name="static")

# Подключение маршрутов
app.include_router(router)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=8000, reload=False)