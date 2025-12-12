# Внешние зависимости
from typing import Dict, List
import subprocess
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter
# Внутренние модули
from web_app.src.schemas import FormRequest
from web_app.src.core import config


# Получаем валидные ячейки, которые нужно заполнить данными
def get_valid_cells() -> None:
    result: Dict[int, List[str]] = {}

    wb = load_workbook(f"{config.INPUT_DIR}/{config.TEMPLATE_XLSX}")

    try:
        for sheet_index in range(len(wb.worksheets)):
            ws = wb.worksheets[sheet_index]
            merged_ranges = ws.merged_cells.ranges

            if not merged_ranges:
                continue

            if result.get(sheet_index) is None:
                result[sheet_index] = []

            sorted_ranges = sorted(merged_ranges, key=lambda x: (x.min_row, x.min_col))

            for merged_range in sorted_ranges:
                min_row = merged_range.min_row
                min_col = merged_range.min_col
                max_row = merged_range.max_row

                if max_row < config.FILTER_SETTINGS[sheet_index]["skip"]:
                    continue

                cell_value = ws.cell(row=min_row, column=min_col).value

                if cell_value is not None and str(cell_value).strip() != "":
                    continue

                min_col_letter = get_column_letter(min_col)
                excel_format = f"{min_col_letter}{min_row}"

                if config.FILTER_SETTINGS[sheet_index]["ignore"] is not None and \
                        excel_format in config.FILTER_SETTINGS[sheet_index]["ignore"]:
                    continue

                result[sheet_index].append(excel_format)

    except Exception as err:
        config.logger.error(f"Error in get valid cells: {err}")

    finally:
        if wb:
            wb.close()

    config.VALID_CELLS = result


# Генерируем файл xlsx с данными
def create_xlsx_from_data(data: FormRequest, output_name) -> None:

    data_dict = data.model_dump()
    all_words = []
    for key, value in data_dict.items:
        if key in config.TRANSFER_WORDS:
            continue
        all_words.append(value)

    all_words.append(data.surname_field)
    all_words.append(data.name_field)
    all_words.append(data.patronymic_field[:-1])
    all_words.append(data.citizenship_field + " ")
    all_words.append(data.birth_day)
    all_words.append(data.birth_month)
    all_words.append(data.birth_year)
    # пол М Ж
    all_words.append(data.document_type[:10])
    all_words.append(data.document_series)
    all_words.append(data.document_number[:10])
    all_words.append(data.issue_day)
    all_words.append(data.issue_month)
    all_words.append(data.issue_year)
    all_words.append(data.expiry_day)
    all_words.append(data.expiry_month)
    all_words.append(data.expiry_year)
    all_words.append(data.prev_region)
    all_words.append(data.prev_city)
    all_words.append(data.prev_area)
    all_words.append(data.prev_road)
    all_words.append(data.prev_building_1)
    all_words.append(data.prev_building_2)
    all_words.append(data.prev_building_3)
    all_words.append(data.prev_room_1)
    all_words.append(data.prev_room_2)
    all_words.append(data.actual_region)
    all_words.append(data.actual_city)
    all_words.append(data.actual_area)
    all_words.append(data.actual_cadastral)
    all_words.append(data.live_day)
    all_words.append(data.live_month)
    all_words.append(data.live_year)

    for word in config.TRANSFER_WORDS:
        all_words.append(data_dict[word])

    all_words.append(data.surname_field)
    all_words.append(data.name_field)
    all_words.append(data.patronymic_field[:-1])
    all_words.append(data.host_name_org_line_1[:17])
    all_words.append(data.host_org_inn[:-1])
    all_words.append(" " * 8)

    """
    wb = load_workbook(f"{config.INPUT_DIR}/{config.TEMPLATE_XLSX}")
    try:
        for sheet_index in range(len(wb.worksheets)):
            ws = wb.worksheets[sheet_index]

            if config.VALID_CELLS.get(sheet_index) is not None:
                for cell in config.VALID_CELLS[sheet_index]:
                    ws[cell] = "A"

        output_file = f"{config.OUTPUT_DIR}/{output_name}.xlsx"
        wb.save(output_file)

    except Exception as err:
        config.logger.error(f"Error in create xlsx: {err}")

    finally:
        if wb:
            wb.close()
    """


# Конвертируем xlsx в pdf
def exel_to_pdf_libreoffice() -> None:
    cmd = [
        "libreoffice",
        "--headless",
        "--convert-to", "pdf",
        "--outdir", config.OUTPUT_DIR,
        f"{config.INPUT_DIR}/{config.TEMPLATE_XLSX}"
    ]

    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        config.logger.info("Конвертация успешно завершена")


    except subprocess.CalledProcessError as err:
        config.logger.error(f"Ошибка конвертации: {err}")
        print(f"Stderr: {err}")

    except Exception as err:
        config.logger.error(f"Неизвестная ошибка: {err}")