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
                                <h5 class="card-title">${uniqueTournament.name}</h5>
                                <p class="card-subtitle">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                <p class="card-text"><small class="text-muted">Last Playing 31/01/2025</small></p>
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