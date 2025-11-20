import { showNotification } from "../notifications.js";
import { apiClient } from '../shared/apiClient.js'

export function setupEventVote() {
    const btnsEventVote = document.querySelectorAll('.event-vote');
    
    if (!btnsEventVote) return;

    btnsEventVote.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            if (!idEvent) showNotification('Id evento nao encontrado');

            const eventOrigin = this.getAttribute('data-event-origin');
    
            const currentRow = this.closest('tr');
            if (!currentRow) console.error('Nao foi possivel recuperar a linha atual');
    
            const statusCell = currentRow.querySelector('td:nth-child(2)');
    
            const url = `/analytics/vote?event_id=${idEvent}&event_origin=${eventOrigin}`;
            
            try {
                const dados = await apiClient.get(url);
                if (dados.success) {
                    showNotification('Event Voto Recuperado com sucesso', 'success');
                    buildIconHomeUp(dados.data, currentRow);
                }

            } catch {
                showNotification('Nao foi possivel recuperar o event de voto', 'error');
            }
        });
    });
}

function buildIconHomeUp(vote, currentRow) {
    if (!currentRow) return;

    const statusCell = currentRow.querySelector('td:nth-child(2)');
    const iconVoteExiste = currentRow.querySelector('.icon-vote');
    
    if (!statusCell) return;

    if (iconVoteExiste) {
        iconVoteExiste.remove();
    }

    const iconVote = document.createElement('i');
    const optionVote = {
        'H': {
            icon: 'bi-house-up-fill',
            color: '#198754'
        },
        'A': {
            icon: 'bi-house-down-fill',
            color: '#dc3545'
        }
    }

    const stateVote = optionVote[vote];
    iconVote.classList.add('align-middle', 'fs-6', 'bi', stateVote.icon, 'icon-vote');
    iconVote.style.color = stateVote.color;
    statusCell.appendChild(iconVote);

}
