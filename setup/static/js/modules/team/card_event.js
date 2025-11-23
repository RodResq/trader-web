import { setupPrioridadeEvento } from './prioridade_evento.js';
import { showNotification } from '../notifications.js';
import { apiClient } from '../shared/apiClient.js';

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


export async function carregarEventosTime(idTeam) {

    try {
        const url = `api/v1/team/${idTeam}/events?page=1&page_size=5`;

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
        
        if (data.results && data.results.length > 0) {
            await renderizarCardTeam(idTeam);
            const resultados = await compareTeams(data.results);
            await renderizarCardEventoTeam(data.results, resultados);
            return;
        } else {
            console.error('Resposta API sem sucesso:', data);
            showNotification(`Falha ao recuperar dados de evento do time`, 'danger');
        }

    } catch(error) {
        console.error('Todas as tentativas falharam');
        showNotification(`Erro ao carregar eventos após ${tentativas} tentativas`, 'danger');
        
    } 

}

export async function compareTeams(events) {
    try {

        if (!events || events.length === 0) {
            console.warn('Nenhum evento fornecido');
            return [];
        }
        
        console.log(`Iniciando comparação de ${events.length} eventos`);

        const promisses = events.map(async event => {
            try {
                const url = `/events/${event.idEvent}/compare_players`;
                const dados = await apiClient.get(url);

                if (dados.success) {
                    return {
                        eventId: event.idEvent,
                        comparison: dados.data 
                    };
                }
            } catch(error) {
                console.error(`Erro ao comparar evento ${event.idEvent}:`, error);
                showNotification('Erro ao comparar times', 'danger');
                return null;
            }
        });
    
        const resultados = await Promise.all(promisses);
    
        return resultados.filter(resultado => resultado !== null);
    } catch(error) {
        console.error('Erro em compareTeams:', error);
        showNotification('Erro ao comparar times', 'danger');
        return [];
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


export async function renderizarCardEventoTeam(dados, resultados) {
    const tournament = document.querySelector('.tournament');

    if (!tournament) {
        console.warn('Elemento .tournament não encontrado');
        return;
    }

    tournament.innerHTML = '';

    if (dados.length > 0) {
        dados.forEach(event => {

            const comparacao = resultados.find(r => r.eventId === event.idEvent);

            let styleCard = 'None';
            if (comparacao && comparacao.comparison) {
                styleCard = 'border-left-width: 15px; border-color: #198754; border-top: none; border-bottom: none; border-right: none;';
            } else {
                styleCard = 'border-left-width: 15px; border-color: #dc3545; border-top: none; border-bottom: none; border-right: none;';
            }

            const cardDiv = document.createElement('div');
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

            const renderMetrics  = (comparasion) => {
                if (!comparasion) return '';

                return `
                    <span class="home-analyisis-metric">Home Total Player: ${comparasion.home_analysis?.total_players}</span>
                    <span class="home-analyisis-metric">Away Total Player: ${comparasion.away_analysis?.total_players}</span>
                `;
            }

            const renderComparasionOverAllAndDefensiveTeams = (comparison) => {
                if (!comparison) {
                    return '';
                }

                return `
                    <p>OverAll Winner: ${comparison.compareAll?.overall_winner}</p>
                    <p>Analyse Scenarios: ${comparison.analyseAttackVsDefense?.likely_scenario?.description}</p>
                `;
            }

            const renderComparasionAttackVsDefenseTeams = (comparison) => {
                if (!comparison) {
                    return '';
                }

                return `
                    <p>Analyse Attack Home Vs Defense Away: ${comparison.home_attack_vs_away_defense?.winner}</p>
                    <p>Analyse Attack Away Vs Defense Home: ${comparison.away_attack_vs_home_defense?.winner}</p>
                `;
            }

            const renderPrediction = (comparison) => {
                if (!comparison) {
                    return '';
                }

                return `
                    <p>Prediction: ${comparison.analyseAttackVsDefense?.likely_scenario?.prediction}</p>
                `;
            }

            cardDiv.innerHTML = `
                <div class="card" style="border-radius: unset;">
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
                        <div class="col-md">
                            <div class="row g-0">
                                <div class="col-sm-4">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center gap-2">
                                            <img class="unique-tournament-logo img-fluid" 
                                                style="max-width: 30px; height: 30px; object-fit: contain;"
                                                src="data:imagem/png;base64,${iconeTimeConfronto(teamId)}" 
                                                alt=${timeConfronto(teamId)}>
                                            <h6 class="card-title">${timeConfronto(teamId)}</h6>
                                        </div>
                                        <div class="p-3">${renderMetrics(comparacao?.comparison?.compareAll)}</div>
                                    </div>
                                </div>
                                <div class="col-sm-4 p-3">
                                    <div>${renderComparasionOverAllAndDefensiveTeams(comparacao?.comparison)}</div>
                                </div>
                                <div class="col-sm-4 p-3">
                                    <div>${renderComparasionAttackVsDefenseTeams(comparacao?.comparison?.analyseAttackVsDefense)}</div>
                                </div>
                                <div class="col-12 bg-success-subtle">
                                    ${renderPrediction(comparacao?.comparison)}
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
