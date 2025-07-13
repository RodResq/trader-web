/**
 * Módulo para gerenciar a API de mercados Owner Ball
 */

let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let isLoading = false;

export async function setupApiOwnerBallFavoritoHome() {
    console.log('Inicializando API Owner Ball...');

    await loadOwnerBallFavoritoHomeMarkets();

    setupOwnerBallFavoritoHomeEventListeners();
}

/**
 * Carrega os mercados Owner Ball da API
 */
async function loadOwnerBallFavoritoHomeMarkets(showLoader = true) {
    if (isLoading) return;

    isLoading = true;
    const tableBody = document.getElementById('ownerBallFavoritoHomeTableBody');

    if (showLoader && tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    const url = `/api/owner_ball/favorito_home?page=${currentPage}&items_per_page=${itemsPerPage}`;

    await fetch(url, {
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
            updateOwnerBallFavoritoHomeTable(data.mercados);
            updateOwnerBallFavoritoHomePagination(data.pagination);
        } else {
            showOwnerBallFavoritoHomeError('Erro ao carregar mercados owner ball');
            isLoading = false;
        }
    })
    .catch(error => {
        console.error('Erro ao carregar página: ', error);
        showOwnerBallFavoritoHomeError('Erro ao carregar dados. Tente novamente.')
        isLoading = false;
    })
    .finally(() => {
        isLoading = false;
    })
}

/**
 * Atualiza a tabela com os dados dos mercados Owner Ball
 */
function updateOwnerBallFavoritoHomeTable(mercados) {
    const tableBody = document.getElementById('ownerBallFavoritoHomeTableBody');

    if (!tableBody) return;
    

    if (!mercados || mercados.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
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
                <td>${mercado.id}</td>
                <td>${mercado.mercado || 'N/A'}</td>
                <td>${mercado.odd || 'N/A'}</td>
                <td>${dataFormatada}</td>
                <td>
                    <button class="btn btn-sm btn-info" title="Ver detalhes" onclick="viewOwnerBallFavoritoHomeDetails('${mercado.mercado}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" title="Aceitar" onclick="acceptOwnerBallFavoritoHomeMarket('${mercado.mercado}')">
                        <i class="bi bi-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Recusar" onclick="rejectOwnerBallFavoritoHomeMarket('${mercado.mercado}')">
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
function updateOwnerBallFavoritoHomePagination(pagination) {
    if (!pagination) return;

    currentPage = pagination.current_page;
    totalPages = pagination.total_pages;
    itemsPerPage = pagination.items_per_page;

    // Atualizar informações da página
    const pageInfo = document.getElementById('ownerBallFavoritoHomePageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `<span>Página ${currentPage} de ${totalPages}</span>`
    }

    // Atualizar lista de paginação
    const paginationList = document.getElementById('ownerBallFavoritoHomePaginationList');
    if (paginationList) {
        paginationList.innerHTML = generateOwnerBallFavoritoHomePaginationHTML();
    }

    // Atualizar select de items por página
    const itemsSelect = document.getElementById('ownerBallFavoritoHomeItemsPerPageSelect');
    if (itemsSelect) {
        itemsSelect.value = itemsPerPage;
    }

    
}


function generateOwnerBallFavoritoHomePaginationHTML() {
    let html = '';

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallFavoritoHomePage(1)" aria-label="First">
                <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
        </li>
    `;

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallFavoritoHomePage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToOwnerBallFavoritoHomePage(${i})">${i}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallFavoritoHomePage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallFavoritoHomePage(${totalPages})" aria-label="Last">
                <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
        </li>
    `;
    
    return html;
}


function setupOwnerBallFavoritoHomeEventListeners() {
    const btnAtualizar = document.getElementById('atualizarMercadosOwnerBallFavoritoHome');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function(e) {
            e.preventDefault();
            refreshOwnerBallFavoritoHomeMarkets();
        });
    }

    const itemsPorPaginaSelecionado = document.getElementById('ownerBallFavoritoHomeItemsPerPageSelect');
    if (itemsPorPaginaSelecionado) {
        itemsPorPaginaSelecionado.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            loadOwnerBallFavoritoHomeMarkets();
        });
    }

    const filtroDeData = document.getElementById('ownerBallFavoritoHomeDateFilter');
    if (filtroDeData) {
        filtroDeData.addEventListener('input', function() {
            console.log('Filtro de data Owner Ball:', this.value);
        })
    }

    const btnLimparFiltro = document.getElementById('clearOwnerBallFavoritoHomeDateFilter');
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', function() {
            const dataFilter = document.getElementById('ownerBallFavoritoHomeDateFilter');
            if (dataFilter) {
                dataFilter.value = '';
                loadOwnerBallFavoritoHomeMarkets();
            }
        })
    }

    const checklistBtn = document.getElementById('mostrarCheckListOwnerBallFavoritoHome');
    if (checklistBtn) {
        checklistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Múltiplas Owner Ball - Em desenvolvimento');
        });
    }
}


function goToOwnerBallFavoritoHomePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    currentPage = page;
    loadOwnerBallFavoritoHomeMarkets();
}


function refreshOwnerBallFavoritoHomeMarkets() {
    const btnAtualizar = document.getElementById('updateOwnerBallFavoritoHomeMarkets');
    const icon = btnAtualizar?.querySelector('i');

    if (icon) {
        icon.classList.add('rotate'); 
    }

    loadOwnerBallFavoritoHomeMarkets(true);

    setTimeout(() => {
        if (icon) {
            icon.classList.remove('rotate');
        }
    }, 1000);
}


function showOwnerBallFavoritoHomeError(message) {
    const tableBody = document.getElementById('ownerBallFavoritoHomeTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${message}
                </td>
            </tr>
        `;
    }
}



window.viewOwnerBallFavoritoHomeDetails = function(mercado) {
    console.log('Ver detalhes:', mercado);
    // Implementar visualização de detalhes
};

window.acceptOwnerBallFavoritoHomeMarket = function(mercado) {
    console.log('Aceitar mercado:', mercado);
    // Implementar aceitação do mercado
};

window.rejectOwnerBallFavoritoHomeMarket = function(mercado) {
    console.log('Recusar mercado:', mercado);
    // Implementar rejeição do mercado
};

window.goToOwnerBallFavoritoHomePage = goToOwnerBallFavoritoHomePage;

