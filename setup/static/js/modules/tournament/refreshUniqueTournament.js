import { apiClient } from "../shared/apiClient.js";
import { showNotification } from "../notifications.js";

export function initRefresUniqueTournament() {
    const btnRefresh = document.querySelectorAll(".refreshUniqueTournamentBtn");
    
    if (!btnRefresh) return;

    btnRefresh.forEach(btn => {
        btn.addEventListener("click", async function(e) {
            e.preventDefault();

            const idUniqueTournament= this.getAttribute('data-unique-id');
            if (!idUniqueTournament) return;

            const url = `/unique-tournaments/${idUniqueTournament}`

            try {
                const dados = await apiClient.get(url);
                atualizarCard(dados);
            } catch(error) {
                showNotification('Erro ao recuperar informacoes do torneio.', 'danger');
            }
        })
    })

}

function atualizarCard(dados) {
    const dataCard = document.getElementById(`data-card-${dados.uniqueTournament.id}`);
    const newContent = `
        <div class="">
            <div class="card-subtitle">
                <span>Country: </span>${dados.uniqueTournament.category.name}<br>
                <span>Tem Grupos: </span>${dados.uniqueTournament.hasGroups}<br>
                <span>Tem Rounds: </span>${dados.uniqueTournament.hasRounds}<br>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <small class="card-text text-muted">${formatDate(convertTimestampToDate(dados.uniqueTournament.startDateTimestamp))}</small>
                <small class="card-text text-muted">${formatDate(convertTimestampToDate(dados.uniqueTournament.endDateTimestamp))}</small>
            </div>
        </div>
    `;

    dataCard.innerHTML = newContent;
    console.log('Data card recuperado: ', dataCard);   
}


function convertTimestampToDate(timestamp) {
    return new Date(timestamp * 1000);
}

function formatDate(date, locale = 'pt-BR') {
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}
