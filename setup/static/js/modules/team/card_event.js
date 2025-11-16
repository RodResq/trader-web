import { setupPrioridadeEvento } from './prioridade_evento.js';
import { showNotification } from '../notifications.js';

let teamId = '';

export function setupCardEventTeam() {
    const scrollContainer = document.getElementById('teamsScrollContainer');
    const teamsTableBody = document.getElementById('teamsTableBody');
    
    if (!scrollContainer || !teamsTableBody) {
        console.warn('Elementos scrollContainer ou teamsTableBody não encontrados');
        return;
    }

    teamsTableBody.addEventListener('click', async function(event) {
        const row = event.target.closest('.tr-clubes');

        if (!row) {
            console.log('Clique não foi em uma linha válida');
            return;
        }

        teamId = row.getAttribute('data-team-id');

        if (!teamId) {
            showNotification('ID do time não encontrado', 'danger');
            return;
        }

        row.style.cursor = 'pointer';

        await carregarEventosTime(teamId);

    });
    
}


export async function carregarEventosTime(idTeam, tentativas = 3) {

    for (let i = 1; i <= tentativas; i++) {

        try {
            const url = `api/v1/team/${idTeam}/events`;
            console.log(`Tentatica ${i}/${tentativas}: Buscando Eventos ...`);

            const controller = new AbortController();
            const timoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timoutId);
    
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`); 
            }
    
            const data = await response.json();
            
            if (data.success) {
                await renderizarCardTeam(idTeam)
                renderizarCardEventoTeam(data.data);
                return;
            } else {
                console.error('Resposta API sem sucesso:', data);
                showNotification(`Falha ao recuperar dados de evento do time`, 'danger');
            }
    
        } catch(error) {
            console.warn(`Tentaiva ${i} falhou: `, error.message);

            if (i == tentativas) {
                console.error('Todas as tentativas falharam');
                showNotification(`Erro ao carregar eventos após ${tentativas} tentativas`, 'danger');
            } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } 
    }

}


export async function renderizarCardTeam(idTeam) {
    const teamName = document.getElementById('card-team-name');
    const teamIcon = document.getElementById('card-team-img');

    if (!teamName || !teamIcon) {
        console.warn('Elementos card-team-name ou card-team-img não encontrados');
        return;
    }

    try {
        const url = `api/v1/team/${idTeam}`;
        console.log(`Buscando dados do time ${idTeam}...`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`); 
        }
        
        const data = await response.json();

        if (data.success) {
            teamName.textContent = data.team.name
            teamIcon.setAttribute('src', `data:imagem/png;base64,${data.team.icon}`);
            teamIcon.setAttribute('alt', data.team.name);
        } else {
            console.error('Resposta API sem sucesso:', data);
            showNotification(`Falha ao recuperar dados do time`, 'danger');
        }
    } catch(error) {
        console.error('Erro ao carregar dados do time:', error);
        showNotification(`Erro ao carregar dados do time: ${error.message}`, 'danger');
    }
    
}


export function renderizarCardEventoTeam(dados) {
    const tournament = document.querySelector('.tournament');

    if (!tournament) {
        console.warn('Elemento .tournament não encontrado');
        return;
    }

    tournament.innerHTML = '';

    if (dados.length > 0) {
        dados.forEach(async event => {
            const cardDiv = document.createElement('div');
            const styleCard = Number(event.tournament.priority) === 0 ? 
                'border-left-width: 15px; border-color: #198754;border-top: none;border-bottom: none;border-right: none;': 
                'None';

            cardDiv.className = `card shadow h-100 mb-3`;
            cardDiv.style = styleCard;

            const dataFormatada = event.tournament.startTimestamp ?
                timestampParaData(event.tournament.startTimestamp): 
                'Data não informada';

            const timeConfronto = (idTeam) => {
                if (idTeam == event.awayTeam.id) {
                    return event.homeTeam.name;
                } 
                return event.awayTeam.name;
            }

            const iconeTimeConfronto = (idTeam) => {
                if (idTeam == event.awayTeam.id) {
                    return event.homeTeam.icon;
                } 
                return event.awayTeam.icon;
            }

            cardDiv.innerHTML = `
                <div class="card">
                    <div class="row g-0">
                        <div class="row col-sm-1 m-2">
                            <img class="align-self-center h-50 unique-tournament-logo mb-3img-fluid" 
                                src="data:imagem/png;base64,${event.tournament.uniqueTournament.icon}" 
                                alt=${event.tournament.name}>
                        </div>
                        <div class="col-sm-2 border-end">
                            <div class="card-body">
                                <h6 class="card-title">${event.tournament.name}</h6>
                                <p class="card-text">
                                    <span class="text-xs text-gray-600 mt-2">
                                        <i class="fas fa-calendar-alt"></i> ${dataFormatada}
                                    </span>
                                </p>
                                <div class="col-sm-2 align-content-center">
                                    <input class="form-check-input checkPrioridadeEvento" type="checkbox" value="${event.idEvent}" id="flexCheckDefault">
                                    <label class="form-check-label" for="flexCheckDefault">
                                    Prioridade:
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center gap-2">
                                    <img class="unique-tournament-logo img-fluid" 
                                        style="max-width: 30px; height: 30px; object-fit: contain;"
                                        src="data:imagem/png;base64,${iconeTimeConfronto(teamId)}" 
                                        alt=${timeConfronto(teamId)}>
                                    <h6 class="card-title">${timeConfronto(teamId)}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            tournament.append(cardDiv);
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
