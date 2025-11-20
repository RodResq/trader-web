import { showNotification } from "../notifications.js";
import { apiClient } from "../shared/apiClient.js";

export function setupStatistic() {
    const btnsEventStatistic = document.querySelectorAll('.event-statistic');
    
    if (!btnsEventStatistic) return;

    btnsEventStatistic.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            if (!idEvent) showNotification('Id evento nao encontrado');

            const eventOrigin = this.getAttribute('data-event-origin');
    
            const currentRow = this.closest('tr');
            if (!currentRow) console.error('Nao foi possivel recuperar a linha atual');
    
            const url = `/statistic/${idEvent}?event_origin=${eventOrigin}`;
    
            try {
                const data  = await apiClient.get(url);
                
                showNotification('Resultado de estatisticas do evento recuperado com sucesso', 'success');
                buidlIconStatisticResult(data.statistic, currentRow);
            } catch(error) {
                showNotification(error.message, 'danger');
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

