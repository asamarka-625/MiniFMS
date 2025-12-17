# Внешние зависимости
from bson import ObjectId
from datetime import datetime


# Рекурсивно преобразует BSON типы
def convert_bson_types(value):
    if isinstance(value, ObjectId):
        return str(value)
    elif isinstance(value, datetime):
        return value.isoformat()
    elif isinstance(value, dict):
        return {k: convert_bson_types(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [convert_bson_types(item) for item in value]
    else:
        return value