/**
 * Inicialização principal do Dashboard
 * Carrega e inicializa todos os módulos do dashboard
 */

import { initUi } from './modules/ui.js';
import { initTableHandlers } from './modules/table.js';
import { updateMarketStatus } from './modules/marketStatus.js';
import { initFilters } from './modules/filters.js';
import { setupApostaButtons } from './modules/api.js';
import { setupRefreshButton } from './modules/api.js';
import { setupRecusarModal } from './modules/recusarAposta.js';
import { setupDesfazerAcaoModal } from './modules/desfazerAcao.js';
import { initChecklist } from './modules/checklist.js';

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
    setupApostaButtons();
    setupRefreshButton();

    // Inicializa modal de recusa
    setupRecusarModal();

     // Inicializa modal de desfazer
    setupDesfazerAcaoModal()

    // Inicializa checklist
    initChecklist()
});
