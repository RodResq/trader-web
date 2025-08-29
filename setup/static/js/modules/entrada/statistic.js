import { showNotification } from "../notifications.js";

export function setupStatistic() {
    const btnEventStatistic = document.getElementById('btn-event-statistic');
    
    if (!btnEventStatistic) return;

    btnEventStatistic.addEventListener('click', function(e) {
        e.preventDefault();
        const idEvent = this.getAttribute('data-event-id');
        if (!idEvent) showNotification('Id evento nao encontrado');

        const currentRow = this.closest('tr');
        if (!currentRow) console.error('Nao foi possivel recuperar a linha atual');

        const statusCell = currentRow.querySelector('td:nth-child(2)');

        console.log('Current cell', statusCell);

        try {
            const url = `api/v1/statistic/${idEvent}`;
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
                // TODO Atualizar Icone statistica com a cor verde
            })
        } catch {

        } finally {

        }
    });
}

