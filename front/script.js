// Prevent unauthorized access
if (!localStorage.getItem("token") && !localStorage.getItem("guest")) {
    window.location.href = "login.html";
}

function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    return payload.id; // Assuming `id` is stored in the JWT
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
        alert("Unauthorized or invalid token. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    return response.json();
}

function logout() {
    localStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "login.html";
}