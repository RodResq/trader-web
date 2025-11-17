import { atualizaIconeResultado } from './modules/gerencia_aposta/icone_lista_aposta.js';
import { setupApiOwnerBallFavoritoHome } from './modules/owner_ball/api_owner_ball _favorito_home.js';
import { setupApiOwnerBallSuperFavoriteHome } from './modules/owner_ball/api_owner_ball_super_favorite_home.js';
import { initTableHandlers } from './modules/table.js';

function getCurrentRoute() {
    return window.location.pathname;
}

function isRoute(path) {
    return getCurrentRoute().includes(path);
}

function isExactRoute(path) {
    return getCurrentRoute() === path;
}

function  isAnyRoute(...paths) {
    const currentRoute = getCurrentRoute();
    return paths.some(path => currentRoute.includes(path));
} 


const routeModules = {
    
    '/dashboard': [
        {
            name: 'setupApiOwnerBallSuperFavoriteHome',
            module: () => import('./modules/owner_ball/api_owner_ball_super_favorite_home.js').then(m => m.setupApiOwnerBallSuperFavoriteHome)
        },
        {
            name: 'setupGraficoResultadoTotalGanhos',
            module: () => import('./modules/gerencia_aposta/grafico_resultado_total_ganhos.js').then(m => m.setupGraficoResultadoTotalGanhos)
        },
        {
            name: 'setupProgressPerformace',
            module: () => import('./modules/performace/grafico_performace.js').then(m => m.setupProgressPerformace)
        },
        {
            name: 'setupGraficoMelhorDia',
            module: () => import('./modules/evento/grafico_melhor_dia.js').then(m => m.setupGraficoMelhorDia)
        },
        {
            name: 'setupBatchEntriesOwnerBall',
            module: () => import('./modules/owner_ball/entry/batch_entries_owner_ball.js').then(m => m.setupBatchEntriesOwnerBall)
        },
        {
            name: 'setupEventVote',
            module: () => import('./modules/entrada/event_vote.js').then(m => m.setupEventVote),
        },
        {
            name: 'setupStatistic',
            module: () => import('./modules/entrada/statistic.js').then(m => m.setupStatistic)
        },
        {
            name: 'setupStatisticOwnerBall',
            module: () => import('./modules/owner_ball/statistic_owner_ball.js').then(m => m.setupStatisticOwnerBall)
        },
        {
            name: 'setupWinProbability',
            module: () => import('./modules/entrada/win_probability.js').then(m => m.setupWinProbability)
        },
        {
            name: 'setupCompareTeam',
            module: () => import('./modules/entrada/compare_team.js').then(m => m.setupCompareTeam)
        },
    ],
    '/gerencia': [
        {
            name: 'setupGerenciaResultado',
            module: () => import('./modules/gerencia_aposta/gerencia_resultado.js').then(m => m.setupGerenciaResultado)
        },
        {
            name: 'setupGraficoDesempenhoSemanal',
            module: () => import('./modules/gerencia_aposta/gerencia_graficos_principal.js').then(m => m.setupGraficoDesempenhoSemanal)
        },
        {
            name: 'setupGraficoPerformaceSemanal',
            module: () => import('./modules/ciclo/grafico_performace_semanal.js').then(m => m.setupGraficoPerformaceSemanal)
        },
    ],
    '/ciclos': [
        {
            name: 'initCycleOwnerBall',
            module: () => import('./modules/owner_ball/cycle/cycle_owner_ball.js').then(m => m.initCycleOwnerBall)
        },
        {
            name: 'setupEvolucaoSaldoModal',
            module: () => import('./modules/ciclo/evolucao_saldo.js').then(m => m.setupEvolucaoSaldoModal)
        }
    ],
    '/team': [
        {
            name: 'setupTeamList',
            module: () => import('./modules/team/teamList.js').then(m => m.setupTeamList)
        },
        {
            name: 'setupCardEventTeam',
            module: () => import('./modules/team/card_event.js').then(m => m.setupCardEventTeam)
        },
        {
            name: 'setupFindTeam',
            module: () => import('./modules/team/pesquisar.js').then(m => m.setupFindTeam)
        }
    ],
};


const globalModules = [
    { 
        name: 'initThemeToggler',
        init: () => import('./theme_toggler.js').then(m => m.initThemeToggler)
    },
    { 
        name: 'initUiEnhanced',
        init: () => import('./modules/uiEnhanced.js').then(m => m.initUiEnhanced)
    },
    { 
        name: 'initTableHandlers',
        init: () => import('./modules/table.js').then(m => m.initTableHandlers)
    },
    { 
        name: 'updateMarketStatus',
        init: () => import('./modules/marketStatus.js').then(m => m.updateMarketStatus)
    },
    { 
        name: 'initFilters',
        init: () => import('./modules/filters.js').then(m => m.initFilters)
    },
    { 
        name: 'setupRefreshButton',
        init: () => import('./modules/api.js').then(m => m.setupRefreshButton)
    },
    { 
        name: 'setupDesfazerAcaoModal',
        init: () => import('./modules/desfazerAcao.js').then(m => m.setupDesfazerAcaoModal)
    },
    { 
        name: 'initEntradasEmLote',
        init: () => import('./modules/entradas_em_lote.js').then(m => m.initEntradasEmLote)
    },
    { 
        name: 'calcularValorDisponivelEntrada',
        init: () => import('./modules/ciclo/calcula_disponivel_entrada.js').then(m => m.calcularValorDisponivelEntrada)
    },
    { 
        name: 'calcularDataFinalCiclo',
        init: () => import('./modules/ciclo/calculo_data_final_ciclo.js').then(m => m.calcularDataFinalCiclo)
    },
    { 
        name: 'setupUpdateOddChange',
        init: () => import('./modules/update_odd_change.js').then(m => m.setupUpdateOddChange)
    },
    { 
        name: 'setupLinkActivateManager',
        init: () => import('./link_activate_manager.js').then(m => m.setupLinkActivateManager)
    }
];


async function loadRouteModules() {
    const currentRoute = getCurrentRoute();

    for (const [route, modules] of Object.entries(routeModules)) {
        if (isRoute(route)) {

            for (const moduleConfig of modules) {
                try {
                    const setupFunction = await moduleConfig.module();
                    setupFunction();
                    console.log('>>>> Modulo Carregado: ', moduleConfig.name);
                } catch (error) {
                    console.error('Erro ao carregar modulo: ', moduleConfig.name, error);
                }
            }
            
        }
    }
    
}


async function loagGlobalModules() {

    for (const moduleConfig of globalModules) {
        try {
            const setupFunction = await moduleConfig.init();
            setupFunction();
            console.log('>>>> Modulo Carregado: ', moduleConfig.name);
        } catch(error) {
            console.error('Erro ao carregar modulo: ', moduleConfig.name, error);
        }
    }
    
}

document.addEventListener('DOMContentLoaded', async function() {

    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });

    await loagGlobalModules();

    await loadRouteModules();

    if (typeof initPagination === "function") {
        initPagination();
    }

    if (typeof initDynamicPagination === "function") {
        initDynamicPagination();
    }

    if (typeof atualizaIconeResultado === "function") {
        atualizaIconeResultado();
    }
    
});


window.modules = {
    table: { initTableHandlers },
    ownerBall: { setupApiOwnerBallSuperFavoriteHome },
    ownerBallFavoritoHome: { setupApiOwnerBallFavoritoHome },
    debug: {
        getCurrentRoute,
        isRoute,
        isExactRoute,
        isAnyRoute,
        loadedRoute: () => getCurrentRoute()
    }
};

