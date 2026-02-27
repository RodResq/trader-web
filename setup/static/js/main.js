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
            module: () => import('./modules/owner_ball/api_owner_ball_super_favorite_home.js').then(m => m.setupApiOwnerBallSuperFavoriteHome),
            dependencies: []
        },
        {
            name: 'setupGraficoResultadoTotalGanhos',
            module: () => import('./modules/gerencia_aposta/grafico_resultado_total_ganhos.js').then(m => m.setupGraficoResultadoTotalGanhos),
            dependencies: []
        },
        {
            name: 'setupProgressPerformace',
            module: () => import('./modules/performace/grafico_performace.js').then(m => m.setupProgressPerformace),
            dependencies: []
        },
        {
            name: 'setupGraficoMelhorDia',
            module: () => import('./modules/evento/grafico_melhor_dia.js').then(m => m.setupGraficoMelhorDia),
            dependencies: []
        },
        {
            name: 'setupBatchEntriesOwnerBall',
            module: () => import('./modules/owner_ball/entry/batch_entries_owner_ball.js').then(m => m.setupBatchEntriesOwnerBall),
            dependencies: ['setupApiOwnerBallSuperFavoriteHome']
        },
        {
            name: 'setupEventVote',
            module: () => import('./modules/entrada/event_vote.js').then(m => m.setupEventVote),
            dependencies: ['setupApiOwnerBallSuperFavoriteHome']
        },
        {
            name: 'setupStatistic',
            module: () => import('./modules/entrada/statistic.js').then(m => m.setupStatistic),
            dependencies: ['setupApiOwnerBallSuperFavoriteHome']
        },
        {
            name: 'setupStatisticOwnerBall',
            module: () => import('./modules/owner_ball/statistic_owner_ball.js').then(m => m.setupStatisticOwnerBall),
            dependencies: ['setupApiOwnerBallSuperFavoriteHome']
        },
        {
            name: 'setupWinProbability',
            module: () => import('./modules/entrada/win_probability.js').then(m => m.setupWinProbability),
            dependencies: ['setupApiOwnerBallSuperFavoriteHome']
        },
        {
            name: 'setupCompareTeam',
            module: () => import('./modules/entrada/compare_team.js').then(m => m.setupCompareTeam),
            dependencies: ['setupApiOwnerBallSuperFavoriteHome']
        },
        {
            name: 'setupPredictions',
            module: () => import('./modules/entrada/predictions.js').then(m => m.setupPredictions)
        },
        {
            name: 'setupBtnIa',
            module: () => import('./modules/entrada/ia.js').then(m => m.setupIA)
        }   
    ],
    '/gerencia': [
        {
            name: 'setupGerenciaResultado',
            module: () => import('./modules/gerencia_aposta/gerencia_resultado.js').then(m => m.setupGerenciaResultado),
            dependencies: []
        },
        {
            name: 'setupGraficoDesempenhoSemanal',
            module: () => import('./modules/gerencia_aposta/gerencia_graficos_principal.js').then(m => m.setupGraficoDesempenhoSemanal),
            dependencies: ['setupGerenciaResultado']
        },
        {
            name: 'setupGraficoPerformaceSemanal',
            module: () => import('./modules/ciclo/grafico_performace_semanal.js').then(m => m.setupGraficoPerformaceSemanal),
            dependencies: ['setupGerenciaResultado']
        },
    ],
    '/ciclos': [
        {
            name: 'initCycleOwnerBall',
            module: () => import('./modules/owner_ball/cycle/cycle_owner_ball.js').then(m => m.initCycleOwnerBall),
            dependencies: []
        },
        {
            name: 'setupEvolucaoSaldoModal',
            module: () => import('./modules/ciclo/evolucao_saldo.js').then(m => m.setupEvolucaoSaldoModal),
            dependencies: ['initCycleOwnerBall']
        }
    ],
    '/team': [
        {
            name: 'setupTeamList',
            module: () => import('./modules/team/teamList.js').then(m => m.setupTeamList),
            dependencies: []
        },
        {
            name: 'setupCardEventTeam',
            module: () => import('./modules/team/card_event.js').then(m => m.setupCardEventTeam),
            dependencies: []
        },
        {
            name: 'setupFindTeam',
            module: () => import('./modules/team/pesquisar.js').then(m => m.setupFindTeam),
            dependencies: []
        }
    ],
    '/unique-tournaments': [
        {
            name: 'setupTournamentList',
            module: () => import('./modules/tournament/tournamentList.js').then(m => m.setupTournamentList),
            dependencies: []
        }, 
        {
            name: 'initRefreshUniqueTournament',
            module: () => import('./modules/tournament/refreshUniqueTournament.js').then(m => m.initRefresUniqueTournament),
            dependencies: ['setupTournamentList']
        }
    ]
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
        name: 'initApiClient',
        init: () => import('./modules/shared/apiClient.js').then(m => m.initApiClient)
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
    },
    {
        name: 'initMessage',
        init: () => import('./modules/shared/message.js').then(m => m.showMensagem)
    },
    {
        name: 'initConvertTimestampToDate',
        init: () => import('./modules/shared/convertTimestampDate.js').then(m => m.convertTimestampToDate)
    },
    {
        name: 'initFormatDate',
        init: () => import('./modules/shared/formatDate.js').then(m => m.formatDate)
    }
];


async function loadRouteModules() {
    const currentRoute = getCurrentRoute();
    const loadedModules = {};

    for (const [route, modules] of Object.entries(routeModules)) {
        if (isRoute(route)) {
            console.log(`Carregando módulos da rota: ${route}`);

            const independent = modules.filter(
                m => !m.dependencies || m.dependencies.length === 0
            );

            const dependent = modules.filter(
                m => m.dependencies && m.dependencies.length > 0
            );

            if (independent.length > 0) {
                console.log(`Carregando ${independent.length} módulos independentes em paralelo...`);
                await Promise.all(
                    independent.map(moduleConfig => 
                        loadModule(moduleConfig, loadedModules)
                    )
                );
            }

            if (dependent.length > 0) {
                console.log(`Carregando ${dependent.length} módulos com dependências...`);
                await Promise.all(
                    dependent.map(moduleConfig => 
                        loadModule(moduleConfig, loadedModules)
                    )
                );
            }
            
        }
    }
    
}


async function loadModule(moduleConfig, loadedModules) {
    try {
        if (moduleConfig.dependencies && moduleConfig.dependencies.length > 0) {
            console.log(`${moduleConfig.name} aguardando: [${moduleConfig.dependencies.join(', ')}]`);

            const dependencyPromisse = moduleConfig.dependencies.map(dep => {
                if (!loadedModules[dep]) {
                    throw new Error(`Dependência não encontrada: ${dep} (requerida por ${moduleConfig.name})`);
                }

                return loadedModules[dep]
            });

            await Promise.all(dependencyPromisse);
            console.log(`Dependências prontas para ${moduleConfig.name}`);
        }

        const setupFunction = await moduleConfig.module();
        await setupFunction();
        
        loadedModules[moduleConfig.name] = Promise.resolve();
        console.log(`Modulo Carregado: ${moduleConfig.name}`);

    } catch(error) {
        loadedModules[moduleConfig.name] = Promise.reject(error);
        console.error(`Erro ao carregar modulo: ${moduleConfig.name}`, error.message);
    }

}


async function loagGlobalModules() {
    console.log('Carregando módulos globais...');

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

    console.log('DOM Carregado - Iniciando sistema de módulos...');

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

     console.log('Sistema de módulos inicializado com sucesso!');
    
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
        loadedRoute: () => getCurrentRoute(),
        testDependencies: (routeName) => {
            const route = routeModules[routeName];
            if (!route) {
                console.log(`Rota ${routeName} não encontrada`);
                return;
            }

            console.table(route.map(m => ({
                name: m.name,
                dependencies: m.dependencies.length > 0 ? m.dependencies.join(', ') : 'NENHUMA'
            })));
        }
    }
};

