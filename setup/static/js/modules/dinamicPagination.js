/**
 * Módulo de Paginação Dinâmica - Gerencia a atualização dinâmica dos controles de paginação
 */
import { navigateToPage } from './pagination.js';

/**
 * Inicializa o comportamento dinâmico da paginação para AJAX
 */
export function initDynamicPagination() {
    document.addEventListener('DOMContentLoaded', function() {
        // Delegação de eventos para links de paginação
        document.addEventListener('click', function(e) {
            // Verifica se o clique foi em um link de paginação
            const pageLink = e.target.closest('.pagination .page-link:not(.disabled)');
            if (pageLink) {
                e.preventDefault();
                
                // Verificar se estamos usando AJAX para atualizações (verifica a existência do botão de atualização)
                const refreshButton = document.getElementById('updateMarkets');
                if (refreshButton) {
                    // Extrair o número da página do link
                    let page = 1;
                    
                    if (pageLink.hasAttribute('data-page')) {
                        page = parseInt(pageLink.getAttribute('data-page'));
                    } else {
                        // Tentar extrair da URL se não tiver atributo data-page
                        const href = pageLink.getAttribute('href');
                        if (href) {
                            const url = new URL(window.location.origin + href);
                            page = parseInt(url.searchParams.get('page')) || 1;
                        }
                    }
                    
                    // Navegação via AJAX
                    navigateToPage(page);
                } else {
                    // Navegação tradicional
                    window.location.href = pageLink.getAttribute('href');
                }
            }
        });
        
        // Manipulador para o select de itens por página
        const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', function() {
                const itemsPerPage = parseInt(this.value);
                
                // Verificar se estamos usando AJAX
                const refreshButton = document.getElementById('updateMarkets');
                if (refreshButton) {
                    // Reiniciar para a primeira página com novo número de itens
                    navigateToPage(1, itemsPerPage);
                } else {
                    // Navegação tradicional
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('items_per_page', itemsPerPage);
                    currentUrl.searchParams.set('page', 1);
                    window.location.href = currentUrl.toString();
                }
            });
        }
    });
}

/**
 * Atualiza os controles de paginação no DOM
 * @param {Object} paginationData - Dados de paginação do servidor
 */
export function updatePaginationControls(paginationData) {
    if (!paginationData) return;
    
    const { current_page, total_pages, items_per_page, total_items } = paginationData;
    
    // Atualizar o select de itens por página
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.value = items_per_page;
    }
    
    // Atualizar informações sobre a página atual
    const pageInfo = document.querySelector('.pagination-container .page-info');
    if (pageInfo) {
        pageInfo.textContent = `Página ${current_page} de ${total_pages} (${total_items} items)`;
    }
    
    // Atualizar os links de paginação
    const paginationUl = document.querySelector('.pagination-container .pagination');
    if (paginationUl) {
        let paginationHtml = '';
        
        // Primeira página e anterior
        paginationHtml += `
            <li class="page-item ${current_page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="1" aria-label="First">
                    <span aria-hidden="true">&laquo;&laquo;</span>
                </a>
            </li>
            <li class="page-item ${current_page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${current_page - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        // Gerar links para as páginas
        if (total_pages <= 7) {
            // Mostrar todas as páginas
            for (let i = 1; i <= total_pages; i++) {
                paginationHtml += `
                    <li class="page-item ${i === current_page ? 'active' : ''}">
                        <a class="page-link" href="javascript:void(0);" data-page="${i}">${i}</a>
                    </li>
                `;
            }
        } else {
            // Mostrar páginas com elipses
            
            // Sempre mostrar a primeira página
            paginationHtml += `
                <li class="page-item ${1 === current_page ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0);" data-page="1">1</a>
                </li>
            `;
            
            // Calcular o range de páginas a mostrar
            let startPage = Math.max(2, current_page - 1);
            let endPage = Math.min(total_pages - 1, current_page + 1);
            
            // Ajustar para mostrar sempre 3 páginas
            if (startPage > 2) {
                paginationHtml += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
            
            // Páginas do meio
            for (let i = startPage; i <= endPage; i++) {
                paginationHtml += `
                    <li class="page-item ${i === current_page ? 'active' : ''}">
                        <a class="page-link" href="javascript:void(0);" data-page="${i}">${i}</a>
                    </li>
                `;
            }
            
            // Elipse antes da última página
            if (endPage < total_pages - 1) {
                paginationHtml += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
            
            // Sempre mostrar a última página
            paginationHtml += `
                <li class="page-item ${total_pages === current_page ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0);" data-page="${total_pages}">${total_pages}</a>
                </li>
            `;
        }
        
        // Próxima página e última
        paginationHtml += `
            <li class="page-item ${current_page === total_pages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${current_page + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
            <li class="page-item ${current_page === total_pages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${total_pages}" aria-label="Last">
                    <span aria-hidden="true">&raquo;&raquo;</span>
                </a>
            </li>
        `;
        
        // Atualizar o HTML
        paginationUl.innerHTML = paginationHtml;
        
        // Adicionar event listeners aos novos links
        paginationUl.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (this.closest('.page-item.disabled')) return;
                
                const page = parseInt(this.dataset.page);
                navigateToPage(page);
            });
        });
    }
}

/**
 * Cria controles de paginação para substituir os controles estáticos
 * @param {HTMLElement} container - Elemento onde os controles serão inseridos
 * @param {Object} paginationData - Dados de paginação
 */
export function createPaginationControls(container, paginationData) {
    if (!container || !paginationData) return;
    
    const { current_page, total_pages, items_per_page, total_items } = paginationData;
    
    // Criar a estrutura dos controles de paginação
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container mt-3 d-flex justify-content-between align-items-center';
    
    // Criar o select de itens por página
    paginationContainer.innerHTML = `
        <div class="items-per-page">
            <label class="me-2">Items por página:</label>
            <select id="itemsPerPageSelect" class="form-select form-select-sm" style="width: auto; display: inline-block;">
                <option value="10" ${items_per_page === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${items_per_page === 20 ? 'selected' : ''}>20</option>
                <option value="30" ${items_per_page === 30 ? 'selected' : ''}>30</option>
                <option value="50" ${items_per_page === 50 ? 'selected' : ''}>50</option>
            </select>
        </div>
        
        <div class="pagination">
            <ul class="pagination mb-0"></ul>
        </div>
        
        <div class="page-info">
            <span>Página ${current_page} de ${total_pages} (${total_items} items)</span>
        </div>
    `;
    
    // Inserir os controles no container
    container.innerHTML = '';
    container.appendChild(paginationContainer);
    
    // Atualizar os links de paginação
    updatePaginationControls(paginationData);
    
    // Adicionar event listener para o select de itens por página
    const itemsPerPageSelect = container.querySelector('#itemsPerPageSelect');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            const newItemsPerPage = parseInt(this.value);
            navigateToPage(1, newItemsPerPage);
        });
    }
}

/**
 * Ajusta os parâmetros de paginação na URL atual
 * @param {number} page - Número da página
 * @param {number} itemsPerPage - Itens por página
 * @returns {string} Nova URL com parâmetros de paginação
 */
export function updateURLWithPagination(page, itemsPerPage) {
    const url = new URL(window.location.href);
    
    if (page) {
        url.searchParams.set('page', page);
    }
    
    if (itemsPerPage) {
        url.searchParams.set('items_per_page', itemsPerPage);
    }
    
    return url.toString();
}

/**
 * Obtém os parâmetros de paginação atuais da URL
 * @returns {Object} Objeto com página atual e itens por página
 */
export function getPaginationFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
        page: parseInt(urlParams.get('page')) || 1,
        itemsPerPage: parseInt(urlParams.get('items_per_page')) || 10
    };
}