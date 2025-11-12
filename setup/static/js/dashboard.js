import { initUiEnhanced } from './modules/uiEnhanced.js';
import { initTableHandlers } from './modules/table.js';
import { updateMarketStatus } from './modules/marketStatus.js';
import { initFilters } from './modules/filters.js';
import { setupRefreshButton } from './modules/api.js';
import { setupDesfazerAcaoModal } from './modules/desfazerAcao.js';
import { initEntradasEmLote } from './modules/entradas_em_lote.js';
import { setupGerenciaResultado } from './modules/gerencia_aposta/gerencia_resultado.js';
import { calcularValorDisponivelEntrada } from './modules/ciclo/calcula_disponivel_entrada.js';
import { calcularDataFinalCiclo } from './modules/ciclo/calculo_data_final_ciclo.js';
import { atualizaIconeResultado } from './modules/gerencia_aposta/icone_lista_aposta.js';
import { initThemeToggler } from './theme_toggler.js';
import { setupApiOwnerBallSuperFavoriteHome } from './modules/owner_ball/api_owner_ball_super_favorite_home.js';
import { setupApiOwnerBallFavoritoHome } from './modules/owner_ball/api_owner_ball _favorito_home.js';
import { setupApiOwnerBallUnder25 } from './modules/owner_ball/api_owner_ball _under_2_5.js';
import { setupUpdateOddChange } from './modules/update_odd_change.js';
import { setupEvolucaoSaldoModal } from './modules/ciclo/evolucao_saldo.js'
import { setupGraficoPerformaceSemanal } from './modules/ciclo/grafico_performace_semanal.js';
import { setupGraficoResultadoTotalGanhos } from './modules/gerencia_aposta/grafico_resultado_total_ganhos.js';
import { setupGraficoMelhorDia } from './modules/evento/grafico_melhor_dia.js'
import { setupGraficoDesempenhoSemanal } from './modules/gerencia_aposta/gerencia_graficos_principal.js';
import { setupProgressPerformace } from './modules/performace/grafico_performace.js';
import { setupCardEventTeam } from './modules/team/card_event.js';
import { setupFindTeam } from './modules/team/pesquisar.js';
import { setupEventVote } from './modules/entrada/event_vote.js';
import { setupStatistic } from './modules/entrada/statistic.js';
import { setupLinkActivateManager } from './link_activate_manager.js';
import { initCycleOwnerBall } from './modules/owner_ball/cycle/cycle_owner_ball.js';
import { setupWinProbability } from './modules/entrada/win_probability.js';
import { setupCompareTeam } from './modules/entrada/compare_team.js';
import { setupBatchEntriesOwnerBall } from './modules/owner_ball/entry/batch_entries_owner_ball.js';




document.addEventListener('DOMContentLoaded', function() {

    // Inicializar tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip)
    });

    setupLinkActivateManager();
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
    
    // Inicializa checklist
    setupRefreshButton();
    
    // Inicializa Entrada em Lote Score Data
    initEntradasEmLote();

    // Inicializa entradas em lote Owner Ball
    setupBatchEntriesOwnerBall();
    
    // Inicializa API Owner Ball
    setupApiOwnerBallSuperFavoriteHome();
    
    // Inicializa API Owner Ball Favorito Home
    setupApiOwnerBallFavoritoHome();
    
    // Incializa API Owner Ball Under 2,5
    setupApiOwnerBallUnder25();

    // Inicializa modal de desfazer
    setupDesfazerAcaoModal();
    
    // Inicializa Gerência de Resultado
    setupGerenciaResultado();

    setupEvolucaoSaldoModal();

    // Incializa gráfico gerencia apostas de performace semanal
    setupGraficoDesempenhoSemanal()

    // Incializa gráfico de performace semanal
    setupGraficoPerformaceSemanal();

    // Incializa gráfico de resultado aposta
    setupGraficoResultadoTotalGanhos();

    // Inicializa barra de progresso de performace
    setupProgressPerformace();

    // Inicializa API Próximo Evento
    // setupProximoEvento();

    // Incializa gráfico de melhor dia semana
    setupGraficoMelhorDia();
   
    //Incializa funcão ayncrona para atualizar odd
    setupUpdateOddChange()

    // Incializa o método para calcular o valor diposnivel para a entrada
    calcularValorDisponivelEntrada();

    //Incializa o cálculo final das datas do ciclo
    calcularDataFinalCiclo();

    // Incializa cards do team eventos
    setupCardEventTeam();

    // Incializa pesquisa pelo nome do team
    setupFindTeam();

    // Incializa resultado event vote
    setTimeout(() => {
        setupEventVote();
    }, 1000);

    // Incializa a busca api statistica
    setTimeout(() => {
        setupStatistic();
    }, 1000);

    setTimeout(() => {
        setupWinProbability();
    }, 1000)
    

    // Incializa a busca api compare team
    setTimeout(() => {
        setupCompareTeam();
    }, 1000);


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

    // Inicializa Modal Cycle Owner Ball
    initCycleOwnerBall();
    
});

// Permite o acesso global aos módulos para debugging
window.modules = {
    table: { initTableHandlers },
    ownerBall: { setupApiOwnerBall: setupApiOwnerBallSuperFavoriteHome },
    ownerBallFavoritoHome: { setupApiOwnerBallFavoritoHome }
};