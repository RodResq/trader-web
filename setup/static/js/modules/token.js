/**
 * Retrieves the CSRF token from cookies
 * @param {string} name - Name of the cookie (defaults to 'csrftoken')
 * @returns {string|null} The CSRF token or null if not found
 */
export function getCookie(name = 'csrftoken') {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Adds CSRF token to fetch options for Django
 * @param {Object} options - Fetch options object
 * @returns {Object} Updated fetch options with CSRF token
 */
export function addCSRFToken(options = {}) {
    const csrfToken = getCookie();
    
    // If csrfToken exists, add it to headers
    if (csrfToken) {
        options.headers = {
            ...options.headers,
            'X-CSRFToken': csrfToken
        };
    }
    
    return options;
}