/**
 * Módulo de Paginação - Gerencia funcionalidades de paginação
 */

import { restoreToggleState, restoreToggleStateOwnerBallFavoritoHome } from './uiEnhanced.js';

let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

/**
 * Inicializa os controles de paginação
 */
export function initPagination() {
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');

    if (itemsPerPageSelect) {
        // Definir o valor inicial baseado na URL ou no valor padrão
        const urlParams = new URLSearchParams(window.location.search);
        itemsPerPage = parseInt(urlParams.get('items_per_page')) || 10;

        // Atualizar o select com o valor atual
        itemsPerPageSelect.value = itemsPerPage;

        // Event listener para mudança do número de itens por página
        itemsPerPageSelect.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1; // Resetar para a primeira página
            navigateToPageEnhanced(currentPage, itemsPerPage);
        });
    }

    // Atribuir event listeners para os botões de paginação via delegação de eventos
    document.addEventListener('click', function(e) {
        // Verificar se o clique foi em um link de paginação
        if (e.target.closest('.pagination .page-link') && !e.target.closest('.disabled')) {
            e.preventDefault();

            // Obter o link ou o elemento pai mais próximo que seja um link
            const link = e.target.closest('a');

            if (link && link.href) {
                // Extrair o número da página da URL
                const url = new URL(link.href);
                const page = parseInt(url.searchParams.get('page')) || 1;

                navigateToPageEnhanced(page, itemsPerPage);
            }
        }
    });

    // Inicialização para paginação via AJAX
    setupAjaxPagination()
}

/**
 * Configura a paginação para requisições AJAX
 */
function setupAjaxPagination() {
    // Inicializar com valores da URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    itemsPerPage = parseInt(urlParams.get('items_per_page')) || 10;

    // Adicionar event listeners para os botões dinâmicos de paginação
    updatePaginationControls();

}


/**
 * Navega para a página especificada
 * @param {number} page - Número da página 
 */
export function navigateToPageEnhanced(page, itemsPerPageValue) {
    // Para navegação normal (não-AJAX), simplesmente redirecionar
    // Manter o estado no localStorage antes de redirecionar
    const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome');
    if (toggleSuperFavoritosHome) {
        localStorage.setItem('toggleSuperFavoritosHomeState', toggleSuperFavoritosHome.checked);
    }

    if (!isAjaxTable()) {
        window.location.href = `?page=${page}&items_per_page=${itemsPerPage || itemsPerPageValue}`;
        return;
    }

    // Para tabelas AJAX, carregar dados via AJAX
    currentPage = page;
    if (itemsPerPageValue) {
        itemsPerPage = itemsPerPageValue;
    }

    loadPageData();
}

/**
 * Verifica se está usando paginação AJAX
 * @returns {boolean} True se estiver usando AJAX para paginação
 */
function isAjaxTable() {
    // Verificar se o botão de atualização AJAX existe, o que indica uma tabela AJAX
    return !!document.getElementById('updateMarkets');
}


export function loadPageData() {
    const refreshButton = document.getElementById('updateMarkets');

    if (!refreshButton) return;

    // Adiciona classes de animação para indicar carregamento
    const icon = refreshButton.querySelector('i');
    if (icon) icon.classList.add('rotate');
    refreshButton.classList.add('loading');
    refreshButton.disabled = true;

    // URL da API com parâmetros de paginação
    const url = `/api/mercados?page=${currentPage}&items_per_page=${itemsPerPage}`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar dados da página');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
             updateTable(data.mercados);

            // Atualizar informações de paginação
            if (data.pagination) {
                totalPages = data.pagination.total_pages;
                currentPage = data.pagination.current_page;
                itemsPerPage = data.pagination.items_per_page;

                // Atualizar controles de paginação
                updatePaginationControls(data.pagination);
            }

            // Inicializar outros comportamentos necessários na tabela atualizada
            initTableBehaviors();

            restoreToggleState();

            restoreToggleStateOwnerBallFavoritoHome();
        }
    })
    .catch(error => {
        console.error('Erro ao carregar página:', error);
        showPaginationError('Erro ao carregar dados. Tente novamente.');
    })
    .finally(() => {
        // Remover indicador de carregamento
        if (icon) icon.classList.remove('rotate');
        refreshButton.classList.remove('loading');
        refreshButton.disabled = false;
    });
}

/**
 * Atualiza a tabela com novos dados
 * @param {Array} mercados - Array de dados de mercados
 */
function updateTable(mercados) {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    // Limpar tabela atual
    tbody.innerHTML = '';
    
    // Adicionar novas linhas
    mercados.forEach(mercado => {
        const row = document.createElement('tr');
        
        // ID
        const idCell = document.createElement('td');
        idCell.textContent = mercado.id_event;
        row.appendChild(idCell);
        
        // Mercado com ícone de status
        const mercadoCell = document.createElement('td');
        const iconElement = document.createElement('i');
        
        if (mercado.opcao_entrada === 'A') {
            iconElement.className = 'bi bi-check';
            iconElement.style = 'font-size: 1rem; color: green;';
        } else if (mercado.opcao_entrada === 'R') {
            iconElement.className = 'bi bi-x';
            iconElement.style = 'font-size: 1rem; color: red;';
        } else {
            iconElement.className = 'bi bi-alarm';
            iconElement.style = 'font-size: 1rem; color: cornflowerblue;';
        }
        
        mercadoCell.appendChild(iconElement);
        mercadoCell.appendChild(document.createTextNode(' ' + mercado.mercado));
        row.appendChild(mercadoCell);
        
        // Odd
        const oddCell = document.createElement('td');
        const iconElementChangeOdd = document.createElement('i');

        if (mercado.odd_change === 'P') {
            iconElementChangeOdd.className = 'bi bi-stop';
            iconElementChangeOdd.style = '1rem; color: yellow; vertical-align: middle;'
        } else if (mercado.odd_change === 'S') {
            iconElementChangeOdd.className = 'bi bi-arrow-up-short';
            iconElementChangeOdd.style = 'color: green; vertical-align: middle;'
        } else if (mercado.odd_change === 'D') {
            iconElementChangeOdd.className = 'bi bi-arrow-down-short';
            iconElementChangeOdd.style = 'color: red; vertical-align: middle;'
        }

        oddCell.appendChild(iconElementChangeOdd);
        oddCell.appendChild(document.createTextNode(' ' + mercado.odd))
        row.appendChild(oddCell);
        
        // Home
        const homeCell = document.createElement('td');
        homeCell.textContent = mercado.home_actual + '%';
        row.appendChild(homeCell);
        
        // Away
        const awayCell = document.createElement('td');
        awayCell.textContent = mercado.away_actual + '%';
        row.appendChild(awayCell);
        
        // Data
        const dataCell = document.createElement('td');
        dataCell.textContent = mercado.data_jogo;
        row.appendChild(dataCell);
        
        // Ações
        const acoesCell = document.createElement('td');
        
        // Botão editar odd
        const editarBtn = document.createElement('a');
        editarBtn.id = 'editar-odd';
        editarBtn.className = 'btn btn-sm btn-info edit-odd-btn';
        editarBtn.style = "margin-right: 0.2rem;"
        editarBtn.dataset.eventId = mercado.id_event;
        editarBtn.title = 'Editar Odd';
        editarBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        acoesCell.appendChild(editarBtn);
        
        // Botão aceitar aposta
        const aceitarBtn = document.createElement('a');
        aceitarBtn.id = 'aceitar-aposta';
        
        // Verificar se a entrada já foi aceita
        if (mercado.opcao_entrada === 'A') {
            aceitarBtn.className = 'btn btn-sm btn-secondary apostar-btn';
            aceitarBtn.disabled = true;
        } else {
            aceitarBtn.className = 'btn btn-sm btn-success apostar-btn';
        }
        aceitarBtn.style = "margin-right: 0.2rem;"
        aceitarBtn.dataset.eventId = mercado.id_event;
        aceitarBtn.title = 'Aceitar aposta';
        aceitarBtn.innerHTML = '<i class="bi bi-check"></i>';
        acoesCell.appendChild(aceitarBtn);
        
        // Botão recusar aposta
        const recusarBtn = document.createElement('a');
        recusarBtn.id = 'recusar-aposta';
        
        // Verificar se a entrada já foi recusada
        if (mercado.opcao_entrada === 'R') {
            recusarBtn.className = 'btn btn-sm btn-secondary recusar-btn';
            recusarBtn.disabled = true;
        } else {
            recusarBtn.className = 'btn btn-sm btn-danger recusar-btn';
        }
        
        recusarBtn.style = "margin-right: 0.2rem;"
        recusarBtn.dataset.eventId = mercado.id_event;
        recusarBtn.title = 'Recusar aposta';
        recusarBtn.innerHTML = '<i class="bi bi-x"></i>';
        acoesCell.appendChild(recusarBtn);
        
        // Botão desfazer ação
        const desfazerBtn = document.createElement('a');
        desfazerBtn.id = 'desfazer-acao';
        desfazerBtn.className = 'btn btn-sm btn-warning desfazer-acao-btn';
        desfazerBtn.dataset.eventId = mercado.id_event;
        desfazerBtn.title = 'Desfazer ação';
        desfazerBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
        acoesCell.appendChild(desfazerBtn);
        
        row.appendChild(acoesCell);
        
        tbody.appendChild(row);
    });
}

/**
 * Atualiza controles de paginação baseados nos dados atuais
 * @param {Object} pagination - Dados de paginação
 */
function updatePaginationControls(pagination = null) {
    const paginationContainer = document.querySelector('.pagination-container');
    
    if (!paginationContainer) return;
    
    // Se dados de paginação foram fornecidos, atualizar com eles
    if (pagination) {
        currentPage = pagination.current_page;
        totalPages = pagination.total_pages;
        itemsPerPage = pagination.items_per_page;
    }
    
    // Atualizar informações da página
    const pageInfo = paginationContainer.querySelector('.page-info');
    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    // Atualizar select de itens por página
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.value = itemsPerPage;
    }
    
    // Atualizar links de paginação
    const paginationLinks = paginationContainer.querySelector('.pagination');
    if (paginationLinks) {
        // Reconstruir os links de paginação
        let paginationHTML = '';
        
        // Botão primeira página e anterior
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="1" aria-label="First">
                    <span aria-hidden="true">&laquo;&laquo;</span>
                </a>
            </li>
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        // Números das páginas
        // Mostrar apenas algumas páginas ao redor da página atual
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0);" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Botão próxima página e última
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${totalPages}" aria-label="Last">
                    <span aria-hidden="true">&raquo;&raquo;</span>
                </a>
            </li>
        `;
        
        paginationLinks.innerHTML = paginationHTML;
        
        // Adicionar event listeners para os links
        paginationLinks.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (this.closest('.disabled')) return;
                
                const page = parseInt(this.dataset.page);
                navigateToPageEnhanced(page, itemsPerPage);
            });
        });
    }
}

/**
 * Inicializa os comportamentos da tabela após atualização
 */
function initTableBehaviors() {
    // Importar funções necessárias de outros módulos
    import('./table.js').then(module => {
        module.initTableHandlers();
    });
    
    import('./marketStatus.js').then(module => {
        module.updateMarketStatus();
    });
    
    // Reinicializar outros componentes conforme necessário
    import('./api.js').then(module => {
        if (module.setupApostaButtons) module.setupApostaButtons();
    });
    
    import('./recusarAposta.js').then(module => {
        if (module.setupRecusarModal) module.setupRecusarModal();
    });
    
    import('./desfazerAcao.js').then(module => {
        if (module.setupDesfazerAcaoModal) module.setupDesfazerAcaoModal();
    });
    
    import('./editarOdd.js').then(module => {
        if (module.setupEditarModal) module.setupEditarModal();
    });
}

/**
 * Exibe mensagem de erro na paginação
 * @param {string} message - Mensagem de erro
 */
function showPaginationError(message) {
    // Importar o módulo de notificações
    import('./notifications.js').then(module => {
        if (module.showNotification) {
            module.showNotification(message, 'danger');
        } else {
            console.error(message);
        }
    });
}

