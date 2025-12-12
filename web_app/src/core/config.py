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
    _database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL"))
    logger: logging.Logger = field(init=False)

    TEMPLATE_XLSX: str = field(init=False)
    INPUT_DIR: str = field(init=False)
    OUTPUT_DIR: str = field(init=False)
    FILTER_SETTINGS: Dict[int, Dict[str, Any]] = field(init=False)
    VALID_CELLS: Dict[int, List[str]] = field(init=False)
    TRANSFER_WORDS: Tuple[str] = field(init=False)

    def __post_init__(self):
        self.logger = setup_logger(
            level=os.getenv("LOG_LEVEL", "INFO")
        )

        self.TEMPLATE_XLSX: str = "template.xlsx"
        self.INPUT_DIR: str = "web_app/src/static/documents/xlsx"
        self.OUTPUT_DIR: str = "web_app/src/static/documents/pdf"

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
                "ignore": ("CD23", "B46", "M27", "B54", "BN46"),
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
        if not self._database_url:
            self.logger.critical("DATABASE_URL is required in environment variables")
            raise ValueError("DATABASE_URL is required")

        self.logger.debug("Configuration validation passed")

    @property
    def DATABASE_URL(self) -> str:
        return self._database_url

    def __str__(self) -> str:
        return f"Config(database={self._database_url}, log_level={self.logger.level})"


_instance = None


def get_config() -> Config:
    global _instance
    if _instance is None:
        _instance = Config()

    return _instance