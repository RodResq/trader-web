import { setupResultadoEntradaModal } from "../entrada/resultado_green_red.js";
import { setupEditarModal } from "../editarOdd.js";
import { initAceitarApostaModal } from "../aceitarApostaModal.js";
import { setupRecusarModal } from "../recusarAposta.js";
import { setupDesfazerAcaoModal } from "../desfazerAcao.js";
import { setupEventVote } from '../entrada/event_vote.js';
import { setupStatistic } from "../entrada/statistic.js";

let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let isLoading = false;

export function setupApiOwnerBallSuperFavoriteHome() {
    loadOwnerBallMarkets();

}


function loadOwnerBallMarkets(showLoader = true) {
    if (isLoading) return;

    isLoading = true;
    const tableBody = document.getElementById('ownerBallTableBody');

    if (showLoader && tableBody) {
        tableBody.innerHTML = `
            <tr class="align-baseline fw-medium lh-sm" style="font-size: smaller;">
                <td colspan="7" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    const url = `/api/v1/owner_ball/super_favorito?page=${currentPage}&items_per_page=${itemsPerPage}`;

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
            updateOwnerBallTable(data.markets);
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


function updateOwnerBallTable(markets) {
    const tableBody = document.getElementById('ownerBallTableBody');
    if (!tableBody) return;

    if (!markets || markets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Nenhum mercado Owner Ball encontrado.
                </td>
            </tr>
        `;
        return;
    }

    const rows = markets.map(market => {
        const dataFormatada = market.event_date ?
            new Date(market.event_date).toLocaleString('pt-BR'):
            'Data não disponível';

        const getResultIcon = (resultado) => {
            switch(resultado) {
                case "W":
                    return `
                        <span class="icon-soccer">
                            <img src="/static/images/icons/soccer.svg" alt="soccer" class="me-2r" style="width: 15px; height: 15px;">
                        </span>
                    `;
                case "D":
                    return `
                        <span class="icon-soccer-empatou">
                            <img src="/static/images/icons/soccer.svg" alt="soccer" class="me-2r" style="width: 15px; height: 15px; filter: hue-rotate(0deg) saturate(2) brightness(0.8) sepia(1) hue-rotate(-50deg);">
                        </span>
                    `;
                case "L":
                    return `
                        <span class="icon-soccer-perdeu">
                            <img src="/static/images/icons/soccer.svg" alt="soccer" class="me-2r" style="width: 15px; height: 15px;">
                        </span>
                    `;
                default: 
                    return '';
            }
        }

        const getEntryOptionIcon = (resultado) => {
            switch(resultado) {
                case "W":
                    return `<i class="bi-alarm align-middle" style="font-size: 1rem; color: cornflowerblue;"></i>`;
                case "A":
                    return `<i class="bi-check align-middle" style="font-size: 1rem; color: green;"></i>`;
                case "R":
                    return `<i class="bi bi-x align-middle" style="font-size: 1rem; color: red;"></i>`;
            }
        }

        const getEventVote = (result) => {
            switch(result) {
                case "H":
                    return `<i style="color:#198754;" class="icon-vote align-middle fs-6 bi bi-house-up-fill"></i>`;
                case "A":
                    return `<i style="color:#dc3545;" class="icon-vote align-middle fs-6 bi bi-house-down-fill"></i>`;
                default:
                    return '';    
            }
        }

        const getStatisticResult = (result) => {
            if (result) {
                return `<i style="color:#198754;" class="bi bi-bar-chart-line-fill align-middle"></i>`;
            } else {
                return '';
            }
        }

        return `
            <tr data-row-id=${market.id_event} class="tr-ob" data-event-origin="owner-ball">
                <td>
                    <a class="eventBtn btn btn-sm btn-outline-light border-top-0 border-start-0 border-end-0 border-bottom-0 p-1 align-baseline font-weight-bold" 
                        style="font-size: smaller"
                        data-event-id=${market.id_event}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Registrar resultado entrada manualmente.">
                    ${market.id_event || 'N/A'}
                </td>
                <td class="mercado-status">
                    ${getEntryOptionIcon(market.entry_option)}
                    ${getStatisticResult(market.statistic_result)}
                    ${getEventVote(market.event_vote_home)}
                    ${getResultIcon(market.entry_result)}
                </td>
                <td class="mercado-column">
                    <img src="${market.icon_home}"
                        alt="Logo ${market.icon_home}"
                        class="team-logo"
                        style="width: 20px; height: 20px; object-fit: contain;"
                        onerror="this.style.display='none'">
                    <span class="align-middle text-light-emphasis">${market.name_home}</span>
                    <span class="align-middle text-light-emphasis">${market.placar}</span>
                    <img src="${market.icon_away}"
                        alt="Logo ${market.icon_away}"
                        class="team-logo"
                        style="width: 20px; height: 20px; object-fit: contain;"
                        onerror="this.style.display='none'">
                    <span class="align-middle text-light-emphasis">${market.name_away}</span>
                </td>
                <td>
                    ${market.odd}
                    <a id="atualizar-odd-change" class="btn btn-sm odd-change-btn" data-event-id="${market.id_event}" title="Atualizar odd change">
                        <i class="bi bi-arrow-clockwise"></i>
                    </a>
                </td>
                <td>${market.home_actual}%</td>
                <td>${market.away_actual}%</td>
                <td>${dataFormatada || 'N/A'}</td>
                <td class="d-grid gap-4 d-md-block">
                    <a id="editar-odd" class="btn btn-sm btn-info edit-odd-btn" data-event-id=${market.id_event} data-event-origin="owner-ball" title="Editar Odd">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a id="aceitar-aposta" class="btn btn-sm btn-success apostar-btn" data-event-id=${market.id_event} data-event-origin="owner-ball" title="Aceitar aposta">
                        <i class="bi bi-check"></i>
                    </a>
                    <a id="recusar-aposta" class="btn btn-sm btn-danger recusar-btn" data-event-id=${market.id_event} data-event-origin="owner-ball" title="Recusar aposta">
                        <i class="bi bi-x"></i>
                    </a>
                    <a id="desfazer-acao" class="btn btn-sm btn-warning desfazer-acao-btn" data-event-id=${market.id_event} data-event-origin="owner-ball" title="Desfazer ação">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </a>
                    <div class="btn-group" role="group">
                        <a id="btnGroupDrop1" type="button" class="btn bg-body-secondary btn-sm" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                            <li><a class="dropdown-item event-vote" data-event-id=${market.id_event} data-event-origin="owner-ball">Votacao</a></li>
                            <li><a class="dropdown-item event-statistic" data-event-id=${market.id_event} data-event-origin="owner-ball">Estatisticas</a></li>
                            <li><a class="dropdown-item event-probability" data-event-id=${market.id_event} data-event-origin="owner-ball">Probabilidade</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}


function updateOwnerBallPagination(pagination) {
    setTimeout(() => {
        setupEventVote();
        setupStatistic();
    }, 1000);

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
    setupResultadoEntradaModal();
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
                <td colspan="8" class="text-center text-danger">
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

