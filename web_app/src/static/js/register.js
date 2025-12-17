document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');
    const passwordMatch = document.querySelector('.password-match');

    // Проверка надежности пароля
    function checkPasswordStrength(password) {
        let strength = 0;
        const bars = document.querySelector('.strength-bar');

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Обновляем индикатор
        const width = Math.min(strength * 20, 100);
        bars.style.width = width + '%';

        // Обновляем текст
        let strengthLevel = 'слабый';
        let color = '#f56565';

        if (strength >= 4) {
            strengthLevel = 'сильный';
            color = '#38a169';
        } else if (strength >= 2) {
            strengthLevel = 'средний';
            color = '#d69e2e';
        }

        bars.style.backgroundColor = color;
        strengthText.textContent = strengthLevel;
        strengthText.style.color = color;
    }

    // Проверка совпадения паролей
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

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

    // Обработчики событий
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
    });

    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    // Отправка формы
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Валидация формы
        if (!registerForm.checkValidity()) {
            // Показываем сообщения об ошибках
            const invalidFields = registerForm.querySelectorAll(':invalid');
            invalidFields.forEach(field => {
                field.classList.add('invalid');
            });
            return;
        }

        // Проверка совпадения паролей
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Пароли не совпадают!');
            return;
        }

        // Проверка согласия с условиями
        if (!document.getElementById('terms').checked) {
            alert('Необходимо согласиться с условиями использования');
            return;
        }

        // Собираем данные формы
        const formData = {
            username: document.getElementById('username').value,
            password: passwordInput.value
        };

        // Показываем состояние загрузки
        const submitBtn = registerForm.querySelector('.btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        try {
            // Отправляем запрос на сервер
            const response = await fetch('/api/v1/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Успешная регистрация
                alert('Регистрация успешно завершена!');
                // Перенаправляем на страницу входа
                window.location.href = '/login';
            } else {
                // Ошибка от сервера
                alert(data.detail || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации. Попробуйте позже.');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Валидация имени пользователя
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('input', function() {
        const value = this.value;
        const pattern = /^[A-Za-z0-9_]+$/;

        if (!pattern.test(value) && value !== '') {
            this.setCustomValidity('Только латинские буквы, цифры и подчеркивание');
        } else {
            this.setCustomValidity('');
        }
    });
});