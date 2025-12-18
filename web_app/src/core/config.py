# Внешние зависимости
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass, field
from dotenv import load_dotenv
import os
import logging
# Внутренние модули
from web_app.src.core.logger import setup_logger


load_dotenv()


@dataclass
class Config:
    _mongo_url: str = field(default_factory=lambda: os.getenv("MONGO_URL"))
    _mongo_db: str = field(default_factory=lambda: os.getenv("MONGO_DB"))
    _mongo_password: str = field(default_factory=lambda: os.getenv("MONGO_PASSWORD"))
    _redis_url: str = field(default_factory=lambda: os.getenv("REDIS_URL"))
    logger: logging.Logger = field(init=False)

    ALGORITHM: str = field(default_factory=lambda: os.getenv("ALGORITHM"))

    REFRESH_TOKEN_EXPIRE_MINUTES: int = field(default_factory=lambda: int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES")))
    SECRET_REFRESH_KEY: str = field(default_factory=lambda: os.getenv("SECRET_REFRESH_KEY"))

    ACCESS_TOKEN_EXPIRE_MINUTES: int = field(default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    SECRET_ACCESS_KEY: str = field(default_factory=lambda: os.getenv("SECRET_ACCESS_KEY"))

    CSRF_TOKEN_EXPIRE_MINUTES: int = field(default_factory=lambda: int(os.getenv("CSRF_TOKEN_EXPIRE_MINUTES")))
    SECRET_CSRF_KEY: str = field(default_factory=lambda: os.getenv("SECRET_CSRF_KEY"))

    USER_CACHE_MINUTES: int = field(default_factory=lambda: int(os.getenv("USER_CACHE_MINUTES")))

    TEMPLATE_XLSX: str = field(init=False)
    XLSX_DIR: str = field(init=False)
    PDF_DIR: str = field(init=False)
    FILTER_SETTINGS: Dict[int, Dict[str, Any]] = field(init=False)
    VALID_CELLS: Dict[int, List[str]] = field(init=False)
    TRANSFER_WORDS: Tuple[str] = field(init=False)

    _allowed_origins_env: str = field(default_factory=lambda: os.getenv("ALLOWED_ORIGINS"))

    def __post_init__(self):
        self.logger = setup_logger(
            level=os.getenv("LOG_LEVEL", "INFO"),
            log_dir=os.getenv("LOG_DIR", "logs"),
            log_file=os.getenv("LOG_FILE", "web_log")
        )

        self.TEMPLATE_XLSX: str = "template.xlsx"
        self.XLSX_DIR: str = "web_app/src/static/documents/xlsx"
        self.PDF_DIR: str = "web_app/src/static/documents/pdf"

        self.FILTER_SETTINGS: Dict[int, Dict[str, Any]] = {
            0: {
                "skip": 10,
                "ignore": None,
                "input": None
            },
            1: {
                "skip": 4,
                "ignore": ("BJ60",),
                "input": ("B12", "AT12", "CL12", "B14", "AT14", "B25", "AT25", "CL25", "B27", "AT27")
            },
            2: {
                "skip": 3,
                "ignore": None,
                "input": ("B24", "AT24", "CL24", "B26", "AT26", "B55", "AT55", "CL55", "B57", "AT57")
            },
            3: {
                "skip": 3,
                "ignore": ("A26", "CD23", "B46", "M27", "B54", "BN46"),
                "input": ("B18", "AT18", "CL18", "B20", "AT20")
            },
        }

        self.TRANSFER_WORDS: Tuple[str] = (
            "host_phone", "host_name_org_line_1", "host_name_org_line_2", "host_org_inn", "host_org_region",
            "host_org_city", "host_org_area", "host_org_road", "host_org_building_1", "host_org_building_2",
            "host_org_building_3", "host_org_room_1", "host_org_room_2"
        )

        self.validate()
        self.logger.info("Configuration initialized")

    # Валидация конфигурации
    def validate(self):
        if not self._mongo_url:
            self.logger.critical("MONGO_URL is required in environment variables")
            raise ValueError("MONGO_URL is required")

        self.logger.debug("Configuration validation passed")

    @property
    def MONGO_URL(self) -> str:
        return self._mongo_url

    @property
    def MONGO_DB(self) -> str:
        return self._mongo_db

    @property
    def REDIS_URL(self) -> str:
        return self._redis_url

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self._allowed_origins_env.split(",") if origin.strip()]

    def __str__(self) -> str:
        return f"Config(mongodb={self._mongo_url}, redis={self._redis_url}, log_level={self.logger.level})"


_instance = None


def get_config() -> Config:
    global _instance
    if _instance is None:
        _instance = Config()

    return _instance