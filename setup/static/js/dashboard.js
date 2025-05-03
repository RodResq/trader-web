/**
 * Inicialização principal do Dashboard
 * Carrega e inicializa todos os módulos do dashboard
 */

import { initUi } from './modules/ui.js';
import { initTableHandlers } from './modules/table.js';
import { updateMarketStatus } from './modules/marketStatus.js';
import { initFilters } from './modules/filters.js';
// import { setupApostaButtons } from './modules/api.js';
import { setupRefreshButton } from './modules/api.js';
import { setupRecusarModal } from './modules/recusarAposta.js';
import { setupDesfazerAcaoModal } from './modules/desfazerAcao.js';
import { initChecklist } from './modules/checklist.js';
import { setupEditarModal } from './modules/editarOdd.js';
import { setupGerenciaResultado } from './modules/resultado.js';
import { calcularValorDisponivelEntrada } from './modules/ciclo/calcula_disponivel_entrada.js';
import { calcularDataFinalCiclo } from './modules/ciclo/calculo_data_final_ciclo.js';
import { initAceitarApostaModal } from './modules/aceitarApostaModal.js';


document.addEventListener('DOMContentLoaded', function() {
    // Inicializa componentes de UI
    initUi();
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
    initChecklist();

    // Inicializa Gerência de Resultado
    setupGerenciaResultado();

    // Incializa o método para calcular o valor diposnivel para a entrada
    calcularValorDisponivelEntrada();

    //Incializa o cálculo final das datas do ciclo
    calcularDataFinalCiclo();

    //Inicializa modal aceitar aposta
});
