/**
 * Módulo API - Gerencia chamadas de API e operações de dados
 */
import { showNotification } from './notifications.js';
import { updateEntryOptionIcon, updateMarketsTable } from './table.js';
import { updateMarketStatus } from './marketStatus.js';
import { setupRecusarModal } from './recusarAposta.js';
import { desabilitarBtnAceitar } from './utils.js';
import { loadPageData } from './pagination.js';


// Armazenamento de estado de paginação
let currentPage = 1;
let itemsPerPage = 10;

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
            document.getElementById('aceitar-evento-odd').textContent = odd;

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

        loadPageData();
    });
}

/**
 * Busca dados atualizados de mercados da API com paginação
 * @param {number} page - Número da página a ser carregada
 * @param {number} perPage - Número de itens por página
 */
export function fetchUpdatedMarkets(page = 1, perPage = 10) {
    // Atualizar estado de paginação
    currentPage = page;
    itemsPerPage = perPage;
    
    const url = `/api/mercados?page=${page}&items_per_page=${perPage}`;

    return fetch(url, {
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
        if (data.success) {
            const success = updateMarketsTable(data.mercados);
            
            if (success) {
                updateMarketStatus();
                setupApostaButtons();
                setupRecusarModal();
                showNotification('Mercados atualizados com sucesso!', 'success');
                
                // Retornar informações de paginação para atualizar os controles
                return {
                    success: true,
                    pagination: data.pagination || {
                        current_page: currentPage,
                        total_pages: 1,
                        items_per_page: itemsPerPage,
                        total_items: data.mercados.length
                    }
                };
            } else {
                showNotification('Erro ao processar dados dos mercados', 'warning');
                return { success: false };
            }
        } else {
            showNotification('Erro ao obter dados dos mercados', 'danger');
            return { success: false };
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        showNotification('Erro ao atualizar mercados. Tente novamente.', 'danger');
        return { success: false, error: error.message };
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

/**
 * Define a página atual para paginação
 * @param {number} page - Número da página
 */
export function setCurrentPage(page) {
    currentPage = page;
}

/**
 * Define o número de itens por página
 * @param {number} perPage - Número de itens por página
 */
export function setItemsPerPage(perPage) {
    itemsPerPage = perPage;
}

/**
 * Obtém o estado atual de paginação
 * @returns {Object} Objeto com página atual e itens por página
 */
export function getPaginationState() {
    return {
        currentPage,
        itemsPerPage
    };
}