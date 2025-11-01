import { showNotification } from "../notifications.js";

const API_BASE = 'api/v1/event';

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

            const url = `${API_BASE}/${idEvent}/win_probability?event_origin=${eventOrigin}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao recuperar win propability');
                }

                const responseData = await response.json();
                if (responseData.success) {
                    showNotification('Resultado de win probability recuperado com sucesso', 'success');
                    homeWin.textContent = responseData.data.home_win;
                } else {
                    showNotification('Erro ao recuperar win probability', 'danger');
                }

            } catch (error) {
                showNotification(error.message, 'danger');
            }
            
        })
    });
}