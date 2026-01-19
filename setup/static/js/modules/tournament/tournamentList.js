import { showNotification } from "../notifications.js";
import { apiClient } from "../shared/apiClient.js";
import { convertTimestampToDate } from "../shared/convertTimestampDate.js";
import { formatDate } from '../shared/formatDate.js'

export async function setupTournamentList() {
    let currentPage = 0;
    let isLoading = false;
    let hasNextPage = true;

    try {
        const page = 1;
        const size = 100
        const url = `/unique-tournaments?page=${page}&size=${size}`;
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
                                    <div class="card-subtitle">
                                        <span>Country: </span>${uniqueTournament.countryName}<br>
                                        <span>Tem Grupos: </span>${uniqueTournament.hasGroups}<br>
                                        <span>Tem Rounds: </span>${uniqueTournament.hasRounds}<br>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="card-text text-muted">${uniqueTournament.startDateTimestamp}</small>
                                        <small class="card-text text-muted">${uniqueTournament.endDateTimestamp}</small>
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
