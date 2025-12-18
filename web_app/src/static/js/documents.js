document.addEventListener('DOMContentLoaded', async function() {
    try {
        await silentRefresh();

        await loadUserData();
        await loadDocuments();
        setupEventListeners();
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
});

// Конфигурация
const API_BASE_URL = '/api/v1';
const DOCUMENTS_PER_PAGE = 10;

// Состояние приложения
let currentPage = 1;
let totalDocuments = 0;
let documents = [];
let documentToDelete = null;

// Загрузка списка документов
async function loadDocuments() {
    try {
        showLoading(true);

        const skip = (currentPage - 1) * DOCUMENTS_PER_PAGE;
        const limit = DOCUMENTS_PER_PAGE;

        const response = await apiRequest(url=`${API_BASE_URL}/user/me/forms?skip=${skip}&limit=${limit}`, options={
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        documents = data.items || data.forms || data.documents || [];
        totalDocuments = data.total || data.count || 0;

        renderDocuments();
        updatePagination();

    } catch (error) {
        console.error('Ошибка загрузки документов:', error);
        showError('Не удалось загрузить список документов');
        documents = [];
        renderDocuments();
    } finally {
        showLoading(false);
    }
}

// Отображение документов в таблице
function renderDocuments() {
    const tbody = document.getElementById('documentsList');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (documents.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px;">
                <div style="color: #666; font-style: italic;">
                    📄 Нет доступных документов
                </div>
                <button onclick="location.href='/create'"
                        class="btn btn-primary"
                        style="margin-top: 15px;">
                    + Создать первый документ
                </button>
            </td>
        `;
        tbody.appendChild(emptyRow);
        return;
    }

    const startIndex = (currentPage - 1) * DOCUMENTS_PER_PAGE;

    documents.forEach((doc, index) => {
        const row = document.createElement('tr');

        // Форматирование даты
        let formattedDate = '--.--.----';
        if (doc.created_at) {
            const date = new Date(doc.created_at);
            if (!isNaN(date)) {
                formattedDate = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        // Определяем URL для редактирования и PDF
        const editUrl = `/document/edit/${doc._id}`;
        const pdfUrl = `${API_BASE_URL}/static/documents/pdf/${doc.uuid}.pdf`;

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>
                <strong>${doc._id}</strong>
            </td>
            <td>${formattedDate}</td>
            <td>
                <a href="${editUrl}" class="action-btn action-btn-edit" title="Редактировать документ">
                    ✏️ Редактировать
                </a>
            </td>
            <td>
                ${doc.has_pdf !== false ?
                    `<a href="${pdfUrl}" target="_blank" class="action-btn action-btn-view" title="Скачать PDF">
                        📄 Скачать PDF
                    </a>
                    <button onclick="showDeleteModal('${doc._id}')"
                            class="action-btn action-btn-delete"
                            title="Удалить документ"
                            style="margin-left: 5px;">
                        🗑️
                    </button>` :
                    '<span style="color: #999; font-style: italic;">PDF не создан</span>'
                }
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Обновление пагинации
function updatePagination() {
    const totalPages = Math.ceil(totalDocuments / DOCUMENTS_PER_PAGE);

    document.getElementById('totalPages').textContent = totalPages || 1;
    document.getElementById('currentPage').textContent = currentPage;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Смена страницы
function changePage(direction) {
    const newPage = currentPage + direction;
    const totalPages = Math.ceil(totalDocuments / DOCUMENTS_PER_PAGE);

    if (newPage < 1 || newPage > totalPages) return;

    currentPage = newPage;
    loadDocuments();
}

// Удаление документа
async function deleteDocument(documentId) {
    try {
        const response = await apiRequest(url=`${API_BASE_URL}/forms/${documentId}`, options={
            method: 'DELETE'
        });

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return {
                success: false,
                error: errorData.detail || 'Ошибка при удалении'
            };
        }
    } catch (error) {
        console.error('Ошибка удаления документа:', error);
        return {
            success: false,
            error: 'Сетевая ошибка при удалении'
        };
    }
}

// Показать модальное окно подтверждения удаления
function showDeleteModal(documentId) {
    documentToDelete = documentId;

    const messageElement = document.getElementById('confirmMessage');
    if (messageElement) {
        messageElement.textContent = `Вы уверены, что хотите удалить документ "${documentId}"?`;
    }

    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Закрыть модальное окно
function closeModal() {
    documentToDelete = null;

    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Подтверждение удаления
async function confirmAction() {
    if (!documentToDelete) {
        closeModal();
        return;
    }

    try {
        const result = await deleteDocument(documentToDelete);

        if (result.success) {
            // Успешное удаление
            alert('Документ успешно удален');

            // Если на текущей странице остался только этот документ и это не первая страница,
            // переходим на предыдущую страницу
            if (documents.length === 1 && currentPage > 1) {
                currentPage--;
            }

            // Перезагружаем список документов
            loadDocuments();
        } else {
            alert(`Ошибка удаления: ${result.error}`);
        }
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Произошла ошибка при удалении документа');
    } finally {
        closeModal();
    }
}

// Показать/скрыть индикатор загрузки
function showLoading(isLoading) {
    const tbody = document.getElementById('documentsList');
    if (!tbody) return;

    if (isLoading) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div style="color: #0a5c36; font-style: italic;">
                        ⏳ Загрузка документов...
                    </div>
                </td>
            </tr>
        `;

        // Блокируем кнопки пагинации во время загрузки
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
    }
}

// Показать сообщение об ошибке
function showError(message) {
    const tbody = document.getElementById('documentsList');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: #dc3545;">
                <div style="margin-bottom: 10px;">❌ ${message}</div>
                <button onclick="location.reload()" class="btn btn-secondary">
                    🔄 Обновить страницу
                </button>
            </td>
        </tr>
    `;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('confirmModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Обработка нажатия Escape для закрытия модального окна
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Функция для обновления списка (можно вызвать извне)
function refreshDocuments() {
    currentPage = 1;
    loadDocuments();
}

// Экспорт функций для глобального использования
window.changePage = changePage;
window.showDeleteModal = showDeleteModal;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
window.refreshDocuments = refreshDocuments;