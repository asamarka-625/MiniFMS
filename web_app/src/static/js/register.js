const API_BASE = '/api/v1/auth';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');
    const passwordMatch = document.querySelector('.password-match');

    const verifyForm = document.getElementById('verifyForm');
    const verificationCodeInput = document.getElementById('verificationCode');
    const verificationEmailSpan = document.getElementById('verificationEmail');
    const countdownSpan = document.getElementById('countdown');
    const resendCodeBtn = document.getElementById('resendCode');
    const backToRegistrationLink = document.getElementById('backToRegistration');

    let verificationTimer = null;
    let verificationEmail = '';
    let registrationData = {};

    function checkPasswordStrength(password) {
        let strength = 0;
        const bars = document.querySelector('.strength-bar');

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const width = Math.min(strength * 20, 100);
        bars.style.width = width + '%';

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

    function showVerificationStep(email) {
        verificationEmail = email;

        registrationData = {
            username: document.getElementById('username').value,
            email: email,
            password: passwordInput.value
        };
        sessionStorage.setItem('registrationData', JSON.stringify({email: email}));

        verificationEmailSpan.textContent = email;

        registerForm.classList.remove('active');
        verifyForm.classList.add('active');

        startCountdown();

        setTimeout(() => {
            verificationCodeInput.focus();
        }, 300);
    }

    function showRegistrationStep() {
        const savedData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
        if (savedData) {
            emailInput.value = savedData.email;
        }

        verifyForm.classList.remove('active');
        registerForm.classList.add('active');

        clearInterval(verificationTimer);
    }

    function startCountdown() {
        let timeLeft = 60;
        resendCodeBtn.disabled = true;

        verificationTimer = setInterval(() => {
            timeLeft--;
            countdownSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(verificationTimer);
                resendCodeBtn.disabled = false;
                countdownSpan.textContent = '0';
            }
        }, 1000);
    }

    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
    });

    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    document.getElementById("username").addEventListener('input', function() {
        const value = this.value;
        const pattern = /^[A-Za-z0-9_]+$/;

        if (!pattern.test(value) && value !== '') {
            this.setCustomValidity('Только латинские буквы, цифры и подчеркивание');
        } else {
            this.setCustomValidity('');
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!registerForm.checkValidity()) {
            const invalidFields = registerForm.querySelectorAll(':invalid');
            invalidFields.forEach(field => {
                field.classList.add('invalid');
            });
            return;
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Пароли не совпадают!');
            return;
        }

        if (!document.getElementById('terms').checked) {
            alert('Необходимо согласиться с условиями использования');
            return;
        }

        const email = emailInput.value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            alert('Введите корректный email адрес');
            emailInput.focus();
            return;
        }

        const formData = {
            username: document.getElementById('username').value,
            email: email,
            password: passwordInput.value
        };

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.unique) {
                    showVerificationStep(formData.email);
                } else {
                    alert(data.message);
                }

            } else {
                alert(data.message || 'Ошибка при отправке данных');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке данных. Попробуйте позже.');
        }
    });

    async function handleVerifyFormSubmit() {
        const code = verificationCodeInput.value.trim();

        if (!/^\d{6}$/.test(code)) {
            alert('Код должен состоять из 6 цифр');
            verificationCodeInput.focus();
            return;
        }

        const verifyData = {
            email: verificationEmail,
            code: code
        };

        try {
            const response = await fetch(`${API_BASE}/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verifyData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Регистрация успешно завершена! Теперь вы можете войти в систему.');

                sessionStorage.removeItem('registrationData');

                window.location.href = '/login';
            } else {
                alert(data.detail || 'Неверный код подтверждения');
                verificationCodeInput.focus();
                verificationCodeInput.select();
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при проверке кода. Попробуйте позже.');
        }
    }

    resendCodeBtn.addEventListener('click', async function() {
        if (!verificationEmail) return;

        this.disabled = true;
        this.textContent = 'Отправка...';

        try {
            const response = await fetch(`${API_BASE}/resend-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: verificationEmail })
            });

            const data = await response.json();

            if (response.ok) {
                this.disabled = true;
                sessionStorage.setItem('registrationTime', Date.now().toString());

                alert('Новый код подтверждения отправлен на ваш email');

                clearInterval(verificationTimer);
                startCountdown(60);

                verificationCodeInput.value = '';
                verificationCodeInput.focus();
            } else {
                alert(data.detail || 'Ошибка при отправке кода');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке кода. Попробуйте позже.');
        } finally {
            this.textContent = 'Отправить код повторно';
        }
    });

    backToRegistrationLink.addEventListener('click', function(e) {
        e.preventDefault();
        showRegistrationStep();
    });

    verificationCodeInput.addEventListener('input', async function(e) {
        const code = this.value.replace(/\D/g, '');
        this.value = code.slice(0, 6);

        if (code.length === 6) {
            await handleVerifyFormSubmit();
        }
    });

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email && !emailPattern.test(email)) {
            this.setCustomValidity('Введите корректный email адрес');
            this.reportValidity();
        } else {
            this.setCustomValidity('');
        }
    });

    function restoreFormState() {
        const savedData = sessionStorage.getItem('registrationData');
        if (savedData) {
            const data = JSON.parse(savedData);

            const registrationTime = sessionStorage.getItem('registrationTime');
            const now = Date.now();

            if (registrationTime && (now - parseInt(registrationTime)) < 10 * 60 * 1000) {
                verificationEmail = data.email;
                verificationEmailSpan.textContent = data.email;
                verifyForm.classList.add('active');
                registerForm.classList.remove('active');

                const timePassed = Math.floor((now - parseInt(registrationTime)) / 1000);
                const timeLeft = Math.max(0, 60 - timePassed);

                if (timeLeft > 0) {
                    countdownSpan.textContent = timeLeft;
                    startCountdownWith(timeLeft);
                } else {
                    resendCodeBtn.disabled = false;
                }
            } else {
                sessionStorage.removeItem('registrationData');
                sessionStorage.removeItem('registrationTime');
            }
        }
    }

    function startCountdownWith(initialTime) {
        let timeLeft = initialTime;
        resendCodeBtn.disabled = true;

        verificationTimer = setInterval(() => {
            timeLeft--;
            countdownSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(verificationTimer);
                resendCodeBtn.disabled = false;
                countdownSpan.textContent = '0';
            }
        }, 1000);
    }

    registerForm.addEventListener('submit', function() {
        sessionStorage.setItem('registrationTime', Date.now().toString());
    });

    restoreFormState();
});