/**
 * Módulo para gerenciar a API de mercados Owner Ball
 */

let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let isLoading = false;

export function setupApiOwnerBall() {
    console.log('Inicializando API Owner Ball...');

    // Carregar dados iniciais
    loadOwnerBallMarkets();

    // Configurar event listeners
    setupOwnerBallEventListeners();
}

/**
 * Carrega os mercados Owner Ball da API
 */
function loadOwnerBallMarkets(showLoader = true) {
    if (isLoading) return;

    isLoading = true;
    const tableBody = document.getElementById('ownerBallTableBody');

    if (showLoader && tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    const url = `/api/mercados_owner_ball_sf?page=${currentPage}&items_per_page=${itemsPerPage}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar mercados owner ball');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            updateOwnerBallTable(data.mercados);
            updateOwnerBallPagination(data.pagination);
        } else {
            showOwnerBallError('Erro ao carregar mercados owner ball');
        }
    })
    .catch(error => {
        console.error('Erro ao carregar página: ', error);
        showOwnerBallError('Erro ao carregar dados. Tente novamente.')
    })
    .finally(() => {
        isLoading = false;
    })
}

/**
 * Atualiza a tabela com os dados dos mercados Owner Ball
 */
function updateOwnerBallTable(mercados) {
    const tableBody = document.getElementById('ownerBallTableBody');

    if (!tableBody) {
        console.error('Elemento ownerBallTableBody não encontrado');
        return;
    }

    if (!mercados || mercados.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Nenhum mercado Owner Ball encontrado.
                </td>
            </tr>
        `;
        return;
    }

    const rows = mercados.map(mercado => {
        const dataFormatada = mercado.data_jogo ?
            new Date(mercado.data_jogo).toLocaleString('pt-BR'):
            'Data não disponível';

        return `
            <tr>
                <td>
                    <i class="bi bi-circle-fill" style="font-size: 0.8rem; color: cornflowerblue; margin-right:5px; vertical-align: middle;"></i>
                    ${mercado.mercado || 'N/A'}
                </td>
                <td>${mercado.odd || 'N/A'}</td>
                <td>${dataFormatada}</td>
                <td>
                    <button class="btn btn-sm btn-info" title="Ver detalhes" onclick="viewOwnerBallDetails('${mercado.mercado}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" title="Aceitar" onclick="acceptOwnerBallMarket('${mercado.mercado}')">
                        <i class="bi bi-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Recusar" onclick="rejectOwnerBallMarket('${mercado.mercado}')">
                        <i class="bi bi-x"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

/**
 * Atualiza a paginação
 */
function updateOwnerBallPagination(pagination) {
    if (!pagination) return;

    currentPage = pagination.current_page;
    totalPages = pagination.total_pages;
    itemsPerPage = pagination.items_per_page;

    // Atualizar informações da página
    const pageInfo = document.getElementById('ownerBallPageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `<span>Página ${currentPage} de ${totalPages}</span>`
    }

    // Atualizar lista de paginação
    const paginationList = document.getElementById('ownerBallPaginationList');
    if (paginationList) {
        paginationList.innerHTML = generateOwnerBallPaginationHTML();
    }

    // Atualizar select de items por página
    const itemsSelect = document.getElementById('ownerBallItemsPerPageSelect');
    if (itemsSelect) {
        itemsSelect.value = itemsPerPage;
    }

    
}


/**
* Gera o HTML da paginação
*/
function generateOwnerBallPaginationHTML() {
    let html = '';

    // Botão Primeira página
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(1)" aria-label="First">
                <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
        </li>
    `;

    // Botão Página anterior
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Páginas numeradas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToOwnerBallPage(${i})">${i}</a>
            </li>
        `;
    }

    // Botão Próxima página
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    // Botão Última página
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(${totalPages})" aria-label="Last">
                <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
        </li>
    `;
    
    return html;
}

/**
 * Configura os event listeners
 */
function setupOwnerBallEventListeners() {
    // Botão de atualizar
    const btnAtualizar = document.getElementById('atualizarMercadosOwnerBall');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function(e) {
            e.preventDefault();
            refreshOwnerBallMarkets();
        });
    }

    // Select de items por página
    const itemsPorPaginaSelecionado = document.getElementById('ownerBallItemsPerPageSelect');
    if (itemsPorPaginaSelecionado) {
        itemsPorPaginaSelecionado.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            loadOwnerBallMarkets();
        });
    }

    // Filtro de data
    const filtroDeData = document.getElementById('ownerBallDateFilter');
    if (filtroDeData) {
        filtroDeData.addEventListener('input', function() {
            console.log('Filtro de data Owner Ball:', this.value);
        })
    }

    // Botão limpar filtro
    const btnLimparFiltro = document.getElementById('clearOwnerBallDateFilter');
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', function() {
            const dataFilter = document.getElementById('ownerBallDateFilter');
            if (dataFilter) {
                dataFilter.value = '';
                loadOwnerBallMarkets();
            }
        })
    }

    // Botão de múltiplas
    const checklistBtn = document.getElementById('mostrarCheckListOwnerBall');
    if (checklistBtn) {
        checklistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Múltiplas Owner Ball - Em desenvolvimento');
            // Implementar funcionalidade de múltiplas se necessário
        });
    }
}

/**
 * Navega para uma página específica
 */
function goToOwnerBallPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    currentPage = page;
    loadOwnerBallMarkets();
}


/**
 * Atualiza os mercados com animação no botão
 */
function refreshOwnerBallMarkets() {
    const btnAtualizar = document.getElementById('updateOwnerBallMarkets');
    const icon = btnAtualizar?.querySelector('i');

    if (icon) {
        icon.classList.add('rotate'); 
    }

    loadOwnerBallMarkets(true);

    // Remove a animação após um tempo
    setTimeout(() => {
        if (icon) {
            icon.classList.remove('rotate');
        }
    }, 1000);
}


/**
 * Mostra erro na tabela
 */
function showOwnerBallError(message) {
    const tableBody = document.getElementById('ownerBallTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${message}
                </td>
            </tr>
        `;
    }
}


/**
 * Funções para ações dos botões (implementar conforme necessário)
 */
window.viewOwnerBallDetails = function(mercado) {
    console.log('Ver detalhes:', mercado);
    // Implementar visualização de detalhes
};

window.acceptOwnerBallMarket = function(mercado) {
    console.log('Aceitar mercado:', mercado);
    // Implementar aceitação do mercado
};

window.rejectOwnerBallMarket = function(mercado) {
    console.log('Recusar mercado:', mercado);
    // Implementar rejeição do mercado
};

window.goToOwnerBallPage = goToOwnerBallPage;

