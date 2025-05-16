/**
 * Inicialização principal do Dashboard
 * Carrega e inicializa todos os módulos do dashboard
 */

import { initUiEnhanced } from './modules/uiEnhanced.js';
import { initTableHandlers } from './modules/table.js';
import { updateMarketStatus } from './modules/marketStatus.js';
import { initFilters } from './modules/filters.js';
// import { setupApostaButtons } from './modules/api.js';
import { setupRefreshButton } from './modules/api.js';
import { setupRecusarModal } from './modules/recusarAposta.js';
import { setupDesfazerAcaoModal } from './modules/desfazerAcao.js';
import { initEntradasEmLote } from './modules/entradas_em_lote.js';
import { setupEditarModal } from './modules/editarOdd.js';
import { setupGerenciaResultado } from './modules/gerencia_aposta/gerencia_resultado.js';
import { initGerenciaCollapses } from './modules/gerencia_aposta/collapse.js';
import { calcularValorDisponivelEntrada } from './modules/ciclo/calcula_disponivel_entrada.js';
import { calcularDataFinalCiclo } from './modules/ciclo/calculo_data_final_ciclo.js';
import { initAceitarApostaModal } from './modules/aceitarApostaModal.js';
import { initMultiplasHandlers } from './modules/multiplas.js';
import { atualizaIconeResultado } from './modules/gerencia_aposta/icone_lista_aposta.js';
import { initThemeToggler } from './theme_toggler.js';



document.addEventListener('DOMContentLoaded', function() {
    // Inicializar collapses do Bootstrap (especialmente importante com o tema personalizado)
    const collapseElementList = document.querySelectorAll('.collapse');
    if (collapseElementList.length && typeof bootstrap !== 'undefined') {
        collapseElementList.forEach(collapseEl => {
            // Não inicializar - apenas garantir que o Bootstrap está disponível
            // new bootstrap.Collapse(collapseEl, { toggle: false });
        });
    }
    // Inicializa o alternador de temas (deve ser inicializado primeiro)
    initThemeToggler();
    // Inicializa componentes de UI
    initUiEnhanced();
    // Inicializa funcionalidades da tabela
    initTableHandlers();
    // Atualiza indicadores de status do mercado
    updateMarketStatus();
    // Incializa filtros
    initFilters();
    // Inicializa funcionalidades da Api
    // setupApostaButtons();
    initAceitarApostaModal();

    setupRefreshButton();
    // Inicializa modal de recusa
    setupRecusarModal();

    // Inicializa modal de desfazer
    setupDesfazerAcaoModal();
    
    // Inicializa modal de editar odd
    setupEditarModal();
    
    // Inicializa checklist
    initEntradasEmLote();
    
    // Inicializa Gerência de Resultado
    setupGerenciaResultado();

    // Inicializa os collapses na tela de gerência de apostas
    initGerenciaCollapses();

    // Incializa o método para calcular o valor diposnivel para a entrada
    calcularValorDisponivelEntrada();

    //Incializa o cálculo final das datas do ciclo
    calcularDataFinalCiclo();

    //Inicializa modal mutlipas entradas
    initMultiplasHandlers();

    // Inicializa componentes de paginação
    if (typeof initPagination === "function") {
        initPagination();
    }

    // Inicializa paginação dinâmica para AJAX
    if (typeof initDynamicPagination === "function") {
        initDynamicPagination();
    }

    // atualizaIconeResultado
    if (typeof atualizaIconeResultado === "function") {
        atualizaIconeResultado();
    }
    
});

// Permite o acesso global aos módulos para debugging
window.modules = {
    table: { initTableHandlers },
    multiplas: { initMultiplasHandlers }
};