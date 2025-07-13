import { showNotification } from '../notifications.js';

export function setupProximoEvento() {
    inicializarProximoEvento();
}

async function inicializarProximoEvento() {
    let dados = [];
    try {
        const response = await fetch('/api/proximo_evento');
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        dados = await response.json();
        if (dados.success) {
            renderizarProximoEvento(dados);
        } else {
            removeParenteNode();
            showNotification('Sem Próximos Eventos', 'warning');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de resutltado das apostas:', error);
    } finally {
        console.log('Finaly próximo evento');
    }
}


function renderizarProximoEvento(dados) {
    const proximoEvento = document.getElementById('proximoEvento');
    const tempoRestando = document.getElementById('tempoRestando');

    if (!proximoEvento) return;

    if (!dados['success']) {
        proximoEvento.parentElement = '';
    }

    proximoEvento.className = 'alert-proximo-evento';
    proximoEvento.textContent = dados['proximo_jogo_futuro']['id_event'];

    tempoRestando.className = 'alert-proximo-evento';

    let totalSegundos = (dados['proximo_jogo_futuro']['tempo_diferenca']['horas'] * 3600) + 
                   (dados['proximo_jogo_futuro']['tempo_diferenca']['minutos'] * 60);

    const timerInterval = setInterval(() => {
        if (totalSegundos <= 0) {
            clearInterval(timerInterval);
            tempoRestando.textContent = "00:00:00";
            return;
        }

        totalSegundos--;

        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;

        tempoRestando.textContent = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }, 1000);

}

function removeParenteNode() {
    const proximoEventoLabel = document.getElementById('proximoEventoLabel');
    const tempoRestandoLabel = document.getElementById('tempoRestandoLabel');

    if (!proximoEvento || !tempoRestando) return; 

    proximoEventoLabel.remove();
    tempoRestandoLabel.remove();
}