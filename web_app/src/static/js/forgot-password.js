const API_BASE = '/api/v1/auth';

document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetPasswordForm');
    const resetEmailInput = document.getElementById('resetEmail');
    const resetSuccessDiv = document.getElementById('resetSuccess');
    const sentEmailSpan = document.getElementById('sentEmail');
    const resendRequestBtn = document.getElementById('resendRequest');
    const backToLoginLinks = document.querySelectorAll('a[href="/login"]');

    // Обработка отправки формы восстановления пароля
    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = resetEmailInput.value.trim();

        // Валидация email
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            alert('Введите корректный email адрес');
            resetEmailInput.focus();
            return;
        }

        // Блокируем кнопку отправки
        const submitBtn = resetForm.querySelector('.btn');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Отправка...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
                // Показываем сообщение об успехе
                sentEmailSpan.textContent = email;
                resetForm.classList.remove('active');
                resetSuccessDiv.classList.add('active');

                // Сохраняем email в sessionStorage для возможности повторной отправки
                sessionStorage.setItem('resetEmail', email);
                sessionStorage.setItem('resetRequestTime', Date.now().toString());
            } else {
                alert(data.detail || 'Ошибка при отправке запроса на восстановление');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Произошла ошибка при отправке запроса. Проверьте подключение к интернету.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Повторная отправка запроса
    resendRequestBtn.addEventListener('click', async function() {
        const email = sessionStorage.getItem('resetEmail');
        const requestTime = sessionStorage.getItem('resetRequestTime');

        if (!email) {
            alert('Ошибка: email не найден. Заполните форму заново.');
            resetSuccessDiv.classList.remove('active');
            resetForm.classList.add('active');
            return;
        }

        // Проверяем время между запросами (минимум 1 минута)
        if (requestTime) {
            const timePassed = Date.now() - parseInt(requestTime);
            if (timePassed < 60000) { // 60 секунд
                const secondsLeft = Math.ceil((60000 - timePassed) / 1000);
                alert(`Повторный запрос можно отправить через ${secondsLeft} секунд`);
                return;
            }
        }

        this.innerHTML = '<span class="loading-spinner"></span> Отправка...';
        this.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Новые инструкции отправлены на ваш email');
                sessionStorage.setItem('resetRequestTime', Date.now().toString());
            } else {
                alert(data.detail || 'Ошибка при повторной отправке');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке запроса');
        } finally {
            this.textContent = 'Отправить повторно';
            this.disabled = false;
        }
    });

    // Валидация email при потере фокуса
    resetEmailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email && !emailPattern.test(email)) {
            this.setCustomValidity('Введите корректный email адрес');
            this.reportValidity();
        } else {
            this.setCustomValidity('');
        }
    });

    // Обработка ссылок "Вернуться к входу"
    backToLoginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/login';
        });
    });

    // Автофокус на поле email
    resetEmailInput.focus();
});