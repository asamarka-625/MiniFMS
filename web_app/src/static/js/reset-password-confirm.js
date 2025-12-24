const API_BASE = '/api/v1/auth';

document.addEventListener('DOMContentLoaded', function() {
    const newPasswordForm = document.getElementById('newPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const resetTokenInput = document.getElementById('resetToken');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');
    const passwordMatch = document.querySelector('.password-match');

    // Получаем токен из URL, если он не передан в скрытом поле
    function getResetToken() {
        const tokenFromInput = resetTokenInput ? resetTokenInput.value : '';
        if (tokenFromInput) return tokenFromInput;

        // Пытаемся извлечь токен из URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token') || '';
    }

    // Функция проверки сложности пароля
    function checkPasswordStrength(password) {
        let strength = 0;

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const width = Math.min(strength * 20, 100);
        strengthBar.style.width = width + '%';

        let strengthLevel = 'слабый';
        let color = '#f56565';

        if (strength >= 4) {
            strengthLevel = 'сильный';
            color = '#38a169';
        } else if (strength >= 2) {
            strengthLevel = 'средний';
            color = '#d69e2e';
        }

        strengthBar.style.backgroundColor = color;
        strengthText.textContent = strengthLevel;
        strengthText.style.color = color;
    }

    // Функция проверки совпадения паролей
    function checkPasswordMatch() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmNewPasswordInput.value;

        if (!password || !confirmPassword) {
            passwordMatch.classList.remove('valid', 'invalid');
            passwordMatch.textContent = '';
            return;
        }

        if (password === confirmPassword) {
            passwordMatch.textContent = 'Пароли совпадают ✓';
            passwordMatch.classList.remove('invalid');
            passwordMatch.classList.add('valid');
        } else {
            passwordMatch.textContent = 'Пароли не совпадают ✗';
            passwordMatch.classList.remove('valid');
            passwordMatch.classList.add('invalid');
        }
    }

    // Слушатели событий для полей пароля
    newPasswordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
    });

    confirmNewPasswordInput.addEventListener('input', checkPasswordMatch);

    // Обработка отправки формы нового пароля
    newPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const token = getResetToken();
        if (!token) {
            alert('Ошибка: токен восстановления не найден. Перейдите по ссылке из письма.');
            window.location.href = '/reset-password';
            return;
        }

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmNewPasswordInput.value;

        // Валидация паролей
        if (newPassword.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            newPasswordInput.focus();
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Пароли не совпадают');
            confirmNewPasswordInput.focus();
            return;
        }

        // Проверка надежности пароля
        const strengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!strengthRegex.test(newPassword)) {
            const useWeak = confirm(
                'Ваш пароль может быть слабее рекомендуемого.\n' +
                'Рекомендуется использовать:\n' +
                '• Минимум 8 символов\n' +
                '• Заглавные буквы\n' +
                '• Цифры\n' +
                '• Специальные символы\n\n' +
                'Все равно использовать этот пароль?'
            );

            if (!useWeak) {
                newPasswordInput.focus();
                return;
            }
        }

        // Блокируем кнопку отправки
        const submitBtn = newPasswordForm.querySelector('.btn');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Установка...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/password-reset-confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Показываем сообщение об успехе
                showSuccessMessage();
            } else {
                handleResetError(data.detail || 'Ошибка при установке пароля');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Произошла ошибка при установке пароля. Проверьте подключение к интернету.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Функция показа сообщения об успехе
    function showSuccessMessage() {
        // Создаем модальное окно успеха
        const successModal = document.createElement('div');
        successModal.className = 'success-modal';
        successModal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">✅</div>
                <h3>Пароль успешно изменен!</h3>
                <p>Ваш пароль был успешно обновлен. Теперь вы можете войти в систему с новыми учетными данными.</p>
                <div class="modal-buttons">
                    <button id="goToLogin" class="btn btn-primary">Войти в систему</button>
                </div>
            </div>
        `;

        // Стили для модального окна
        const style = document.createElement('style');
        style.textContent = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                animation: slideUp 0.3s ease;
            }
            .modal-content .success-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                color: #38a169;
            }
            .modal-content h3 {
                color: #2d3748;
                margin-bottom: 1rem;
            }
            .modal-content p {
                color: #4a5568;
                margin-bottom: 1.5rem;
                line-height: 1.5;
            }
            .modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            .btn-primary {
                background: #4F46E5;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1rem;
            }
            .btn-primary:hover {
                background: #4338CA;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(successModal);

        // Обработчик кнопки входа
        document.getElementById('goToLogin').addEventListener('click', function() {
            window.location.href = '/login';
        });

        // Закрытие по клику вне модального окна
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                window.location.href = '/login';
            }
        });
    }

    // Обработка ошибок восстановления
    function handleResetError(errorDetail) {
        let errorMessage = 'Ошибка при установке пароля';
        let redirectUrl = '/reset-password';

        switch(errorDetail) {
            case 'Invalid or expired reset token':
            case 'Токен восстановления недействителен или истек':
                errorMessage = 'Ссылка для восстановления пароля недействительна или истекла. Запросите новую ссылку.';
                redirectUrl = '/reset-password';
                break;
            case 'Token already used':
                errorMessage = 'Эта ссылка уже была использована. Запросите новую ссылку для восстановления пароля.';
                redirectUrl = '/reset-password';
                break;
            case 'New password cannot be the same as old':
                errorMessage = 'Новый пароль не может совпадать с предыдущим. Придумайте другой пароль.';
                return; // Не перенаправляем, пользователь может исправить
            default:
                errorMessage = errorDetail || 'Ошибка при установке пароля';
        }

        alert(errorMessage);

        if (redirectUrl) {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        }
    }

    // Добавляем CSS для спиннера загрузки, если его нет
    if (!document.querySelector('style[data-loading-spinner]')) {
        const spinnerStyle = document.createElement('style');
        spinnerStyle.setAttribute('data-loading-spinner', 'true');
        spinnerStyle.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
                vertical-align: middle;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinnerStyle);
    }
});