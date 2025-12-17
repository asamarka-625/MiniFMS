const API_BASE_URL = "/api/v1/auth";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', document.getElementById('username').value);
    formData.append('password', document.getElementById('password').value);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            window.location.href = '/';

        } else {
            alert('Login failed!');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});