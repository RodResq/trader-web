import { showNotification } from "../notifications.js";
import { renderizarCardTeam, renderizarCardEventoTeam } from "./card_event.js";

export function setupFindTeam() {

    const btnPesquisar = document.getElementById('btn-pesquisar-navbar');
    const inputPesquisar = document.getElementById('input-pesquisar-navbar');

    if (!btnPesquisar || !inputPesquisar) return;

    btnPesquisar.addEventListener('click', async function() {

        const teamContext = window.location.pathname === '/team' ||
                            window.location.pathname.startsWith('/team/');
        
        if (!teamContext) return;

        if (inputPesquisar.value === null) return;

        const textPesquisar = inputPesquisar.value.trim()

        try {
            const url = `api/v1/team/find?name=${textPesquisar}`;
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
                    renderizarCardTeam(data.team.id_team);
                    renderizarCardEventoTeam(data.team);
                } else {
                    showNotification('Time nao encontrado', 'error');
                }
            })
        } catch {
            console.error('Erro:', error);
            this.disabled = false;
        }
    });
}