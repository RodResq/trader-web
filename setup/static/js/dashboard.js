/**
 * Inicialização principal do Dashboard
 * Carrega e inicializa todos os módulos do dashboard
 */

import { initUiEnhanced } from './modules/uiEnhanced.js';
import { initTableHandlers } from './modules/table.js';
import { updateMarketStatus } from './modules/marketStatus.js';
import { initFilters } from './modules/filters.js';
import { setupRefreshButton } from './modules/api.js';
import { setupRecusarModal } from './modules/recusarAposta.js';
import { setupDesfazerAcaoModal } from './modules/desfazerAcao.js';
import { initEntradasEmLote } from './modules/entradas_em_lote.js';
import { setupEditarModal } from './modules/editarOdd.js';
import { setupGerenciaResultado } from './modules/gerencia_aposta/gerencia_resultado.js';
import { calcularValorDisponivelEntrada } from './modules/ciclo/calcula_disponivel_entrada.js';
import { calcularDataFinalCiclo } from './modules/ciclo/calculo_data_final_ciclo.js';
import { initAceitarApostaModal } from './modules/aceitarApostaModal.js';
import { initMultiplasHandlers } from './modules/multiplas.js';
import { atualizaIconeResultado } from './modules/gerencia_aposta/icone_lista_aposta.js';
import { initThemeToggler } from './theme_toggler.js';
import { setupApiOwnerBall } from './modules/api_owner_ball.js';
import { setupApiOwnerBallFavoritoHome } from './modules/owner_ball/api_owner_ball _favorito_home.js';
import { setupApiOwnerBallUnder25 } from './modules/owner_ball/api_owner_ball _under_2_5.js';
import { setupUpdateOddChange } from './modules/update_odd_change.js';
import { setupEvolucaoSaldoModal } from './modules/ciclo/evolucao_saldo.js'
import { setupGraficoPerformaceSemanal } from './modules/ciclo/grafico_performace_semanal.js';
import { setupGraficoResultadoAposta } from './modules/gerencia_aposta/grafico_resultado_aposta.js';
import { setupGraficoMelhorDia } from './modules/evento/grafico_melhor_dia.js'
import { setupTemporizadorProximoEvento } from './modules/temporizadorProximoEvento.js';
import { setupProgressPerformace } from './modules/performace/grafico_performace.js';
import { setupProximoEvento } from './modules/evento/proximo_evento.js'



document.addEventListener('DOMContentLoaded', function() {
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

    setupEvolucaoSaldoModal();

    // Incializa gráfico de performace semanal
    setupGraficoPerformaceSemanal();

    // Incializa gráfico de resultado aposta
    setupGraficoResultadoAposta();

    // Inicializa barra de progresso de performace
    setupProgressPerformace();

    // Inicializa API Próximo Evento
    setupProximoEvento();

    // Incializa gráfico de melhor dia semana
    setupGraficoMelhorDia();
   
    // Inicializa API Owner Ball
    setupApiOwnerBall();

    // Inicializa API Owner Ball Favorito Home
    setupApiOwnerBallFavoritoHome();

    // Incializa API Owner Ball Under 2,5
    setupApiOwnerBallUnder25();
    
    //Incializa funcão ayncrona para atualizar odd
    setupUpdateOddChange()

    // Incializa o método para calcular o valor diposnivel para a entrada
    calcularValorDisponivelEntrada();

    //Incializa o cálculo final das datas do ciclo
    calcularDataFinalCiclo();

    //Inicializa modal mutlipas entradas
    initMultiplasHandlers();


    //Incializa temporizador para o próximo evento
    // setupTemporizadorProximoEvento();


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
    multiplas: { initMultiplasHandlers },
    ownerBall: { setupApiOwnerBall },
    ownerBallFavoritoHome: { setupApiOwnerBallFavoritoHome }
};