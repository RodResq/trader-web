import { showNotification } from "../notifications.js";
import { addCSRFToken } from "../token.js";

const API_ENDPOINTS = {
    'tr-ob': 'api/v1/owner_ball/resultado_entrada',
    'tr-sf': 'api/v1/analytics/resultado_entrada'
}



export function setupResultadoEntradaModal() {
    const modal = document.getElementById('resultadoEntradaModal');
    const eventBtn = document.querySelectorAll('.eventBtn');
    const confirmBtn = document.getElementById('confirmarResultadoEntradaBtn');

    if (!eventBtn || !modal || !confirmBtn) return;

    const modalInstance = new bootstrap.Modal(modal);

    let currentEventId = null;
    let currentRow = null;

    eventBtn.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error('ID do evento não encontrado')
                return;
            }

            currentRow = this.closest('tr');
            if (!currentRow) return;

            const mercado = currentRow.querySelector('td:nth-child(3)').textContent.trim();
            
            currentEventId = eventId;
            document.getElementById('resultado-entrada-evento-id').textContent = eventId;
            document.getElementById('resultado-entrada-mercado').textContent = mercado;

            modalInstance.show();
        });
    });

    confirmBtn.addEventListener('click', async function() {

        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }

        const selectResultadoEntrada = document.querySelector('.resultado-entrada-select');
        const valueSelected = selectResultadoEntrada ? selectResultadoEntrada.value: null;

        if (!valueSelected) {
            showNotification('Por favor, selecione um resultado', 'warning');
            return;
        }

        this.disabled = true;
        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';

        const getAPiEndpoint = (row) => {
            for (const[className, endpoint] of Object.entries(API_ENDPOINTS)) {
                if (row.classList.contains(className)) {
                    return endpoint;
                }
            }
            return API_ENDPOINTS['tr-sf'] || 'api/v1/analytics/resultado_entrada';
        }

        const baseUrl = getAPiEndpoint(currentRow);

        const requestData = {
            id_event: parseInt(currentEventId),
            entry_result: valueSelected
        };
        try {
            const response = await fetch(baseUrl, addCSRFToken({
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            }));
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                atualizarIconSoccer(currentRow, data.data.entry_result)
                showNotification(`Resultado da entrada ${currentEventId} registrado com sucesso.`, 'success');
            } else {
                showNotification(`Falha ao registrar resultado da entrada.`, 'danger');
            }
        } catch(error) {
            console.error('Erro ao atualizar resultado da entrada:', error);
            showNotification('Erro ao registrar resultado da entrada. Tente novamente.', 'danger');
        } finally { 
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-save"></i> Salvar';
            modalInstance.hide();
        }
    });
}

function atualizarIconSoccer(currentRow, entry_result) {
    if (!currentRow) return;

    const statusCell = currentRow.querySelector('td:nth-child(2)');

    if (!statusCell) return;

    const spanSoccerExiste = statusCell.querySelector('.icon-soccer, .icon-soccer-perdeu, .icon-soccer-empatou');
    if (spanSoccerExiste) {
        spanSoccerExiste.remove();
    }

    let classIconEntryResult;
    
    switch (entry_result) {
        case 'W': 
            classIconEntryResult = 'icon-soccer';
            break;
        case 'L':
            classIconEntryResult = 'icon-soccer-perdeu';
            break;
        case 'D':
            classIconEntryResult = 'icon-soccer-empatou';
            break;
    }
    
    const novoSpanSoccer = document.createElement('span');
    novoSpanSoccer.className = classIconEntryResult;
    if (entry_result == 'D') {
        novoSpanSoccer.style = "filter: hue-rotate(0deg) saturate(2) brightness(0.8) sepia(1) hue-rotate(-50deg);"
    }

    const iconPath = "/static/images/icons/soccer.svg";
    novoSpanSoccer.innerHTML = `<img src="${iconPath}" alt="soccer" class="me-2r" style="width: 15px; height: 15px;">`;

    statusCell.appendChild(novoSpanSoccer);

}
