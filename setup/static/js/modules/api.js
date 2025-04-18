/**
 * Módulo API - Gerencia chamadas de API e operações de dados
 */
import { showNotification } from './notifications.js';
import { updateEntryOptionIcon, updateMarketsTable } from './table.js';
import { updateMarketStatus } from './marketStatus.js';
import { setupRecusarModal } from './recusarAposta.js';

/**
 * Configura botões de aposta com manipuladores de eventos
 */
export function setupApostaButtons() {
    const apostarButtons = document.querySelectorAll('.apostar-btn');
    
    apostarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error('ID do evento não encontrado');
                return;
            }

            const apostaBtn = this;
            const tableRow = apostaBtn.closest('tr');

            if (confirm('Deseja confirmar esta aposta?')) {
                apostaBtn.disabled = true;
                apostaBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';

                const url = `/api/apostar?event_id=${eventId}&action=aceitar`;

                fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao processar a aposta');
                    }
                    return response.json();
                })
                .then(data => {
                    // Processa resposta bem-sucedida
                    desabilitarBtnAceitarAposta(apostaBtn);
                    
                    // Exibe notificação de sucesso
                    showNotification('Aposta registrada com sucesso!', 'success');
                    return updateEntryOptionIcon(tableRow, "A")
                })
                .catch(error => {
                    console.error('Erro:', error);
                    apostaBtn.innerHTML = '<i class="bi bi-check"></i>';
                    apostaBtn.disabled = false;
                    
                    // Exibe notificação de erro
                    showNotification('Erro ao registrar aposta. Tente novamente.', 'danger');
                });
            }
        });
    });
}

function desabilitarBtnAceitarAposta(apostaBtn) {
    apostaBtn.innerHTML = '<i class="bi bi-check-all"></i>';
    apostaBtn.classList.remove('btn-success');
    apostaBtn.classList.add('btn-secondary');
    apostaBtn.disabled = true;
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