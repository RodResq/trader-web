export class ApiClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.defaultHearders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        this.timeout = 5000;
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET'});
    }

    async request(endpoint, options = {}) {
        const url = this._buildUrl(endpoint);
        const config = this._buildConfig(options);

        try {
            const response = await this._fetchWithTimeout(url, config);
            return await this._handleResponse(response)
        } catch(error) {
            this._logError(error);
            throw this._formatError(error);
        }
    }

    _buildUrl(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }

        return `${this.baseUrl}${endpoint}`;
    }

    _buildConfig(options) {
        return {
            method: options.methd || 'GET',
            headers: {
                ...this.defaultHearders,
                ...options.headers
            },
            ...(options.body && { body: options.body })
        };
    }

    async _fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = this.setTimout(() => controller.abort(), this.timeout);

        try {
            return await fetch(url, {
                ...config,
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeoutId)
        }
    }

    async _handleResponse(response) {
        let json;
        try {
            json = await response.json();
        } catch {
            throw new Error('Resposta invalida do servidor');
        }

        if (!response.ok) {
            const errorMessage = json.message || json.error || response.statusText;
            throw new Error(errorMessage);
        }

        return json;
    }

    
    _formatError(error) {
        if (error.name === 'AbortError') {
            return new Error('Tempo limite de requisição excedido');
        }

        if (error instanceof TypeError) {
            if (error.message.includes('fetch')) {
                return new Error('Erro de conexão com o servidor');
            }
        }

        return error;
    }


    _logError(endpoint, error) {
        console.error(`[API Error] ${endpoint}: `, {
            message: error.message,
            timestamp: new Date().toISOString(),
            endpoint
        });
    }

    setTimout(ms) {
        this.timeout = ms;
        return this;
    }

    setHeaders(headers) {
        this.defaultHearders = { ...this.defaultHearders, ...headers };
        return this;
    }
}