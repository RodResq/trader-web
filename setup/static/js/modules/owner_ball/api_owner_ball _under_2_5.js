/**
 * Módulo para gerenciar a API de mercados Owner Ball
 */

let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let isLoading = false;

export async function setupApiOwnerBallUnder25() {
    console.log('Inicializando API Owner Ball Under 2,5...');

    await loadOwnerBallUnder25Markets();

    setupOwnerBallUnder25EventListeners();
}

/**
 * Carrega os mercados Owner Ball da API
 */
async function loadOwnerBallUnder25Markets(showLoader = true) {
    if (isLoading) return;

    isLoading = true;
    const tableBody = document.getElementById('ownerBallUnder25TableBody');

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

    const url = `/api/owner_ball/under_2_5?page=${currentPage}&items_per_page=${itemsPerPage}`;

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
            updateOwnerBallUnder25Table(data.mercados);
            updateOwnerBallUnder25Pagination(data.pagination);
        } else {
            showOwnerBallUnder25Error('Erro ao carregar mercados owner ball');
            isLoading = false;
        }
    })
    .catch(error => {
        console.error('Erro ao carregar página: ', error);
        showOwnerBallUnder25Error('Erro ao carregar dados. Tente novamente.')
        isLoading = false;
    })
    .finally(() => {
        isLoading = false;
    })
}


function updateOwnerBallUnder25Table(mercados) {
    const tableBody = document.getElementById('ownerBallUnder25TableBody');

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
                    <button class="btn btn-sm btn-info" title="Ver detalhes" onclick="viewOwnerBallUnder25Details('${mercado.mercado}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" title="Aceitar" onclick="acceptOwnerBallUnder25Market('${mercado.mercado}')">
                        <i class="bi bi-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Recusar" onclick="rejectOwnerBallUnder25Market('${mercado.mercado}')">
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
function updateOwnerBallUnder25Pagination(pagination) {
    if (!pagination) return;

    currentPage = pagination.current_page;
    totalPages = pagination.total_pages;
    itemsPerPage = pagination.items_per_page;

    // Atualizar informações da página
    const pageInfo = document.getElementById('ownerBallUnder25PageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `<span>Página ${currentPage} de ${totalPages}</span>`
    }

    // Atualizar lista de paginação
    const paginationList = document.getElementById('ownerBallUnder25PaginationList');
    if (paginationList) {
        paginationList.innerHTML = generateOwnerBallUnder25PaginationHTML();
    }

    // Atualizar select de items por página
    const itemsSelect = document.getElementById('ownerBallUnder25ItemsPerPageSelect');
    if (itemsSelect) {
        itemsSelect.value = itemsPerPage;
    }

    
}


function generateOwnerBallUnder25PaginationHTML() {
    let html = '';

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallUnder25Page(1)" aria-label="First">
                <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
        </li>
    `;

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallUnder25Page(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToOwnerBallUnder25Page(${i})">${i}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallUnder25Page(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallUnder25Page(${totalPages})" aria-label="Last">
                <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
        </li>
    `;
    
    return html;
}


function setupOwnerBallUnder25EventListeners() {
    const btnAtualizar = document.getElementById('atualizarMercadosOwnerBallUnder25');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function(e) {
            e.preventDefault();
            refreshOwnerBallUnder25Markets();
        });
    }

    const itemsPorPaginaSelecionado = document.getElementById('ownerBallUnder25ItemsPerPageSelect');
    if (itemsPorPaginaSelecionado) {
        itemsPorPaginaSelecionado.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            loadOwnerBallUnder25Markets();
        });
    }

    const filtroDeData = document.getElementById('ownerBallUnder25DateFilter');
    if (filtroDeData) {
        filtroDeData.addEventListener('input', function() {
            console.log('Filtro de data Owner Ball:', this.value);
        })
    }

    const btnLimparFiltro = document.getElementById('clearOwnerBallUnder25DateFilter');
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', function() {
            const dataFilter = document.getElementById('ownerBallUnder25DateFilter');
            if (dataFilter) {
                dataFilter.value = '';
                loadOwnerBallUnder25Markets();
            }
        })
    }

    const checklistBtn = document.getElementById('mostrarCheckListOwnerBallUnder25');
    if (checklistBtn) {
        checklistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Múltiplas Owner Ball - Em desenvolvimento');
            // Implementar funcionalidade de múltiplas se necessário
        });
    }
}


function goToOwnerBallUnder25Page(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    currentPage = page;
    loadOwnerBallUnder25Markets();
}


function refreshOwnerBallUnder25Markets() {
    const btnAtualizar = document.getElementById('updateOwnerBallUnder25Markets');
    const icon = btnAtualizar?.querySelector('i');

    if (icon) {
        icon.classList.add('rotate'); 
    }

    loadOwnerBallUnder25Markets(true);

    setTimeout(() => {
        if (icon) {
            icon.classList.remove('rotate');
        }
    }, 1000);
}


function showOwnerBallUnder25Error(message) {
    const tableBody = document.getElementById('ownerBallUnder25TableBody');
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



window.viewOwnerBallUnder25Details = function(mercado) {
    console.log('Ver detalhes:', mercado);
    // Implementar visualização de detalhes
};

window.acceptOwnerBallUnder25Market = function(mercado) {
    console.log('Aceitar mercado:', mercado);
    // Implementar aceitação do mercado
};

window.rejectOwnerBallUnder25Market = function(mercado) {
    console.log('Recusar mercado:', mercado);
    // Implementar rejeição do mercado
};

window.goToOwnerBallUnder25Page = goToOwnerBallUnder25Page;

