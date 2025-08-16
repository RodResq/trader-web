import { showNotification } from "../notifications.js";

export function setupEventVote() {
    const btnEventVote = document.getElementById('btn-event-vote');
    
    if (!btnEventVote) return;

    btnEventVote.addEventListener('click', function(e) {
        e.preventDefault();
        const idEvent = this.getAttribute('data-event-id');
        if (!idEvent) showNotification('Id evento nao encontrado');

        try {
            const url = `api/analytics/vote?event_id=${idEvent}`;
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
                console.log('Dados: ', data.data);
            })
        } catch {

        } finally {

        }
    });
}