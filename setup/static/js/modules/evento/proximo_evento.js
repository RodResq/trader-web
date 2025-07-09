import { showNotification } from '../notifications.js';

export function setupProximoEvento() {
    inicializarProximoEvento();
}

async function inicializarProximoEvento() {
    let dados = [];
    try {
        const response = await fetch('analytics/evento/api/proximo_evento');
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        dados = await response.json();
        if (dados.success) {
            renderizarProximoEvento(dados);
        } else {
            showNotification('Erro ao recuperar o próximo evento');
            throw new Error(data.error || 'Erro desconhecido ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de resutltado das apostas:', error);
    } finally {
        console.log('Finaly grafico performace');
    }
}


function renderizarProximoEvento(dados) {
    const proximoEvento = document.getElementById('proximoEvento');
    const tempoRestando = document.getElementById('tempoRestando');

    if (!proximoEvento) return;

    proximoEvento.className = 'alert-proximo-evento';
    proximoEvento.textContent = dados['proximo_jogo_futuro']['id_event'];

    tempoRestando.className = 'alert-proximo-evento';
    tempoRestando.textContent = 
        `${dados['proximo_jogo_futuro']['tempo_diferenca']['horas']}` + ':' +
        `${dados['proximo_jogo_futuro']['tempo_diferenca']['minutos']}` + ':' +
        `00`
}