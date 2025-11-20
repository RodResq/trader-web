
import { ApiClient } from '../api/apiClient.js';


export const apiClient = new ApiClient('api/v1');

export async function initApiClient() {
    console.log('ApliCLient inicializando');
    console.log('Base URL: ', apiClient.baseUrl);
    console.log('Timeout:', apiClient.timeout + 'ms');

    return apiClient;
}