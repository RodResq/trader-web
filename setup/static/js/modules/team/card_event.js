import { setupPrioridadeEvento } from './prioridade_evento.js';
import { showNotification } from '../notifications.js';

export function setupCardEventTeam() {
    const rows = document.querySelectorAll('.tr-clubes[data-team-id]');
    
    
    if (!rows) return;

    rows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', async function() {
            const teamId = this.getAttribute('data-team-id');
            if (!teamId) {
                console.error('ID do team não encontrado')
                return;
            }
            
            try {
                const url = `api/v1/team/${teamId}`
                await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    if (!response.ok) {
                       throw new Error(`Erro HTTP: ${response.status}`); 
                    }
                    return response.json();
                }).then(data => {
                    if (data.success) {
                        renderizarCardTeam(teamId)
                        renderizarCardEventoTeam(data.data);
                    } else {
                        showNotification(`Falha ao recuperar dados de evento do time`, 'danger');
                    }
                });

            } catch(error) {
                console.error('Erro:', error);
                this.disabled = false;
            } finally {

            }
        });
    });
}

export async function renderizarCardTeam(idTeam) {
    const teamName = document.getElementById('card-team-name');
    const teamIcon = document.getElementById('card-team-img')
    if (!teamName || !teamIcon) return;

    try {
        const url = `api/v1/team/recuperar?id_team=${idTeam}`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`); 
            }
            return response.json();
        }).then(data => {
            if (data.success) {
                teamName.textContent = data.team.name
                teamIcon.setAttribute('src', `data:imagem/png;base64,${data.team.icon}`);
                teamIcon.setAttribute('alt', data.team.name);
            } else {
                showNotification(`Falha ao recuperar dados do time`, 'danger');
            }
        })
    } catch(error) {
        console.error('Erro:', error);
        this.disabled = false;
    }
    
}

async function recuperarIconUniqueTournmanet(idUniqueTournament) {
    console.log(idUniqueTournament);
    try {
        const url = `api/v1/unique_tournament/icon?id_unique_tournament=${idUniqueTournament}`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`); 
            }
            return response.json();
        }).then(data => {
            if (data.success) {
                return data.uniqueTournament.icon;
            } else {
                showNotification(`Falha ao recuperar dados do evento`, 'danger');
            }
        })
    }catch {
        console.error('Erro:', error);
        this.disabled = false;
    }
}

export function renderizarCardEventoTeam(dados) {
    const tournament = document.querySelector('.tournament');

    if (!tournament) return;

    tournament.innerHTML = '';

    if (dados.length > 0) {
        dados.forEach(async event => {
            const cardDiv = document.createElement('div');
            const styleCard = Number(event.tournament.priority) === 0 ? 'border-left-width: 15px; border-color: #198754;border-top: none;border-bottom: none;border-right: none;': 'None';
            cardDiv.className = `card shadow h-100 mb-3`;
            cardDiv.style = styleCard;

            const dataFormatada = event.tournament.startTimestamp ?
                timestampParaData(event.tournament.startTimestamp): 
                'Data não informada';

            cardDiv.innerHTML = `
                <div class="card-body">
                    <div class="no-gutters">
                        <div class="row mr-2">
                            <div class="col-sm-1 mr-2">
                                <div class="row">
                                    <img class="unique-tournament-logo mb-3img-fluid"
                                        style="width: 90px;"
                                        alt= ${event.tournament.name}
                                        src=data:imagem/png;base64,${event.tournament.uniqueTournament.icon}>
                                </div>
                            </div>
                            <div class="col-sm-4 align-content-start">
                                <div class="h5 mb-0 font-weight-bold text-gray-800">
                                    ${event.tournament.name || 'Campeonato'}
                                </div>
                                <div class="text-xs text-gray-600 mt-2">
                                    <i class="fas fa-calendar-alt"></i> ${dataFormatada}
                                </div>
                            </div>
                            <div class="col-sm-2 align-content-center">
                                <input class="form-check-input checkPrioridadeEvento" type="checkbox" value="${event.idEvent}" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
                                    Prioridade:
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            tournament.append(cardDiv);
                //Incializa o check de proximo eventos prioritario
            setupPrioridadeEvento()
        })
    } else {
        tournament.innerHTML = `
            <div class="card border-left-secondary shadow h-100 mb-3">
                <div class="card-body text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-calendar-times fa-3x mb-3"></i>
                        <h5>Nenhum evento encontrado</h5>
                        <p class="text-sm">Não há eventos disponíveis no momento.</p>
                    </div>
                </div>
            </div>
        `;
    }


}


function timestampParaData(timestamp) {
    if (!timestamp || isNaN(Number(timestamp)) || Number(timestamp) <= 0) {
        return 'Data não informada';
    }

    let timestampNumero = Number(timestamp);

    if (timestampNumero.toString().length <= 10) {
        timestampNumero = timestampNumero * 1000;
    }
    const data = new Date(timestampNumero);


    return isNaN(data.getTime()) ? 'Data inválida': data.toLocaleDateString('pt-BR');

}