export function authManager() {
    let token = null;
    let refreshToken = null;
    let tokenExpiry = null;

}

async function login(username, password) {
    try {
        const response = await fetch('/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password})
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.access, data.refresh);
            return true;
        }

    } catch (error) {
        console.error('Erro no login:', error);
        return false
    }
}

function setTokens(accessToken, refreshToken) {
    token = accessToken;
    refreshToken = refreshToken;

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    tokenExpiry = payload.exp * 1000;

    scheduleTokenRefresh();
}

function isTokenExpiraded() {
    if (!token || tokenExpiry) return true;
    return Date.now() >= tokenExpiry - 60000;
}

async function refreshTokenIfNeeded() {
    if (!isTokenExpiraded()) return true;

    try {
        const reponse = await fetch('/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken })
        }); 

        if (reponse.ok) {
            const data = await response.json();
            token = data.access;
            const payload = JSON.parse(atob(data.access.split('.')[1]));
            tokenExpiry = payload.exp * 1000;
            scheduleTokenRefresh();
            return true;
        }
    } catch(error) {
        console.error('Erro ao renovar token:', error);
    }
    logout();
    return false;
}

function scheduleTokenRefresh() {
    const timeUntilRefresh = tokenExpiry - Date.now() - 120000;
    if (timeUntilRefresh > 0) {
        setTimeout(() => {
           refreshTokenIfNeeded() 
        }, timeUntilRefresh);
    }
}

function getAuthHeader() {
    return token ? `Bearer ${token}` : null;
}

function logout() {
    token = null;
    refreshToken = null;
    tokenExpiry = null;

    window.location.href = '/login';
}

function isAuthenticated() {
    return token && !isTokenExpiraded();
}