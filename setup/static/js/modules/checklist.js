/**
 * Módulo de Checklist - Gerencia funcionalidades de checklist para mercados
 */
import { showNotification } from './notifications.js';
import { updateEntryOptionIcon } from './table.js';
import { addCSRFToken } from './token.js';

/**
 * Estado da aplicação para as checkboxes
 */
let checklistVisible = false;
let selectedItems = new Set();

/**
 * Inicializa o botão de mostrar checklist
 */
export function initChecklist() {
    const btnMostrarChecklist = document.getElementById('mostrarCheckList');
    if (!btnMostrarChecklist) return;
    
    btnMostrarChecklist.addEventListener('click', function(e) {
        e.preventDefault();
        toggleChecklist();
    });
    
    // Adicionar um observador de eventos para atualizar checkboxes quando a tabela for atualizada
    // setupTableObserver();
    
    // Inicializar handlers para o modal de múltiplas entradas
    initMultiplaModalHandlers();
}

function getCSRFToken() {
    // Obter o token CSRF dos cookies
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

/**
 * Inicializa handlers para o modal de múltiplas entradas
 */
function initMultiplaModalHandlers() {
    // Configurar handlers para o modal de múltiplas entradas
    const confirmarMultiplaBtn = document.getElementById('confirmarMultiplaBtn');
    const recusarMultiplaBtn = document.getElementById('recusarMultiplaBtn');
    const valorEntradaInput = document.getElementById('valor-entrada-multipla');
    
    if (confirmarMultiplaBtn) {
        confirmarMultiplaBtn.addEventListener('click', () => {
            processarMultipla('aceitar');
        });
    }
    
    if (recusarMultiplaBtn) {
        recusarMultiplaBtn.addEventListener('click', () => {
            processarMultipla('recusar');
        });
    }
    
    if (valorEntradaInput) {
        valorEntradaInput.addEventListener('input', calcularRetornoEsperado);
    }
}

/**
 * Alterna a visibilidade das checkboxes na tabela
 */
function toggleChecklist() {
    checklistVisible = !checklistVisible;
    updateBtnMostrarChecklist();
    
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const headerRow = table.querySelector('thead tr');
    const rows = table.querySelectorAll('tbody tr');
    
    if (checklistVisible) {

        // Adiciona cabeçalho de checkbox
        if (headerRow) {
            const checkboxHeader = document.createElement('th');
            checkboxHeader.className = 'checkbox-cell';
            checkboxHeader.width = '40px';
            headerRow.insertBefore(checkboxHeader, headerRow.firstChild);
        }

        // Adiciona checkboxes a cada linha
        rows.forEach((row, index) => {
            addCheckboxToRow(row, index);
        });
        
        // Adiciona botão de ação em massa
        addBulkActionButtons();

        // Oculta a coluna de ações e desabilita os botões
        toggleActionColumn(false);
    } else {

        // Remove cabeçalho de checkbox
        if (headerRow) {
            const checkboxHeader = headerRow.querySelector('.checkbox-cell');
            if (checkboxHeader) {
                checkboxHeader.remove();
            }
        }

        // Remove checkboxes
        rows.forEach(row => {
            const checkboxCell = row.querySelector('.checkbox-cell');
            if (checkboxCell) {
                checkboxCell.remove();
            }
        });
        
        // Remove botões de ação em massa
        const bulkActionsContainer = document.getElementById('bulkActionsContainer');
        if (bulkActionsContainer) {
            bulkActionsContainer.remove();
        }

        // Mostra a coluna de ações e habilita os botões
        toggleActionColumn(true);
        
        // Limpa seleção
        selectedItems.clear();
    }
}


/**
 * Oculta ou mostra a coluna de ações e desabilita/habilita os botões
 * @param {boolean} show - true para mostrar, false para ocultar
 */
function toggleActionColumn(show) {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    // Ajusta o cabeçalho da tabela
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
        const actionHeader = headerRow.querySelector('th:last-child');
        if (actionHeader) {
            actionHeader.style.display = show ? '' : 'none';
        }
    }
    
    // Ajusta as células de ação em cada linha
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const actionCell = row.querySelector('td:last-child');
        if (actionCell) {
            actionCell.style.display = show ? '' : 'none';
            
            // Desabilita/habilita os botões
            const buttons = actionCell.querySelectorAll('a.btn');
            buttons.forEach(button => {
                button.style.pointerEvents = show ? '' : 'none';
                if (!show) {
                    button.setAttribute('data-original-class', button.className);
                    button.className = button.className + ' disabled';
                } else {
                    const originalClass = button.getAttribute('data-original-class');
                    if (originalClass) {
                        button.className = originalClass;
                        button.removeAttribute('data-original-class');
                    }
                }
            });
        }
    });
}


/**
 * Atualiza o botão de mostrar checklist
 */
function updateBtnMostrarChecklist() {
    const btnMostrarChecklist = document.getElementById('mostrarCheckList');
    if (!btnMostrarChecklist) return;
    
    if (checklistVisible) {
        btnMostrarChecklist.classList.remove('btn-primary');
        btnMostrarChecklist.classList.add('btn-secondary');
        btnMostrarChecklist.setAttribute('title', 'Ocultar checklist');
    } else {
        btnMostrarChecklist.classList.remove('btn-secondary');
        btnMostrarChecklist.classList.add('btn-primary');
        btnMostrarChecklist.setAttribute('title', 'Mostrar checklist');
    }
}

/**
 * Adiciona uma caixa de seleção a uma linha da tabela
 */
function addCheckboxToRow(row, index) {
    // Verifica se a linha já tem checkbox
    if (row.querySelector('.checkbox-cell')) return;
    
    // Obter o ID do evento da primeira célula
    const eventId = row.querySelector('td:first-child').textContent.replace('#', '').trim();
    
    // Criar célula de checkbox
    const cell = document.createElement('td');
    cell.className = 'checkbox-cell';
    
    // Criar o checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'market-checkbox form-check-input';
    checkbox.dataset.eventId = eventId;
    checkbox.dataset.rowIndex = index;
    
    // Obter mais dados da linha para uso no modal
    const mercado = row.querySelector('td:nth-child(2)').textContent.trim();
    const odd = parseFloat(row.querySelector('td:nth-child(3)').textContent.replace(',', '.').trim());
    const dataJogo = row.querySelector('td:nth-child(6)').textContent.trim();
    
    // Adicionar dados ao checkbox para uso no modal
    checkbox.dataset.mercado = mercado;
    checkbox.dataset.odd = odd;
    checkbox.dataset.dataJogo = dataJogo;
    
    // Verificar se o item estava selecionado anteriormente
    if (selectedItems.has(eventId)) {
        checkbox.checked = true;
    }
    
    // Adicionar evento de mudança
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            selectedItems.add(eventId);
            row.classList.add('table-active');
        } else {
            selectedItems.delete(eventId);
            row.classList.remove('table-active');
        }
        
        updateSelectedCount();
    });
    
    // Adicionar checkbox à célula
    cell.appendChild(checkbox);
    
    // Inserir célula no início da linha
    row.insertBefore(cell, row.firstChild);
}

/**
 * Adiciona botões de ação em massa
 */
function addBulkActionButtons() {
    // Verificar se já existem os botões
    if (document.getElementById('bulkActionsContainer')) return;
    
    // Criar container para os botões
    const container = document.createElement('div');
    container.id = 'bulkActionsContainer';
    container.className = 'mb-3 p-3 bg-light rounded border';
    
    // Adicionar contagem de selecionados
    const countBadge = document.createElement('span');
    countBadge.id = 'selectedItemsCount';
    countBadge.className = 'badge bg-primary me-2';
    countBadge.textContent = `0 selecionados`;
    
    // Botão para selecionar todos
    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.className = 'btn btn-sm btn-outline-primary me-2';
    selectAllBtn.innerHTML = '<i class="bi bi-check-all"></i> Selecionar Todos';
    selectAllBtn.addEventListener('click', selectAllItems);
    
    // Botão para limpar seleção
    const clearSelectionBtn = document.createElement('button');
    clearSelectionBtn.type = 'button';
    clearSelectionBtn.className = 'btn btn-sm btn-outline-secondary me-2';
    clearSelectionBtn.innerHTML = '<i class="bi bi-x-circle"></i> Limpar Seleção';
    clearSelectionBtn.addEventListener('click', clearAllSelections);
    
    // Botão para aceitar selecionados
    const acceptSelectedBtn = document.createElement('button');
    acceptSelectedBtn.type = 'button';
    acceptSelectedBtn.className = 'btn btn-sm btn-success me-2';
    acceptSelectedBtn.innerHTML = '<i class="bi bi-check-circle"></i> Aceitar Selecionados';
    acceptSelectedBtn.addEventListener('click', () => abrirModalMultiplas('aceitar'));
    
    // Botão para recusar selecionados
    const rejectSelectedBtn = document.createElement('button');
    rejectSelectedBtn.type = 'button';
    rejectSelectedBtn.className = 'btn btn-sm btn-danger';
    rejectSelectedBtn.innerHTML = '<i class="bi bi-x-circle"></i> Recusar Selecionados';
    rejectSelectedBtn.addEventListener('click', () => abrirModalMultiplas('recusar'));
    
    // Adicionar elementos ao container
    container.appendChild(countBadge);
    container.appendChild(selectAllBtn);
    container.appendChild(clearSelectionBtn);
    container.appendChild(acceptSelectedBtn);
    container.appendChild(rejectSelectedBtn);
    
    // Adicionar container antes da tabela
    const table = document.getElementById('marketsTable');
    if (table) {
        table.parentNode.insertBefore(container, table);
    }
}

/**
 * Atualiza a contagem de itens selecionados
 */
function updateSelectedCount() {
    const countBadge = document.getElementById('selectedItemsCount');
    if (!countBadge) return;
    
    countBadge.textContent = `${selectedItems.size} selecionado${selectedItems.size !== 1 ? 's' : ''}`;
}

/**
 * Seleciona todos os itens na tabela
 */
function selectAllItems() {
    const checkboxes = document.querySelectorAll('.market-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        selectedItems.add(checkbox.dataset.eventId);
        
        const row = checkbox.closest('tr');
        if (row) {
            row.classList.add('table-active');
        }
    });
    
    updateSelectedCount();
}

/**
 * Limpa a seleção de todos os itens
 */
function clearAllSelections() {
    const checkboxes = document.querySelectorAll('.market-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        selectedItems.delete(checkbox.dataset.eventId);
        
        const row = checkbox.closest('tr');
        if (row) {
            row.classList.remove('table-active');
        }
    });
    
    selectedItems.clear();
    updateSelectedCount();
}

/**
 * Abre o modal de entradas múltiplas
 */
function abrirModalMultiplas(action) {
    if (selectedItems.size === 0) {
        showNotification('Selecione pelo menos um item para executar esta ação.', 'warning');
        return;
    }
    
    // Preencher a tabela do modal com os itens selecionados
    preencherTabelaMultiplas();
    
    // Verificar ciclo
    verificarCiclo();
    
    // Definir ação no botão
    const confirmarBtn = document.getElementById('confirmarMultiplaBtn');
    if (confirmarBtn) {
        confirmarBtn.setAttribute('data-action', action);
    }
    
    // Exibir o modal
    const multiplaModal = new bootstrap.Modal(document.getElementById('entradasMultiplasModal'));
    multiplaModal.show();
}

/**
 * Preenche a tabela de múltiplas no modal
 */
function preencherTabelaMultiplas() {
    const tbody = document.getElementById('multipla-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let oddCombinada = 1.0;
    
    // Obter todos os checkboxes marcados
    const checkboxes = document.querySelectorAll('.market-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const eventId = checkbox.dataset.eventId;
        const mercado = checkbox.dataset.mercado;
        const odd = parseFloat(checkbox.dataset.odd.replace(',', '.'));
        const dataJogo = checkbox.dataset.dataJogo;
        
        const tr = document.createElement('tr');
        
        // ID
        const tdId = document.createElement('td');
        tdId.textContent = eventId;
        tr.appendChild(tdId);
        
        // Mercado
        const tdMercado = document.createElement('td');
        tdMercado.textContent = mercado;
        tr.appendChild(tdMercado);
        
        // Odd
        const tdOdd = document.createElement('td');
        tdOdd.textContent = odd.toFixed(2);
        tr.appendChild(tdOdd);
        
        // Data
        const tdData = document.createElement('td');
        tdData.textContent = dataJogo;
        tr.appendChild(tdData);
        
        // Remover
        const tdRemover = document.createElement('td');
        const btnRemover = document.createElement('button');
        btnRemover.className = 'btn btn-sm btn-outline-danger';
        btnRemover.innerHTML = '<i class="bi bi-trash"></i>';
        btnRemover.addEventListener('click', () => {
            removerItemMultipla(eventId);
        });
        tdRemover.appendChild(btnRemover);
        tr.appendChild(tdRemover);
        
        tbody.appendChild(tr);
        
        // Atualiza odd combinada
        oddCombinada *= odd;
    });
    
    // Atualiza a odd combinada no modal
    document.getElementById('odd-combinada').textContent = oddCombinada.toFixed(2);
    
    // Limpa o campo de valor de entrada
    document.getElementById('valor-entrada-multipla').value = '';
    document.getElementById('retorno-esperado').value = '';
}

/**
 * Remove um item da seleção múltipla
 */
function removerItemMultipla(eventId) {
    // Desmarca o checkbox correspondente
    const checkbox = document.querySelector(`.market-checkbox[data-event-id="${eventId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        
        const row = checkbox.closest('tr');
        if (row) {
            row.classList.remove('table-active');
        }
        
        selectedItems.delete(eventId);
        updateSelectedCount();
    }
    
    // Atualiza a tabela no modal
    preencherTabelaMultiplas();
    
    // Verifica se ainda há items selecionados
    if (selectedItems.size === 0) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('entradasMultiplasModal'));
        if (modal) {
            modal.hide();
        }
    } else {
        // Atualiza verificação de ciclo
        verificarCiclo();
    }
}

/**
 * Calcula o retorno esperado com base no valor de entrada
 */
function calcularRetornoEsperado() {
    const valorEntrada = parseFloat(document.getElementById('valor-entrada-multipla').value) || 0;
    const oddCombinada = parseFloat(document.getElementById('odd-combinada').textContent);
    
    const retornoEsperado = valorEntrada * oddCombinada;
    document.getElementById('retorno-esperado').value = retornoEsperado.toFixed(2);
}

/**
 * Verifica o ciclo para os eventos selecionados
 */
function verificarCiclo() {
    const cicloWarning = document.getElementById('ciclo-warning');
    const cicloMultipla = document.getElementById('ciclo-multipla');
    const saldoDisponivel = document.getElementById('saldo-disponivel');
    
    if (!cicloWarning || !cicloMultipla || !saldoDisponivel) return;
    
    // Se não houver items selecionados, não faz nada
    if (selectedItems.size === 0) {
        cicloWarning.classList.add('d-none');
        cicloMultipla.textContent = 'Não definido';
        saldoDisponivel.textContent = '0.00';
        return;
    }
    
    // Obter as datas dos eventos selecionados
    const datas = [];
    const checkboxes = document.querySelectorAll('.market-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const dataJogo = checkbox.dataset.dataJogo;
        if (dataJogo) {
            datas.push(dataJogo);
        }
    });
    
    // Exibir indicador de carregamento
    cicloMultipla.innerHTML = '<i class="bi bi-hourglass-split"></i> Verificando...';
    
    // Fazer requisição para verificar o ciclo
    fetch('/analytics/verificar_ciclo/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ datas: datas })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cicloWarning.classList.add('d-none');
            cicloMultipla.textContent = data.ciclo.categoria + ': ' + 
                                      `${data.ciclo.data_inicial} a ${data.ciclo.data_final}`;
            saldoDisponivel.textContent = data.ciclo.valor_disponivel_entrada.toFixed(2);
            
            // Habilita o botão de confirmar
            document.getElementById('confirmarMultiplaBtn').disabled = false;
            
            // Define um valor de entrada sugerido (10% do disponível)
            const valorEntradaInput = document.getElementById('valor-entrada-multipla');
            if (!valorEntradaInput.value) {
                const valorSugerido = Math.min(
                    data.ciclo.valor_disponivel_entrada * 0.1,
                    data.ciclo.valor_disponivel_entrada
                ).toFixed(2);
                
                valorEntradaInput.value = valorSugerido;
                calcularRetornoEsperado();
            }
        } else {
            cicloWarning.classList.remove('d-none');
            cicloWarning.innerHTML = '<i class="bi bi-exclamation-triangle"></i> ' + data.message;
            cicloMultipla.textContent = 'Não definido';
            saldoDisponivel.textContent = '0.00';
            
            // Desabilita o botão de confirmar
            document.getElementById('confirmarMultiplaBtn').disabled = true;
        }
    })
    .catch(error => {
        console.error('Erro ao verificar ciclo:', error);
        cicloWarning.classList.remove('d-none');
        cicloWarning.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Erro ao verificar ciclo. Por favor, tente novamente.';
        cicloMultipla.textContent = 'Erro';
        saldoDisponivel.textContent = '0.00';
        
        // Desabilita o botão de confirmar
        document.getElementById('confirmarMultiplaBtn').disabled = true;
    });
}

/**
 * Processa uma múltipla (aceitar ou recusar)
 */
function processarMultipla(action) {
    // Verificar se há items selecionados
    if (selectedItems.size === 0) {
        showNotification('Selecione pelo menos um item para executar esta ação.', 'warning');
        return;
    }
    
    // Se for aceitar, verificar valor de entrada
    const valorEntrada = parseFloat(document.getElementById('valor-entrada-multipla').value) || 0;
    if (action === 'aceitar' && valorEntrada <= 0) {
        showNotification('Informe um valor de entrada válido.', 'warning');
        return;
    }
    
    // Preparar dados para envio
    const eventIds = Array.from(selectedItems);
    const oddCombinada = parseFloat(document.getElementById('odd-combinada').textContent);
    const retornoEsperado = parseFloat(document.getElementById('retorno-esperado').value) || 0;
    
    // Desabilitar botões durante o processamento
    const confirmarBtn = document.getElementById('confirmarMultiplaBtn');
    const recusarBtn = document.getElementById('recusarMultiplaBtn');
    
    const btnAtual = action === 'aceitar' ? confirmarBtn : recusarBtn;
    const textoOriginal = btnAtual.innerHTML;
    
    btnAtual.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';
    btnAtual.disabled = true;
    
    if (action === 'aceitar') {
        recusarBtn.disabled = true;
    } else {
        confirmarBtn.disabled = true;
    }
    
    // Enviar requisição
    fetch('/api/entrada_multipla', addCSRFToken({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_ids: eventIds,
            action: action,
            valor_entrada: valorEntrada,
            odd_combinada: oddCombinada,
            retorno_esperado: retornoEsperado
        })
    }))
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Fechar o modal
            bootstrap.Modal.getInstance(document.getElementById('entradasMultiplasModal')).hide();
            
            // Atualizar a UI
            const checkboxes = document.querySelectorAll('.market-checkbox:checked');
            
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.remove('table-active');
                    
                    // Atualiza o ícone de estado da entrada
                    updateEntryOptionIcon(row, action === 'aceitar' ? 'A' : 'R');
                    
                    // Desabilitar botões na linha
                    const actionBtns = row.querySelectorAll('.btn');
                    actionBtns.forEach(btn => {
                        if (btn.classList.contains('apostar-btn') || btn.classList.contains('recusar-btn')) {
                            btn.classList.remove('btn-success', 'btn-danger');
                            btn.classList.add('btn-secondary');
                            btn.disabled = true;
                        }
                    });
                }
            });
            
            // Exibir mensagem de sucesso
            showNotification(
                `${selectedItems.size} ${action === 'aceitar' ? 'aposta(s) aceita(s)' : 'aposta(s) recusada(s)'} com sucesso!`,
                action === 'aceitar' ? 'success' : 'warning'
            );
            
            // Limpar seleção
            selectedItems.clear();
            updateSelectedCount();
            
            // Desativar modo checklist
            toggleChecklist();
        } else {
            // Restaurar botões
            btnAtual.innerHTML = textoOriginal;
            btnAtual.disabled = false;
            
            if (action === 'aceitar') {
                recusarBtn.disabled = false;
            } else {
                confirmarBtn.disabled = false;
            }
            
            // Exibir mensagem de erro
            showNotification(data.message || 'Erro ao processar apostas', 'danger');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        
        // Restaurar botões
        btnAtual.innerHTML = textoOriginal;
        btnAtual.disabled = false;
        
        if (action === 'aceitar') {
            recusarBtn.disabled = false;
        } else {
            confirmarBtn.disabled = false;
        }
        
        showNotification('Erro ao processar apostas', 'danger')
    });
}
