
export function setupCardEventTeam() {
    const rows = document.querySelectorAll('.tr-clubes[data-team-id]');
    
    if (!rows) return;

    rows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', async function() {
            const teamId = this.getAttribute('data-team-id');
            if (!teamId) {
                console.error('ID do team não encontrado')
                return;
            }
            
            try {
                const url = `api/team/events?id_team=${teamId}`
                await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    if (!response.ok) {
                       throw new Error(`Erro HTTP: ${response.status}`); 
                    }
                    return response.json();
                }).then(data => {
                    if (data.success) {
                        renderizarCardEventoTeam(data.dados.data);
                    } else {
                        showNotification(`Falha ao recuperar dados de evento do time`, 'danger');
                    }
                });

            } catch(error) {
                console.error('Erro:', error);
                this.disabled = false;
            } finally {

            }
        });
    });
}

function renderizarCardEventoTeam(dados) {
    const tournament = document.querySelector('.tournament');

    if (!tournament) return;

    tournament.innerHTML = '';

    if (dados.length > 0) {
        dados.forEach(event => {

            const cardDiv = document.createElement('div');
            cardDiv.className = 'card border-left-primary shadow h-100 mb-3';

            cardDiv.innerHTML = `
                <div class="card-body">
                    <div class="row no-gutters">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                ${event.tournament.id || 'ID'}
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                ${event.tournament.name || 'Campeonato'}
                            </div>
                            <div class="text-xs text-gray-600 mt-2">
                                <i class="fas fa-calendar-alt"></i> ${event.tournament.startTimestamp || 'Data não informada'}
                            </div>
                    </div>
                </div>
            `;
            tournament.append(cardDiv);
        })
    } else {
        tournament.innerHTML = `
            <div class="card border-left-secondary shadow h-100 mb-3">
                <div class="card-body text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-calendar-times fa-3x mb-3"></i>
                        <h5>Nenhum evento encontrado</h5>
                        <p class="text-sm">Não há eventos disponíveis no momento.</p>
                    </div>
                </div>
            </div>
        `;
    }


}