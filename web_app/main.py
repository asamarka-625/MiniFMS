# Внешние зависимости
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
# Внутренние модули
from web_app.src.core import cfg, mongodb
from web_app.src.routers import router
from web_app.src.utils import get_valid_cells


async def startup():
    cfg.logger.info("Инициализируем mongodb")
    await mongodb.connect()

    cfg.logger.info("Инициализируем валидные ячейки из шаблона")
    get_valid_cells()


async def shutdown():
    cfg.logger.info("Закрываем соединение с mongodb")
    await mongodb.close()
    cfg.logger.info("Останавливаем приложение...")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup()
    yield
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