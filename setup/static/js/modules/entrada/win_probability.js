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

            const homeWin = currentRow.querySelector('.home-win');
            if (!homeWin) console.error('Nao foi possivel recuperar o elemento span win probability');

            const url = `/events/${idEvent}/win_probability?event_origin=${eventOrigin}`;

            try {
                const data = await apiClient.get(url);

                showNotification('Resultado de win probability recuperado com sucesso', 'success');
                homeWin.textContent = data.data.home_win;

            } catch (error) {
                showNotification(error.message, 'danger');
            }
            
        })
    });
}