import { showNotification } from "../notifications.js";

export function setupStatistic() {
    const btnsEventStatistic = document.querySelectorAll('.event-statistic');
    
    if (!btnsEventStatistic) return;

    btnsEventStatistic.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            if (!idEvent) showNotification('Id evento nao encontrado');

            const eventOrigin = this.getAttribute('data-event-origin');
    
            const currentRow = this.closest('tr');
            if (!currentRow) console.error('Nao foi possivel recuperar a linha atual');
    
            const statusCell = currentRow.querySelector('td:nth-child(2)');
    
            console.log('Current cell', statusCell);
    
            try {
                const url = `api/v1/statistic/${idEvent}?event_origin=${eventOrigin}`;
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    if (!response.ok) throw new Error('Erro ao recuperar votos'); 
                    return response.json();
                }).then(data => {
                    if (!data.success) showNotification('Nao foi possivel recuperar o event de voto');
                    buidlIconStatisticResult(data.statistic, currentRow);
                })
            } catch {
    
            } finally {
    
            }
        });
    })
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

