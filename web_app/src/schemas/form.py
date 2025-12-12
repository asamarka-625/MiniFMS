# Внешние зависимости
from typing import Annotated, Dict, Any
from pydantic import BaseModel, Field, model_validator


class FormRequest(BaseModel):
    surname_field: Annotated[str, Field(strict=True, max_length=28)]
    surname_latin_field: Annotated[str, Field(strict=True, max_length=22)]
    name_field: Annotated[str, Field(strict=True, max_length=28)]
    name_latin_field: Annotated[str, Field(strict=True, max_length=23)]
    patronymic_field: Annotated[str, Field(strict=True, max_length=24)]
    patronymic_latin_field: Annotated[str, Field(strict=True, max_length=22)]
    citizenship_field: Annotated[str, Field(strict=True, max_length=26)]
    birth_day: Annotated[str, Field(strict=True, max_length=2)]
    birth_month: Annotated[str, Field(strict=True, max_length=2)]
    birth_year: Annotated[str, Field(strict=True, max_length=4)]
    gender_male: bool
    gender_female: bool
    birth_place: Annotated[str, Field(strict=True, max_length=25)]
    birth_state: Annotated[str, Field(strict=True, max_length=21)]
    birth_city: Annotated[str, Field(strict=True, max_length=21)]
    document_type: Annotated[str, Field(strict=True, max_length=29)]
    document_series: Annotated[str, Field(strict=True, max_length=6)]
    document_number: Annotated[str, Field(strict=True, max_length=21)]
    issue_day: Annotated[str, Field(strict=True, max_length=2)]
    issue_month: Annotated[str, Field(strict=True, max_length=2)]
    issue_year: Annotated[str, Field(strict=True, max_length=4)]
    expiry_day: Annotated[str, Field(strict=True, max_length=2)]
    expiry_month: Annotated[str, Field(strict=True, max_length=2)]
    expiry_year: Annotated[str, Field(strict=True, max_length=4)]
    birth_act_number: Annotated[str, Field(strict=True, max_length=21)]
    birth_act_date: Annotated[str, Field(strict=True, max_length=8)]
    birth_act_body_line_1: Annotated[str, Field(strict=True, max_length=31)]
    birth_act_body_line_2: Annotated[str, Field(strict=True, max_length=31)]
    birth_act_body_line_3: Annotated[str, Field(strict=True, max_length=31)]
    resident_visa: bool
    resident_card: bool
    resident_permit: bool
    resident_permit_educational: bool
    document_right_series: Annotated[str, Field(strict=True, max_length=6)]
    document_right_number: Annotated[str, Field(strict=True, max_length=21)]
    right_issue_day: Annotated[str, Field(strict=True, max_length=2)]
    right_issue_month: Annotated[str, Field(strict=True, max_length=2)]
    right_issue_year: Annotated[str, Field(strict=True, max_length=4)]
    right_expiry_day: Annotated[str, Field(strict=True, max_length=2)]
    right_expiry_month: Annotated[str, Field(strict=True, max_length=2)]
    right_expiry_year: Annotated[str, Field(strict=True, max_length=4)]
    target_official: bool
    target_tourism: bool
    target_business: bool
    target_study: bool
    target_work: bool
    target_private: bool
    target_transit: bool
    target_humanitarian: bool
    target_other: bool
    phone_field: Annotated[str, Field(strict=True, max_length=10)]
    profession_field: Annotated[str, Field(strict=True, max_length=27)]
    entry_day: Annotated[str, Field(strict=True, max_length=2)]
    entry_month: Annotated[str, Field(strict=True, max_length=2)]
    entry_year: Annotated[str, Field(strict=True, max_length=4)]
    stay_until_day: Annotated[str, Field(strict=True, max_length=2)]
    stay_until_month: Annotated[str, Field(strict=True, max_length=2)]
    stay_until_year: Annotated[str, Field(strict=True, max_length=4)]
    migration_card_series: Annotated[str, Field(strict=True, max_length=13)]
    representative_line_1: Annotated[str, Field(strict=True, max_length=26)]
    representative_line_2: Annotated[str, Field(strict=True, max_length=26)]
    representative_line_3: Annotated[str, Field(strict=True, max_length=26)]
    representative_line_4: Annotated[str, Field(strict=True, max_length=26)]
    representative_line_5: Annotated[str, Field(strict=True, max_length=26)]
    prev_region: Annotated[str, Field(strict=True, max_length=31)]
    prev_city: Annotated[str, Field(strict=True, max_length=31)]
    prev_area: Annotated[str, Field(strict=True, max_length=31)]
    prev_road: Annotated[str, Field(strict=True, max_length=31)]
    current_region: Annotated[str, Field(strict=True, max_length=31)]
    current_city: Annotated[str, Field(strict=True, max_length=31)]
    current_area: Annotated[str, Field(strict=True, max_length=31)]
    current_road: Annotated[str, Field(strict=True, max_length=31)]
    room_living: bool
    room_other: bool
    room_organization: bool
    permission_doc_line_1: Annotated[str, Field(strict=True, max_length=22)]
    permission_doc_line_2: Annotated[str, Field(strict=True, max_length=22)]
    permission_doc_line_3: Annotated[str, Field(strict=True, max_length=22)]
    permission_doc_line_4: Annotated[str, Field(strict=True, max_length=22)]
    permission_doc_line_5: Annotated[str, Field(strict=True, max_length=22)]
    permission_doc_line_6: Annotated[str, Field(strict=True, max_length=20)]
    actual_region: Annotated[str, Field(strict=True, max_length=31)]
    actual_city: Annotated[str, Field(strict=True, max_length=31)]
    actual_area: Annotated[str, Field(strict=True, max_length=31)]
    actual_cadastral: Annotated[str, Field(strict=True, max_length=20)]
    live_day: Annotated[str, Field(strict=True, max_length=2)]
    live_month: Annotated[str, Field(strict=True, max_length=2)]
    live_year: Annotated[str, Field(strict=True, max_length=4)]
    person_organization: bool
    person_individual: bool
    host_surname: Annotated[str, Field(strict=True, max_length=28)]
    host_name: Annotated[str, Field(strict=True, max_length=28)]
    host_patronymic: Annotated[str, Field(strict=True, max_length=28)]
    host_document_type: Annotated[str, Field(strict=True, max_length=10)]
    host_document_series: Annotated[str, Field(strict=True, max_length=4)]
    host_document_number: Annotated[str, Field(strict=True, max_length=12)]
    host_issue_day: Annotated[str, Field(strict=True, max_length=2)]
    host_issue_month: Annotated[str, Field(strict=True, max_length=2)]
    host_issue_year: Annotated[str, Field(strict=True, max_length=4)]
    host_expiry_day: Annotated[str, Field(strict=True, max_length=2)]
    host_expiry_month: Annotated[str, Field(strict=True, max_length=2)]
    host_expiry_year: Annotated[str, Field(strict=True, max_length=4)]
    host_region: Annotated[str, Field(strict=True, max_length=31)]
    host_city: Annotated[str, Field(strict=True, max_length=31)]
    host_area: Annotated[str, Field(strict=True, max_length=31)]
    host_road: Annotated[str, Field(strict=True, max_length=31)]
    host_phone: Annotated[str, Field(strict=True, max_length=10)]
    host_name_org_line_1: Annotated[str, Field(strict=True, max_length=26)]
    host_name_org_line_2: Annotated[str, Field(strict=True, max_length=16)]
    host_org_inn: Annotated[str, Field(strict=True, max_length=13)]
    host_org_region: Annotated[str, Field(strict=True, max_length=31)]
    host_org_city: Annotated[str, Field(strict=True, max_length=31)]
    host_org_area: Annotated[str, Field(strict=True, max_length=31)]
    host_org_road: Annotated[str, Field(strict=True, max_length=31)]
    prev_building_1: Annotated[str, Field(strict=True, max_length=100)]
    prev_building_2: Annotated[str, Field(strict=True, max_length=100)]
    prev_building_3: Annotated[str, Field(strict=True, max_length=100)]
    prev_room_1: Annotated[str, Field(strict=True, max_length=100)]
    prev_room_2: Annotated[str, Field(strict=True, max_length=100)]
    current_building_1: Annotated[str, Field(strict=True, max_length=100)]
    current_building_2: Annotated[str, Field(strict=True, max_length=100)]
    current_building_3: Annotated[str, Field(strict=True, max_length=100)]
    current_room_1: Annotated[str, Field(strict=True, max_length=100)]
    current_room_2: Annotated[str, Field(strict=True, max_length=100)]
    host_building_1: Annotated[str, Field(strict=True, max_length=100)]
    host_building_2: Annotated[str, Field(strict=True, max_length=100)]
    host_building_3: Annotated[str, Field(strict=True, max_length=100)]
    host_room_1: Annotated[str, Field(strict=True, max_length=100)]
    host_room_2: Annotated[str, Field(strict=True, max_length=100)]
    host_org_building_1: Annotated[str, Field(strict=True, max_length=100)]
    host_org_building_2: Annotated[str, Field(strict=True, max_length=100)]
    host_org_building_3: Annotated[str, Field(strict=True, max_length=100)]
    host_org_room_1: Annotated[str, Field(strict=True, max_length=100)]
    host_org_room_2: Annotated[str, Field(strict=True, max_length=100)]

    @model_validator(mode='before')
    @classmethod
    def pad_fields(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Дополняет все строковые поля пробелами до максимальной длины."""
        if not isinstance(data, dict):
            return data

        # Получаем аннотации полей модели
        for field_name, field_info in cls.model_fields.items():
            if field_name in data and isinstance(data[field_name], str):
                # Ищем max_length в FieldInfo
                if field_info.metadata:
                    for metadata in field_info.metadata:
                        if hasattr(metadata, 'max_length'):
                            if metadata.max_length is not None:
                                # Дополняем пробелами до указанной длины
                                if metadata.max_length >= 100:
                                    data[field_name] = f"~{data[field_name]}~"
                                else:
                                    data[field_name] = data[field_name].ljust(metadata.max_length)
                                break

        return data