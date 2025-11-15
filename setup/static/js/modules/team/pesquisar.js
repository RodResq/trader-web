import { showNotification } from "../notifications.js";
import { renderizarCardTeam } from './card_event.js';

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
        const url = `api/v1/team/find?name=${nome}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`); 
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('Time encontrado:', data.team.name);
            await renderizarCardTeam(data.team.id_team);
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
