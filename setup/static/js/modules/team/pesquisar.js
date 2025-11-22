import { showNotification } from "../notifications.js";
import { renderizarCardTeam, compareTeams, renderizarCardEventoTeam } from './card_event.js';
import { apiClient } from "../shared/apiClient.js";

export function setupFindTeam() {

    const btnPesquisar = document.getElementById('btn-pesquisar-navbar');
    const inputPesquisar = document.getElementById('input-pesquisar-navbar');

    if (!btnPesquisar || !inputPesquisar) return;

    btnPesquisar.addEventListener('click', async function() {

        if (inputPesquisar.value === null) return;

        const textPesquisar = inputPesquisar.value.trim()

        if (!textPesquisar) {
            showNotification('Digite o nome do time para pesquisar', 'warning');
            return;
        }
        await buscarTeam(textPesquisar);
        
    });

    inputPesquisar.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            const textPesquisar = inputPesquisar.value?.trim();
            if (textPesquisar) {
                await buscarTeam(textPesquisar);
            }
        }
    });

}


async function buscarTeam(nome) {
    try {
        const url = `/team/find?name=${nome}`;
        const data = await apiClient.get(url)
        
        if (data.success) {
            await renderizarCardTeam(data.team.id_team);

            const dados = await apiClient.get(`/team/${data.team.id_team}/events?page=1&page_size=5`);

            const resultados = await compareTeams(dados.results);

            await renderizarCardEventoTeam(dados.results, resultados);
            
            showNotification(`Time "${data.team.name}" carregado com sucesso`, 'success');
        } else {
            console.warn('Time não encontrado');
            showNotification('Time nao encontrado', 'error');
        }
    } catch {
        console.error('Erro ao buscar time::', error);
        showNotification(`Erro ao buscar time: ${error.message}`, 'danger');
    }
    
}
