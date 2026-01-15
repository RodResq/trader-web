import { showNotification } from "../notifications.js";
import { apiClient } from "../shared/apiClient.js";

export async function setupTournamentList() {
    let currentPage = 0;
    let isLoading = false;
    let hasNextPage = true;

    try {
        const page = 1;
        const size = 100
        const url = `/tournaments?page=${page}&size=${size}`;
        const response = await apiClient.get(url);

        await renderizarCardsTournaments(response.content);

    } catch (error) {
        console.error('Error ao recuperar tournament');
        showNotification('Error ao recuperar tournaments', 'danger');
    }

}

async function renderizarCardsTournaments(uniqueTournaments) {
     const tournamentsTableBody = document.getElementById('tournamentsTableBody');

    if (!tournamentsTableBody) return;

    if (uniqueTournaments.length > 0) {
        let uniqueTournamentsList = ''; 

        uniqueTournaments.forEach(uniqueTournament => {

            uniqueTournamentsList += `
                <div class="col-lg-4 col-md-6 col-sm-12">
                    <div class="card h-100">
                        <div class="row g-0 h-100">
                            <div class="col-md-4">
                            <img src="data:image/png;base64,${uniqueTournament.icon}" class="img-fluid rounded-start"  alt="Logo ${uniqueTournament.name}">
                            </div>
                            <div class="col-md-8">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title">${uniqueTournament.name}(${uniqueTournament.id})</h5>
                                    <button class="refreshUniqueTournamentBtn btn btn-sm btn-success" data-unique-id=${uniqueTournament.id} title="Atualizar">
                                        <i class="bi bi-arrow-repeat"></i>
                                    </button>
                                </div>
                                <div id="data-card-${uniqueTournament.id}">
                                    <p class="card-subtitle">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="card-text text-muted">Inicio 01/01/2026</small>
                                        <small class="card-text text-muted">Fim 31/12/2026</small>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            tournamentsTableBody.innerHTML = uniqueTournamentsList;
        });
    }

}
