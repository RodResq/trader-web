import { showNotification } from "../notifications.js";
import { apiClient } from "../shared/apiClient.js";

export async function setupTournamentList() {
    let currentPage = 0;
    let isLoading = false;
    let hasNextPage = true;

    const tournamentsTableBody = document.getElementById('tournamentsTableBody');

    if (!tournamentsTableBody) return;

    try {
        const page = 1;
        const url = `api/v1/tournaments?page=${page}`;
        const response = await apiClient.get(url);

        await renderizarCardsTournaments(response.data);

    } catch (error) {
        console.error('Error ao recuperar tournament');
        showNotification('Error ao recuperar tournaments', 'danger');
    }

}

async function renderizarCardsTournaments(data) {
    console.log(data);
}