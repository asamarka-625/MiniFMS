// Текущая активная ячейка
let currentCell = null;
let currentFieldName = "";
let allCells = [];

const API_BASE_URL = "/api/v1/forms";

function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Список полей, которые нужно создать
const fieldConfigurations = [
    { id: 'surname-field', cellCount: 28, label: 'Фамилия' },
    { id: 'surname-latin-field', cellCount: 22, label: 'Фамилия (латинскими буквами)' },
    { id: 'name-field', cellCount: 28, label: 'Имя' },
    { id: 'name-latin-field', cellCount: 23, label: 'Имя (латинскими буквами)' },
    { id: 'patronymic-field', cellCount: 24, label: 'Отчество' },
    { id: 'patronymic-latin-field', cellCount: 22, label: 'Отчество (латинскими буквами)' },
    { id: 'citizenship-field', cellCount: 26, label: 'Гражданство' },
    { id: 'birth-day', cellCount: 2, label: 'День рождения' },
    { id: 'birth-month', cellCount: 2, label: 'Месяц рождения' },
    { id: 'birth-year', cellCount: 4, label: 'Год рождения' },
    { id: 'birth-place', cellCount: 25, label: 'Место рождения' },
    { id: 'birth-state', cellCount: 31, label: 'Место рождения (государство)' },
    { id: 'birth-city', cellCount: 31, label: 'Место рождения (город)' },
    { id: 'document-type', cellCount: 29, label: 'Тип документа' },
    { id: 'document-series', cellCount: 6, label: 'Серия документа' },
    { id: 'document-number', cellCount: 21, label: 'Номер документа' },
    { id: 'issue-day', cellCount: 2, label: 'День выдачи документа' },
    { id: 'issue-month', cellCount: 2, label: 'Месяц выдачи документа' },
    { id: 'issue-year', cellCount: 4, label: 'Год выдачи документа' },
    { id: 'expiry-day', cellCount: 2, label: 'День окончания срока документа' },
    { id: 'expiry-month', cellCount: 2, label: 'Месяц окончания срока документа' },
    { id: 'expiry-year', cellCount: 4, label: 'Год окончания срока документа' },
    { id: 'birth-act-number', cellCount: 21, label: 'Номер записи акта о рождении' },
    { id: 'birth-act-date', cellCount: 8, label: 'Дата записи акта о рождении' },
    { id: 'birth-act-body-line-1', cellCount: 31, label: 'Наименование уполномоченного органа Российско Федерации (строка 1)' },
    { id: 'birth-act-body-line-2', cellCount: 31, label: 'Наименование уполномоченного органа Российско Федерации (строка 2)' },
    { id: 'birth-act-body-line-3', cellCount: 31, label: 'Наименование уполномоченного органа Российско Федерации (строка 3)' },
    { id: 'document-right-series', cellCount: 6, label: 'Серия документа' },
    { id: 'document-right-number', cellCount: 21, label: 'Номер документа' },
    { id: 'right-issue-day', cellCount: 2, label: 'День выдачи документа' },
    { id: 'right-issue-month', cellCount: 2, label: 'Месяц выдачи документа' },
    { id: 'right-issue-year', cellCount: 4, label: 'Год выдачи документа' },
    { id: 'right-expiry-day', cellCount: 2, label: 'День окончания срока документа' },
    { id: 'right-expiry-month', cellCount: 2, label: 'Месяц окончания срока документа' },
    { id: 'right-expiry-year', cellCount: 4, label: 'Год окончания срока документа' },
    { id: 'phone-field', cellCount: 10, label: 'Телефон' },
    { id: 'profession-field', cellCount: 27, label: 'Профессия' },
    { id: 'entry-day', cellCount: 2, label: 'День въезда' },
    { id: 'entry-month', cellCount: 2, label: 'Месяц въезда' },
    { id: 'entry-year', cellCount: 4, label: 'Год въезда' },
    { id: 'stay-until-day', cellCount: 2, label: 'День окончания пребывания' },
    { id: 'stay-until-month', cellCount: 2, label: 'Месяц окончания пребывания' },
    { id: 'stay-until-year', cellCount: 4, label: 'Год окончания пребывания' },
    { id: 'migration-card-series', cellCount: 4, label: 'Серия миграционной карты' },
    { id: 'migration-card-number', cellCount: 13, label: 'Номер миграционной карты' },
    { id: 'representative-line-1', cellCount: 26, label: 'Сведения о представителях (строка 1)' },
    { id: 'representative-line-2', cellCount: 26, label: 'Сведения о представителях (строка 2)' },
    { id: 'representative-line-3', cellCount: 26, label: 'Сведения о представителях (строка 3)' },
    { id: 'representative-line-4', cellCount: 26, label: 'Сведения о представителях (строка 4)' },
    { id: 'representative-line-5', cellCount: 26, label: 'Сведения о представителях (строка 5)' },
    { id: 'prev-region', cellCount: 31, label: 'Субъект РФ, муниципальное образование' },
    { id: 'prev-city', cellCount: 31, label: 'Городское и сельское поселение' },
    { id: 'prev-area', cellCount: 31, label: 'Населенный пункт' },
    { id: 'prev-road', cellCount: 31, label: 'Элемент улично-дорожной сети' },
    { id: 'current-region', cellCount: 31, label: 'Субъект РФ, муниципальное образование' },
    { id: 'current-city', cellCount: 31, label: 'Городское и сельское поселение' },
    { id: 'current-area', cellCount: 31, label: 'Населенный пункт' },
    { id: 'current-road', cellCount: 31, label: 'Элемент улично-дорожной сети' },
    { id: 'permission-doc-line-1', cellCount: 22, label: 'Наименование и реквизиты документа (строка 1)' },
    { id: 'permission-doc-line-2', cellCount: 22, label: 'Наименование и реквизиты документа (строка 2)' },
    { id: 'permission-doc-line-3', cellCount: 22, label: 'Наименование и реквизиты документа (строка 3)' },
    { id: 'permission-doc-line-4', cellCount: 22, label: 'Наименование и реквизиты документа (строка 4)' },
    { id: 'permission-doc-line-5', cellCount: 22, label: 'Наименование и реквизиты документа (строка 5)' },
    { id: 'permission-doc-line-6', cellCount: 20, label: 'Наименование и реквизиты документа (строка 6)' },
    { id: 'actual-region', cellCount: 31, label: 'Субъект РФ, муниципальное образование (фактическое)' },
    { id: 'actual-city', cellCount: 31, label: 'Городское и сельское поселение' },
    { id: 'actual-area', cellCount: 31, label: 'Населенный пункт' },
    { id: 'actual-cadastral', cellCount: 20, label: 'Кадастровый номер земельного или лесного участка' },
    { id: 'live-day', cellCount: 2, label: 'Поставлен на учет до — число' },
    { id: 'live-month', cellCount: 2, label: 'Поставлен на учет до — месяц' },
    { id: 'live-year', cellCount: 4, label: 'Поставлен на учет до — год' },
    { id: 'host-surname', cellCount: 28, label: 'Фамилия' },
    { id: 'host-name', cellCount: 28, label: 'Имя' },
    { id: 'host-patronymic', cellCount: 23, label: 'Отчество (при наличии)' },
    { id: 'host-document-type', cellCount: 10, label: 'Тип документа' },
    { id: 'host-document-series', cellCount: 4, label: 'Серия документа' },
    { id: 'host-document-number', cellCount: 12, label: 'Номер документа' },
    { id: 'host-issue-day', cellCount: 2, label: 'День выдачи документа' },
    { id: 'host-issue-month', cellCount: 2, label: 'Месяц выдачи документа' },
    { id: 'host-issue-year', cellCount: 4, label: 'Год выдачи документа' },
    { id: 'host-expiry-day', cellCount: 2, label: 'День окончания срока документа' },
    { id: 'host-expiry-month', cellCount: 2, label: 'Месяц окончания срока документа' },
    { id: 'host-expiry-year', cellCount: 4, label: 'Год окончания срока документа' },
    { id: 'host-phone', cellCount: 10, label: 'Телефон' },
    { id: 'host-region', cellCount: 31, label: 'Субъект РФ, муниципальное образование' },
    { id: 'host-city', cellCount: 31, label: 'Городское и сельское поселение' },
    { id: 'host-area', cellCount: 31, label: 'Населенный пункт' },
    { id: 'host-road', cellCount: 31, label: 'Элемент улично-дорожной сети' },
    { id: 'host-name-org-line-1', cellCount: 26, label: 'Наименование организации (строка 1)' },
    { id: 'host-name-org-line-2', cellCount: 16, label: 'Наименование организации (строка 2)' },
    { id: 'host-org-inn', cellCount: 13, label: 'ИНН' },
    { id: 'host-org-region', cellCount: 31, label: 'Субъект РФ, муниципальное образование' },
    { id: 'host-org-city', cellCount: 31, label: 'Городское и сельское поселение' },
    { id: 'host-org-area', cellCount: 31, label: 'Населенный пункт' },
    { id: 'host-org-road', cellCount: 31, label: 'Элемент улично-дорожной сети' }
];

const inputConfigurations = [
     "prev-building-1",
     "prev-building-2",
     "prev-building-3",
     "prev-room-1",
     "prev-room-2",
     "current-building-1",
     "current-building-2",
     "current-building-3",
     "current-room-1",
     "current-room-2",
     "host-building-1",
     "host-building-2",
     "host-building-3",
     "host-room-1",
     "host-room-2",
     "host-org-building-1",
     "host-org-building-2",
     "host-org-building-3",
     "host-org-room-1",
     "host-org-room-2"
];

const forLocalStorage = [
    "current-region",
    "current-city",
    "current-area",
    "current-road",
    "permission-doc-line-1",
    "permission-doc-line-2",
    "permission-doc-line-3",
    "permission-doc-line-4",
    "permission-doc-line-5",
    "permission-doc-line-6",
    "actual-region",
    "actual-city",
    "actual-area",
    "actual-cadastral",
    "live-day",
    "live-month",
    "live-year",
    "host-surname",
    "host-name",
    "host-patronymic",
    "host-document-type",
    "host-document-series",
    "host-document-number",
    "host-issue-day",
    "host-issue-month",
    "host-issue-year",
    "host-expiry-day",
    "host-expiry-month",
    "host-expiry-year",
    "host-phone",
    "host-region",
    "host-city",
    "host-area",
    "host-road",
    "host-phone",
    "host-name-org-line-1",
    "host-name-org-line-2",
    "host-org-inn",
    "host-org-region",
    "host-org-city",
    "host-org-area",
    "host-org-road"
];

// Инициализация всех полей с ячейками
function initializeFields() {
    allCells = [];

    fieldConfigurations.forEach(config => {
        const field = document.getElementById(config.id);
        if (!field) return;

        // Очищаем поле
        field.innerHTML = '';

        // Создаем ячейки
        for (let i = 0; i < config.cellCount; i++) {
            const cell = document.createElement('span');
            cell.className = 'checkbox';
            cell.dataset.fieldId = config.id;
            cell.dataset.cellIndex = i;
            cell.dataset.fieldLabel = config.label;
            let content = '';
            if (forLocalStorage.includes(config.id)) {
                content = localStorage.getItem(`${config.id}-${i}`) || '';
                if (content) {
                    cell.classList.add('filled');
                }
            }
            cell.textContent = content;
            cell.tabIndex = -1; // Делаем фокусируемыми

            // Обработчик клика на ячейку
            cell.addEventListener('click', function(e) {
                e.stopPropagation();
                setActiveCell(this);
            });

            // Обработчик фокуса

            cell.addEventListener('focus', function() {
                setActiveCell(this);
            });

            field.appendChild(cell);
            allCells.push(cell);
        }
    });

    inputConfigurations.forEach(input_id => {
        const input = document.getElementById(input_id);
        if (!input) return;

        input.addEventListener('input', function(e) {
            if (e.target.value.trim() !== '') {
                e.target.classList.add('filled');
            } else {
                e.target.classList.remove('filled');
            }
        });
    });

    // Делаем первую ячейку фокусируемой
    if (allCells.length > 0) {
        allCells[0].tabIndex = 0;
    }
}

// Установка активной ячейки
function setActiveCell(cell) {
    // Снимаем выделение с предыдущей активной ячейки
    if (currentCell) {
        currentCell.classList.remove('active');
        currentCell.tabIndex = -1;
    }

    // Устанавливаем новую активную ячейку
    currentCell = cell;
    currentCell.classList.add('active');
    currentCell.tabIndex = 0;
    currentCell.focus();

    // Получаем информацию о поле
    currentFieldName = cell.dataset.fieldLabel || 'Неизвестное поле';
    const fieldId = cell.dataset.fieldId;
    const fieldConfig = fieldConfigurations.find(f => f.id === fieldId);

    // Обновляем информацию об активной ячейке
    document.getElementById('current-field-name').textContent = currentFieldName;
    document.getElementById('current-cell-index').textContent = `Ячейка ${parseInt(cell.dataset.cellIndex) + 1} из ${fieldConfig ? fieldConfig.cellCount : '?'}`;
    document.getElementById('current-cell-value').textContent = `Значение: "${cell.textContent}"`;

    // Обновляем стиль заполненной ячейки
    updateCellStyle(cell);
}

// Обновление стиля ячейки в зависимости от содержимого
function updateCellStyle(cell) {
    if (cell.textContent.trim() !== '') {
        cell.classList.add('filled');
    } else {
        cell.classList.remove('filled');
    }
}

// Получение индекса текущей ячейки в массиве всех ячеек
function getCurrentCellIndex() {
    return allCells.indexOf(currentCell);
}

// Переход к следующей ячейке
function goToNextCell() {
    if (!currentCell) return;

    const currentIndex = getCurrentCellIndex();
    if (currentIndex < allCells.length - 1) {
        setActiveCell(allCells[currentIndex + 1]);
    }
}

// Переход к предыдущей ячейке
function goToPreviousCell() {
    if (!currentCell) return;

    const currentIndex = getCurrentCellIndex();
    if (currentIndex > 0) {
        setActiveCell(allCells[currentIndex - 1]);
    }
}

// Обработка ввода с клавиатуры
function handleKeyInput(key) {
    if (!currentCell) return;

    // Если это буква, цифра или специальный символ
    if (key.length === 1) {
        const key_upper = key.toUpperCase();
        currentCell.textContent = key_upper;
        updateCellStyle(currentCell);
        document.getElementById('current-cell-value').textContent = `Значение: "${key_upper}"`;
        if (forLocalStorage.includes(currentCell.dataset.fieldId)) {
            localStorage.setItem(`${currentCell.dataset.fieldId}-${currentCell.dataset.cellIndex}`, key_upper);
        }
        // Автоматически переходим к следующей ячейке
        goToNextCell();
    }
}

// Обработка удаления с переходом к предыдущей ячейке
function handleBackspace() {
    if (!currentCell) return;

    // Запоминаем текущую ячейку
    const currentIndex = getCurrentCellIndex();

    // Если в текущей ячейке есть символ, удаляем его
    if (currentCell.textContent !== '') {
        currentCell.textContent = '';
        updateCellStyle(currentCell);
        document.getElementById('current-cell-value').textContent = 'Значение: ""';
    }
    // Если ячейка пустая, переходим к предыдущей
    else if (currentIndex > 0) {
        goToPreviousCell();

        // Удаляем символ в предыдущей ячейке
        if (currentCell.textContent !== '') {
            currentCell.textContent = '';
            updateCellStyle(currentCell);
            document.getElementById('current-cell-value').textContent = 'Значение: ""';
        }
    }
}

// Обработка удаления без перехода (Delete)
function handleDelete() {
    if (!currentCell) return;

    if (currentCell.textContent !== '') {
        currentCell.textContent = '';
        updateCellStyle(currentCell);
        document.getElementById('current-cell-value').textContent = 'Значение: ""';
    }
}

// Инициализация радио-кнопок и чекбоксов
function initializeOptionButtons() {
    // Радио-кнопки для пола
    const genderButtons = document.querySelectorAll('.checkbox.radio');
    genderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const field = this.dataset.field;
            const value = this.dataset.value;

            // Снимаем выделение со всех кнопок этой группы
            document.querySelectorAll(`.checkbox.radio[data-field="${field}"]`).forEach(btn => {
                btn.textContent = '';
                btn.classList.remove('filled');
            });

            // Выделяем текущую кнопку
            this.classList.add('filled');
            this.textContent = '✓';
        });
    });

    // Чекбоксы для цели въезда
    const purposeOptions = document.querySelectorAll('.checkbox.option');
    purposeOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('active');
            this.classList.toggle('filled');
            this.textContent = this.classList.contains('active') ? '✓' : '';
        });
    });
}

// Очистка формы
function clearForm() {
    // Очищаем все ячейки
    allCells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('active');
        cell.classList.remove('filled');
        cell.tabIndex = -1;
    });

    inputConfigurations.forEach(input_id => {
        const input = document.getElementById(input_id);
        if (!input) return;
        input.value = '';
        input.classList.remove('filled');
    });

    // Делаем первую ячейку фокусируемой
    if (allCells.length > 0) {
        allCells[0].tabIndex = 0;
    }

    // Очищаем радио-кнопки и чекбоксы
    document.querySelectorAll('.checkbox.radio, .checkbox.option').forEach(btn => {
        btn.textContent = '';
        btn.classList.remove('active');
        btn.classList.remove('filled');
    });

    // Сбрасываем активную ячейку
    currentCell = null;
    document.getElementById('current-field-name').textContent = 'Не выбрана';
    document.getElementById('current-cell-index').textContent = '-';
    document.getElementById('current-cell-value').textContent = 'Значение: -';
}

// Переход к первой ячейке
function focusFirstCell() {
    if (allCells.length > 0) {
        setActiveCell(allCells[0]);
    }
}

async function SubmitForm(e) {
    e.preventDefault()
    showLoadingOverlay();

    let data = {};
    fieldConfigurations.forEach(config => {
        const parent = document.getElementById(config.id);
        const name_field = config.id.replaceAll("-", "_");
        let value_field = '';

        if (parent) {
            const children = parent.children;
            Array.from(children).forEach(child => {
                value_field += child.textContent;
            });
        }
        data[name_field] = value_field;
    });
    inputConfigurations.forEach(input_id => {
        const input = document.getElementById(input_id);
        const name_field = input_id.replaceAll("-", "_");
        let value_field = '';

        if (input) {
            value_field = input.value;
        }
        data[name_field] = value_field;
    });

    data["gender_male"] = document.getElementById("gender-male").classList.contains('filled') ? true : false;
    data["gender_female"] = document.getElementById("gender-female").classList.contains('filled') ? true : false;
    data["resident_visa"] = document.getElementById("resident-visa").classList.contains('filled') ? true : false;
    data["resident_card"] = document.getElementById("resident-card").classList.contains('filled') ? true : false;
    data["resident_permit"] = document.getElementById("resident-permit").classList.contains('filled') ? true : false;
    data["resident_permit_educational"] = document.getElementById("resident-permit-educational").classList.contains('filled') ? true : false;
    data["target_official"] = document.getElementById("target-official").classList.contains('filled') ? true : false;
    data["target_tourism"] = document.getElementById("target-tourism").classList.contains('filled') ? true : false;
    data["target_business"] = document.getElementById("target-business").classList.contains('filled') ? true : false;
    data["target_study"] = document.getElementById("target-study").classList.contains('filled') ? true : false;
    data["target_work"] = document.getElementById("target-work").classList.contains('filled') ? true : false;
    data["target_private"] = document.getElementById("target-private").classList.contains('filled') ? true : false;
    data["target_transit"] = document.getElementById("target-transit").classList.contains('filled') ? true : false;
    data["target_humanitarian"] = document.getElementById("target-humanitarian").classList.contains('filled') ? true : false;
    data["target_other"] = document.getElementById("target-other").classList.contains('filled') ? true : false;
    data["room_living"] = document.getElementById("room-living").classList.contains('filled') ? true : false;
    data["room_other"] = document.getElementById("room-other").classList.contains('filled') ? true : false;
    data["room_organization"] = document.getElementById("room-organization").classList.contains('filled') ? true : false;
    data["person_organization"] = document.getElementById("person-organization").classList.contains('filled') ? true : false;
    data["person_individual"] = document.getElementById("person-individual").classList.contains('filled') ? true : false;

    try {
        const response = await apiRequest(url=`${API_BASE_URL}/create`, options={
            method: "POST",
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw Error("HTTP Error");
        }

        const answer = await response.json();

        hideLoadingOverlay();

        if (answer.file_name) {
            window.location.href = '/documents';
        } else {
            throw new Error('Имя файла не получено от сервера');
        }
    } catch (error) {
        hideLoadingOverlay();

        alert(`Ошибка: ${error.message}`);
        console.error('Ошибка при создании документа:', error);

        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await silentRefresh();
        await loadUserData();

        initializeFields();
        initializeOptionButtons();

        if (typeof loadDocumentData === 'function') {
            await loadDocumentData();
        }
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }

    // Обработчики кнопок
    document.getElementById('clear-form').addEventListener('click', clearForm);
    document.getElementById('focus-first').addEventListener('click', focusFirstCell);
    document.getElementById('create-form').addEventListener('click', SubmitForm);

    // Обработка физической клавиатуры
    document.addEventListener('keydown', function(e) {
        // Получаем активный элемент
        const activeElement = document.activeElement;

        if (inputConfigurations.includes(activeElement.id)) {
            return;
        }

        // Проверяем, что активный элемент - это ячейка формы
        if (!activeElement.classList.contains('checkbox') && currentCell) {
            currentCell.focus();
        }

        // Обработка клавиш
        switch(e.key) {
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    goToPreviousCell();
                } else {
                    goToNextCell();
                }
                break;

            case 'ArrowRight':
                e.preventDefault();
                goToNextCell();
                break;

            case 'ArrowLeft':
                e.preventDefault();
                goToPreviousCell();
                break;

            case 'Backspace':
                e.preventDefault();
                handleBackspace();
                break;

            case 'Delete':
                e.preventDefault();
                handleDelete();
                break;

            case 'Enter':
                e.preventDefault();
                goToNextCell();
                break;

            case ' ':
                e.preventDefault();
                handleKeyInput(' ');
                break;

            default:
                // Обработка ввода символов (буквы, цифры, символы)
                if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    handleKeyInput(e.key);
                }
                break;
        }
    });

    // Обработка клика вне ячеек
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.checkbox')) {
            if (!inputConfigurations.includes(e.target.id) && currentCell) {
                currentCell.focus();
            }
        }
    });

    // Фокусируем первую ячейку при загрузке
    setTimeout(focusFirstCell, 100);
});