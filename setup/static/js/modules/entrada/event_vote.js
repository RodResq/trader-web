import { showNotification } from "../notifications.js";

export function setupEventVote() {
    const btnsEventVote = document.querySelectorAll('.event-vote');
    
    if (!btnsEventVote) return;

    btnsEventVote.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            if (!idEvent) showNotification('Id evento nao encontrado');
    
            const currentRow = this.closest('tr');
            if (!currentRow) console.error('Nao foi possivel recuperar a linha atual');
    
            const statusCell = currentRow.querySelector('td:nth-child(2)');
    
            console.log('Current cell', statusCell);
    
            try {
                const url = `api/v1/analytics/vote?event_id=${idEvent}`;
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
                    buildIconHomeUp(data.data, currentRow);
                })
            } catch {
    
            } finally {
    
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
