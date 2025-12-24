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

const API_BASE_URL = '/api/v1';
const DOCUMENTS_PER_PAGE = 10;

let currentPage = 1;
let totalDocuments = 0;
let documents = [];
let documentToDelete = null;

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
            </td>
        `;
        tbody.appendChild(emptyRow);
        return;
    }

    const startIndex = (currentPage - 1) * DOCUMENTS_PER_PAGE;

    documents.forEach((doc, index) => {
        const row = document.createElement('tr');

        let created_at = 'не задано';
        if (doc.created_at) {
            const date = new Date(doc.created_at);
            if (!isNaN(date)) {
                created_at = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        let updated_at = 'не задано';
        if (doc.updated_at) {
            const date = new Date(doc.updated_at);
            if (!isNaN(date)) {
                updated_at = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        const editUrl = `/document/edit/${doc._id}`;
        const pdfUrl = `/static/documents/pdf/${doc.uuid}.pdf`;

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>
                <strong>${doc._id}</strong>
            </td>
            <td>${created_at}</td>
            <td>${updated_at}</td>
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

function updatePagination() {
    const totalPages = Math.ceil(totalDocuments / DOCUMENTS_PER_PAGE);

    document.getElementById('totalPages').textContent = totalPages || 1;
    document.getElementById('currentPage').textContent = currentPage;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const newPage = currentPage + direction;
    const totalPages = Math.ceil(totalDocuments / DOCUMENTS_PER_PAGE);

    if (newPage < 1 || newPage > totalPages) return;

    currentPage = newPage;
    loadDocuments();
}

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

function closeModal() {
    documentToDelete = null;

    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function confirmAction() {
    if (!documentToDelete) {
        closeModal();
        return;
    }

    try {
        const result = await deleteDocument(documentToDelete);

        if (result.success) {
            alert('Документ успешно удален');

            if (documents.length === 1 && currentPage > 1) {
                currentPage--;
            }

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

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
    }
}

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

function setupEventListeners() {
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('confirmModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

function refreshDocuments() {
    currentPage = 1;
    loadDocuments();
}

window.changePage = changePage;
window.showDeleteModal = showDeleteModal;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
window.refreshDocuments = refreshDocuments;