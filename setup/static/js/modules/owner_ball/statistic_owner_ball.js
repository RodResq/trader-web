import { showNotification } from "../notifications.js";

export function setupStatisticOwnerBall() {
    const btnsEventStatistic = document.querySelectorAll('.event-statistic-ownerball');
    
    if (!btnsEventStatistic) return;

    btnsEventStatistic.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            if (!idEvent) showNotification('Id evento nao encontrado', 'danger');
            
            const idHome = this.getAttribute('data-id-home');
            const idAway = this.getAttribute('data-id-away')
            
            if (!idHome && !idAway) showNotification('Id Home e Id Away nao encontrados', 'danger');

            console.log('>>>>>>>>>>>> IDHome: ', idHome);
            console.log('>>>>>>>>>>>> IDAway: ', idAway);
            
            const eventOrigin = this.getAttribute('data-event-origin');
            
            const currentRow = this.closest('tr');
            if (!currentRow) console.error('Nao foi possivel recuperar a linha atual');
            

            const retornoHome = await recuperarStatisticTeam(idHome);
            if (retornoHome) {
               const retornoAway = await recuperarStatisticTeam(idAway);
               if (retornoAway) {
                    recuperarDadosComparacaoStatistics(idHome, idAway, eventOrigin, idEvent, currentRow);
               }
            }
        });
    })
}

async function recuperarStatisticTeam(id_team) {
    const url = `api/v1/statistic/team/${id_team}`;
    
    try {
        const response  = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao recuperar estatisticas do evento');
        }

        const data = await response.json();
        if (data.success) {
            showNotification('Resultado de estatisticas do team recuperado com sucesso', 'success');
            return true;
        } else {
            showNotification('Nao foi possivel recuperar estatistica do evento');
            return false;
        }
    } catch(error) {
        showNotification('Erro ao recuperar estatisticas do jogo.', 'danger');
    } 
}

async function recuperarDadosComparacaoStatistics(idHome, idAway, event_origin, id_event, currentRow) {
    
    const url = `api/v1/statistic/compare/${idHome}/${idAway}?event_origin=${event_origin}&id_event=${id_event}`;
    try {
        const response  = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao recuperar estatisticas do evento'); 
        }
        const data = await response.json();
        if (data.success) {
            showNotification('Resultado de estatisticas do evento recuperado com sucesso', 'success');
            buidlIconStatisticResult(data.data, currentRow);
        } else {
            showNotification('Nao foi possivel recuperar estatistica do evento');
        }
    } catch(error) {
        showNotification('Erro ao recuperar estatisticas do jogo.', 'danger');
    } 

}

function buidlIconStatisticResult(statiticResult, currentRow) {
    if (!currentRow) return;

    const statusCell = currentRow.querySelector('td:nth-child(2)');
    const iconStatictExist = currentRow.querySelector('.icon-statistic');

    if (!statusCell) return;

    if (iconStatictExist) {
        iconStatictExist.remove();
    }

    const iconStatistc = document.createElement('i');
    iconStatistc.classList.add('icon-statistic', 'bi', 'bi-bar-chart-line-fill', 'align-middle');
    
    if (statiticResult) {
        iconStatistc.style.color = '#198754';
        statusCell.appendChild(iconStatistc);
    } else {
        iconStatistc.style.color = '#dc3545';
        statusCell.appendChild(iconStatistc);
    }
    
}

