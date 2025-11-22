import { showNotification } from "../notifications.js";
import { apiClient } from "../shared/apiClient.js";


export function setupWinProbability() {

    const btnWinProbalility = document.querySelectorAll('.event-probability');

    if (!btnWinProbalility) return;

    btnWinProbalility.forEach(btn => {

        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            if (!idEvent) console.error('ID do evento nao recuperado');
    
            const eventOrigin = this.getAttribute('data-event-origin');
            if (!eventOrigin) console.error('Event Origin nao recuperado');
    
            const currentRow = this.closest('tr');
            if(!currentRow) console.error('Nao foi possivel recuperar a linha atual');

            const url = `/events/${idEvent}/win_probability?event_origin=${eventOrigin}`;

            try {
                const data = await apiClient.get(url);
                updateWinProbability(currentRow, data);
                showNotification('Resultado de win probability recuperado com sucesso', 'success');
            } catch (error) {
                showNotification(error.message, 'danger');
            }
            
        })
    });
}


function updateWinProbability(row, data) {

    if (!row || !data) {
        console.error('Paramentros passados incorretamente: ', row, data);
    }

    const cellHomeWin = row.querySelector('.cell-home-win');
    const cellAwayWin = row.querySelector('.cell-away-win');

    if (!cellHomeWin) console.error('Nao foi possivel recuperar o elemento cell home win probability');
    if (!cellAwayWin) console.error('Nao foi possivel recuperar o elemento cell away win probability');

    const spanHomeWin = cellHomeWin.querySelector('.span-home-win');
    const spanAwayWin = cellAwayWin.querySelector('.span-away-win');
    
    spanHomeWin.textContent = data.home_win;
    spanAwayWin.textContent = data.away_win;
    
    cellHomeWin.style.transition = 'background-color 1s';
    cellHomeWin.style.backgroundColor = data.home_win > 0? '#28a745': '#CC0000';
    cellHomeWin.style.color = 'white';

    setTimeout(() => {
        cellHomeWin.style.backgroundColor = '';
        cellHomeWin.style.color = '';
    }, 1000);

}