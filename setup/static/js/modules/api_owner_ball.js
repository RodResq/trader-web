import { setupEditarModal } from "./editarOdd.js";
import { initAceitarApostaModal } from "./aceitarApostaModal.js";
import { setupRecusarModal } from "./recusarAposta.js";
import { setupDesfazerAcaoModal } from "./desfazerAcao.js";

let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let isLoading = false;

export function setupApiOwnerBall() {
    console.log('Inicializando API Owner Ball...');
    loadOwnerBallMarkets();

}


function loadOwnerBallMarkets(showLoader = true) {
    if (isLoading) return;

    isLoading = true;
    const tableBody = document.getElementById('ownerBallTableBody');

    if (showLoader && tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
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
            setupOwnerBallEventListeners();

        } else {
            showOwnerBallError('Erro ao carregar mercados owner ball');
            isLoading = false;
        }
    })
    .catch(error => {
        console.error('Erro ao carregar página: ', error);
        showOwnerBallError('Erro ao carregar dados. Tente novamente.')
        isLoading = false;
    })
    .finally(() => {
        isLoading = false;
    })
}


function updateOwnerBallTable(mercados) {
    const tableBody = document.getElementById('ownerBallTableBody');

    if (!tableBody) return;


    if (!mercados || mercados.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
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
                    <span {% if mercado.resultado_estatistica %} 
                        class="btn-sucess resultado-statistic-overall-home"
                        {% else %}
                        class="resultado-statistic-overall-away"
                        {% endif %}>
                        ${mercado.id_event || 'N/A'}
                    </span>
                </td>
                <td class="mercado-column">${mercado.mercado}</td>
                <td>
                    ${mercado.odd}
                    <a id="atualizar-odd-change" class="btn btn-sm odd-change-btn" data-event-id="${mercado.id_event}" title="Atualizar odd change">
                        <i class="bi bi-arrow-clockwise"></i>
                    </a>
                </td>
                <td>${mercado.home_actual}%</td>
                <td>${mercado.away_actual}%</td>
                <td>${dataFormatada || 'N/A'}</td>
                <td>
                    <a id="editar-odd" class="btn btn-sm btn-info edit-odd-btn" data-event-id=${mercado.id_event} title="Editar Odd">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a id="aceitar-aposta" class="btn btn-sm btn-success apostar-btn" data-event-id=${mercado.id_event} title="Aceitar aposta">
                        <i class="bi bi-check"></i>
                    </a>
                    <a id="recusar-aposta" class="btn btn-sm btn-danger recusar-btn" data-event-id=${mercado.id_event} title="Recusar aposta">
                        <i class="bi bi-x"></i>
                    </a>
                    <a id="desfazer-acao" class="btn btn-sm btn-warning desfazer-acao-btn" data-event-id=${mercado.id_event} title="Desfazer ação">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </a>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}


function updateOwnerBallPagination(pagination) {
    if (!pagination) return;

    currentPage = pagination.current_page;
    totalPages = pagination.total_pages;
    itemsPerPage = pagination.items_per_page;

    const pageInfo = document.getElementById('ownerBallPageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `<span>Página ${currentPage} de ${totalPages}</span>`
    }

    const paginationList = document.getElementById('ownerBallPaginationList');
    if (paginationList) {
        paginationList.innerHTML = generateOwnerBallPaginationHTML();
    }

    const itemsSelect = document.getElementById('ownerBallItemsPerPageSelect');
    if (itemsSelect) {
        itemsSelect.value = itemsPerPage;
    }

    
}


function generateOwnerBallPaginationHTML() {
    let html = '';

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(1)" aria-label="First">
                <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
        </li>
    `;

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToOwnerBallPage(${i})">${i}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToOwnerBallPage(${totalPages})" aria-label="Last">
                <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
        </li>
    `;
    
    return html;
}


function setupOwnerBallEventListeners() {
    const btnAtualizar = document.getElementById('atualizarMercadosOwnerBall');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function(e) {
            e.preventDefault();
            refreshOwnerBallMarkets();
        });
    }

    const itemsPorPaginaSelecionado = document.getElementById('ownerBallItemsPerPageSelect');
    if (itemsPorPaginaSelecionado) {
        itemsPorPaginaSelecionado.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            loadOwnerBallMarkets();
        });
    }

    const filtroDeData = document.getElementById('ownerBallDateFilter');
    if (filtroDeData) {
        filtroDeData.addEventListener('input', function() {
            console.log('Filtro de data Owner Ball:', this.value);
        })
    }

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

    const checklistBtn = document.getElementById('mostrarCheckListOwnerBall');
    if (checklistBtn) {
        checklistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Múltiplas Owner Ball - Em desenvolvimento');
            // Implementar funcionalidade de múltiplas se necessário
        });
    }

    // carrega módulos necessários
    setupEditarModal();
    initAceitarApostaModal();
    setupRecusarModal();
    setupDesfazerAcaoModal();
}


function goToOwnerBallPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    currentPage = page;
    loadOwnerBallMarkets();
}


function refreshOwnerBallMarkets() {
    const btnAtualizar = document.getElementById('updateOwnerBallMarkets');
    const icon = btnAtualizar?.querySelector('i');

    if (icon) {
        icon.classList.add('rotate'); 
    }

    loadOwnerBallMarkets(true);

    setTimeout(() => {
        if (icon) {
            icon.classList.remove('rotate');
        }
    }, 1000);
}


function showOwnerBallError(message) {
    const tableBody = document.getElementById('ownerBallTableBody');
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

