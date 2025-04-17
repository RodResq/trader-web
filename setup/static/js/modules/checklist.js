/**
 * Módulo de Checklist - Gerencia funcionalidades de checklist para mercados
 */
import { showNotification } from './notifications.js';

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
    setupTableObserver();
}

/**
 * Alterna a visibilidade das checkboxes na tabela
 */
function toggleChecklist() {
    checklistVisible = !checklistVisible;
    updateBtnMostrarChecklist();
    
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    if (checklistVisible) {
        // Adiciona checkboxes a cada linha
        rows.forEach((row, index) => {
            addCheckboxToRow(row, index);
        });
        
        // Adiciona botão de ação em massa
        addBulkActionButtons();

        // Oculta a coluna de ações e desabilita os botões
        toggleActionColumn(false);
    } else {
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
    acceptSelectedBtn.addEventListener('click', () => bulkAction('aceitar'));
    
    // Botão para recusar selecionados
    const rejectSelectedBtn = document.createElement('button');
    rejectSelectedBtn.type = 'button';
    rejectSelectedBtn.className = 'btn btn-sm btn-danger';
    rejectSelectedBtn.innerHTML = '<i class="bi bi-x-circle"></i> Recusar Selecionados';
    rejectSelectedBtn.addEventListener('click', () => bulkAction('recusar'));
    
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
 * Executa uma ação em massa nos itens selecionados
 */
function bulkAction(action) {
    if (selectedItems.size === 0) {
        showNotification('Selecione pelo menos um item para executar esta ação.', 'warning');
        return;
    }
    
    let confirmMessage = '';
    
    if (action === 'aceitar') {
        confirmMessage = `Deseja aceitar ${selectedItems.size} aposta${selectedItems.size !== 1 ? 's' : ''}?`;
    } else if (action === 'recusar') {
        confirmMessage = `Deseja recusar ${selectedItems.size} aposta${selectedItems.size !== 1 ? 's' : ''}?`;
    }
    
    if (confirm(confirmMessage)) {
        // Simulação de processamento
        showNotification(`Processando ${selectedItems.size} item(s)...`, 'info');
        
        // Lógica para processar a ação em lote seria implementada aqui
        // Por enquanto, apenas uma simulação
        setTimeout(() => {
            if (action === 'aceitar') {
                processAcceptItems();
            } else if (action === 'recusar') {
                processRejectItems();
            }
        }, 1000);
    }
}

/**
 * Processa a aceitação de itens em lote
 */
function processAcceptItems() {
    const checkboxes = document.querySelectorAll('.market-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row) {
            row.classList.remove('table-active');
            row.classList.add('table-success');
            
            // Desabilitar botão de aceitar na linha
            const acceptBtn = row.querySelector('.apostar-btn');
            if (acceptBtn) {
                acceptBtn.classList.remove('btn-success');
                acceptBtn.classList.add('btn-secondary');
                acceptBtn.innerHTML = '<i class="bi bi-check-all"></i>';
                acceptBtn.disabled = true;
            }
        }
    });
    
    showNotification(`${selectedItems.size} aposta(s) aceita(s) com sucesso!`, 'success');
    selectedItems.clear();
    updateSelectedCount();
}

/**
 * Processa a recusa de itens em lote
 */
function processRejectItems() {
    const checkboxes = document.querySelectorAll('.market-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row) {
            row.classList.remove('table-active');
            row.classList.add('table-danger');
            
            // Desabilitar botão de aceitar na linha
            const acceptBtn = row.querySelector('.apostar-btn');
            if (acceptBtn) {
                acceptBtn.classList.remove('btn-success');
                acceptBtn.classList.add('btn-secondary');
                acceptBtn.disabled = true;
            }
        }
    });
    
    showNotification(`${selectedItems.size} aposta(s) recusada(s) com sucesso!`, 'warning');
    selectedItems.clear();
    updateSelectedCount();
}

/**
 * Configura um observador para a tabela para reagir a mudanças dinâmicas
 */
function setupTableObserver() {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    // Observar mudanças no corpo da tabela
    const observer = new MutationObserver(mutations => {
        // Se o checklist estiver visível, adicionar checkboxes às novas linhas
        if (checklistVisible) {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.tagName === 'TR') {
                            // Verificar se a linha já tem checkbox
                            if (!node.querySelector('.checkbox-cell')) {
                                // Adicionar checkbox com índice baseado na posição na tabela
                                const rows = table.querySelectorAll('tbody tr');
                                const index = Array.from(rows).indexOf(node);
                                if (index !== -1) {
                                    addCheckboxToRow(node, index);
                                }
                            }
                        }
                    });
                }
            });
        }
    });
    
    // Observar o tbody da tabela
    const tbody = table.querySelector('tbody');
    if (tbody) {
        observer.observe(tbody, { childList: true, subtree: true });
    }
}
