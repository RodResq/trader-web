/**
 * Módulo API - Gerencia chamadas de API e operações de dados
 */
import { showNotification } from './notifications.js';
import { updateEntryOptionIcon, updateMarketsTable } from './table.js';
import { updateMarketStatus } from './marketStatus.js';
import { setupRecusarModal } from './recusarAposta.js';
import { desabilitarBtnAceitar } from './utils.js';


/**
 * Configura botões de aposta com manipuladores de eventos
 */
export function setupApostaButtons() {
    const modal = document.getElementById('aceitarApostaModal');
    const aceitarBtn = document.querySelectorAll('#aceitar-aposta');
    const confirmarBrn = document.getElementById('confirmarAceiteBtn')
    const apostarButtons = document.querySelectorAll('.apostar-btn');

    if (!modal || !aceitarBtn.length || !confirmarBrn || !apostarButtons) return;

    const modalInstance = new bootstrap.Modal(modal);

    let currentEventId = null;
    let currentRow = null;
    
    apostarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error('ID do evento não encontrado');
                return;
            }

            const apostaBtn = this;
            currentRow = apostaBtn.closest('tr');

            if (!currentRow) return;

            const mercado = currentRow.querySelector('td:nth-child(2)').textContent;
            const odd = currentRow.querySelector('td:nth-child(3)').textContent;
            currentEventId = eventId;

            // Atualizar dados no modal
            document.getElementById('aceitar-evento-id').textContent = eventId;
            document.getElementById('aceitar-evento-mercado').textContent = mercado;
            document.getElementById('aceitar-evento-odd').textContent = odd;;

            modalInstance.show();
        });
    });


    confirmarBrn.addEventListener('click', function() {
        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }

        const url = `/api/apostar?event_id=${currentEventId}&action=aceitar`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro ao aceitar entrada');
            }
            return response.json();
        }).then(data => {
            desabilitarBtnAceitar(currentRow);
            modalInstance.hide();
            showNotification('Aposta registrada com sucesso!', 'success');
            
            return updateEntryOptionIcon(currentRow, "A")
        }).catch(error => {
            console.error('Erro:', error);
            showNotification('Erro ao registrar aposta. Tente novamente.', 'danger');
        })
    })
}

/**
 * Configura o botão de atualização com manipulador de eventos
 */
export function setupRefreshButton() {
    const refreshButton = document.getElementById('updateMarkets');
    if (!refreshButton) return;

    refreshButton.addEventListener('click', function(e) {
        e.preventDefault();

        // Adiciona classes de animação
        const icon = this.querySelector('i');
        icon.classList.add('rotate');
        this.classList.add('loading');
        this.disabled = true;

        fetchUpdatedMarkets();
    });
}

/**
 * Busca dados atualizados de mercados da API
 */
function fetchUpdatedMarkets() {
    const url = '/api/mercados';

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar os mercados');
        }
        return response.json();
    })
    .then(data => {
        const success = updateMarketsTable(data);
        
        if (success) {
            updateMarketStatus();
            setupApostaButtons();
            setupRecusarModal();
            showNotification('Mercados atualizados com sucesso!', 'success');
        } else {
            showNotification('Erro ao processar dados dos mercados', 'warning');
        }
        return data;
    })
    .catch(error => {
        console.error('Erro:', error);
        showNotification('Erro ao atualizar mercados. Tente novamente.', 'danger');
        throw error; // Re-throw para permitir tratamento adicional
    })
    .finally(() => {
        stopRefreshAnimation();
    });
}

/**
 * Para a animação do botão de atualização
 */
function stopRefreshAnimation() {
    const refreshButton = document.getElementById('updateMarkets');
    if (!refreshButton) return;

    const icon = refreshButton.querySelector('i');
    if (icon) icon.classList.remove('rotate');
    
    refreshButton.classList.remove('loading');
    refreshButton.disabled = false;
}