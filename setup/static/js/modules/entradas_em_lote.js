import { showNotification } from './notifications.js';
import { updateEntryOptionIcon } from './table.js';
import { addCSRFToken } from './token.js';

let checklistVisible = false;
let selectedItems = new Set();


export function initEntradasEmLote() {
    const btnMostrarChecklist = document.getElementById('mostrarCheckList');
    if (!btnMostrarChecklist) return;
    
    btnMostrarChecklist.addEventListener('click', function(e) {
        e.preventDefault();
        toggleChecklist();
    });
    
    initMultiplaModalHandlers();
}


function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}


function initMultiplaModalHandlers() {
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


function toggleChecklist() {
    checklistVisible = !checklistVisible;
    updateBtnMostrarChecklist();
    
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const headerRow = table.querySelector('thead tr');
    const rows = table.querySelectorAll('tbody tr');
    
    if (checklistVisible) {

        if (headerRow) {
            const checkboxHeader = document.createElement('th');
            checkboxHeader.className = 'checkbox-cell';
            checkboxHeader.width = '40px';
            headerRow.insertBefore(checkboxHeader, headerRow.firstChild);
        }

        rows.forEach((row, index) => {
            addCheckboxToRow(row, index);
        });
        
        addBulkActionButtons();

        toggleActionColumn(false);
    } else {
        if (headerRow) {
            const checkboxHeader = headerRow.querySelector('.checkbox-cell');
            if (checkboxHeader) {
                checkboxHeader.remove();
            }
        }
        rows.forEach(row => {
            const checkboxCell = row.querySelector('.checkbox-cell');
            if (checkboxCell) {
                checkboxCell.remove();
            }
        });
        
        const bulkActionsContainer = document.getElementById('bulkActionsContainer');
        if (bulkActionsContainer) {
            bulkActionsContainer.remove();
        }
        toggleActionColumn(true);
        
        selectedItems.clear();
    }
}


function toggleActionColumn(show) {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
        const actionHeader = headerRow.querySelector('th:last-child');
        if (actionHeader) {
            actionHeader.style.display = show ? '' : 'none';
        }
    }
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const actionCell = row.querySelector('td:last-child');
        if (actionCell) {
            actionCell.style.display = show ? '' : 'none';
            
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


function addCheckboxToRow(row, index) {
    if (row.querySelector('.checkbox-cell')) return;
    
    const eventId = row.querySelector('td:first-child').textContent.replace('#', '').trim();
    
    const cell = document.createElement('td');
    cell.className = 'checkbox-cell';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'market-checkbox form-check-input';
    checkbox.dataset.eventId = eventId;
    checkbox.dataset.rowIndex = index;
    
    const mercado = row.querySelector('td:nth-child(3)').textContent.trim();
    const odd = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace(',', '.').trim());
    const dataJogo = row.querySelector('td:nth-child(7)').textContent.trim();
    
    checkbox.dataset.mercado = mercado;
    checkbox.dataset.odd = odd;
    checkbox.dataset.dataJogo = dataJogo;
    
    if (selectedItems.has(eventId)) {
        checkbox.checked = true;
    }
    
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
    
    cell.appendChild(checkbox);
    row.insertBefore(cell, row.firstChild);
}


function addBulkActionButtons() {
    if (document.getElementById('bulkActionsContainer')) return;
    
    const container = document.createElement('div');
    container.id = 'bulkActionsContainer';
    container.className = 'mb-3 p-3 bg-light rounded border';
    
    const countBadge = document.createElement('span');
    countBadge.id = 'selectedItemsCount';
    countBadge.className = 'badge bg-primary me-2';
    countBadge.textContent = `0 selecionados`;
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.className = 'btn btn-sm btn-outline-primary me-2';
    selectAllBtn.innerHTML = '<i class="bi bi-check-all"></i> Selecionar Todos';
    selectAllBtn.addEventListener('click', selectAllItems);
    
    const clearSelectionBtn = document.createElement('button');
    clearSelectionBtn.type = 'button';
    clearSelectionBtn.className = 'btn btn-sm btn-outline-secondary me-2';
    clearSelectionBtn.innerHTML = '<i class="bi bi-x-circle"></i> Limpar Seleção';
    clearSelectionBtn.addEventListener('click', clearAllSelections);
    
    const acceptSelectedBtn = document.createElement('button');
    acceptSelectedBtn.type = 'button';
    acceptSelectedBtn.className = 'btn btn-sm btn-success me-2';
    acceptSelectedBtn.innerHTML = '<i class="bi bi-check-circle"></i> Aceitar Selecionados';
    acceptSelectedBtn.addEventListener('click', () => abrirModalMultiplas('aceitar'));
    
    const rejectSelectedBtn = document.createElement('button');
    rejectSelectedBtn.type = 'button';
    rejectSelectedBtn.className = 'btn btn-sm btn-danger';
    rejectSelectedBtn.innerHTML = '<i class="bi bi-x-circle"></i> Recusar Selecionados';
    rejectSelectedBtn.addEventListener('click', () => abrirModalMultiplas('recusar'));
    
    container.appendChild(countBadge);
    container.appendChild(selectAllBtn);
    container.appendChild(clearSelectionBtn);
    container.appendChild(acceptSelectedBtn);
    container.appendChild(rejectSelectedBtn);
    
    const table = document.getElementById('marketsTable');
    if (table) {
        table.parentNode.insertBefore(container, table);
    }
}


function updateSelectedCount() {
    const countBadge = document.getElementById('selectedItemsCount');
    if (!countBadge) return;
    
    countBadge.textContent = `${selectedItems.size} selecionado${selectedItems.size !== 1 ? 's' : ''}`;
}


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


function abrirModalMultiplas(action) {
    if (selectedItems.size === 0) {
        showNotification('Selecione pelo menos um item para executar esta ação.', 'warning');
        return;
    }
    
    preencherTabelaMultiplas();
    verificarCiclo();
    
    const confirmarBtn = document.getElementById('confirmarMultiplaBtn');
    if (confirmarBtn) {
        confirmarBtn.setAttribute('data-action', action);
    }
    
    const multiplaModal = new bootstrap.Modal(document.getElementById('entradasMultiplasModal'));
    multiplaModal.show();
}


function preencherTabelaMultiplas() {
    const tbody = document.getElementById('multipla-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let oddCombinada = 1.0;
    
    const checkboxes = document.querySelectorAll('.market-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const eventId = checkbox.dataset.eventId;
        const mercado = checkbox.dataset.mercado;
        const odd = parseFloat(checkbox.dataset.odd.replace(',', '.'));
        const dataJogo = checkbox.dataset.dataJogo;
        
        const tr = document.createElement('tr');
        
        const tdId = document.createElement('td');
        tdId.textContent = eventId;
        tr.appendChild(tdId);
        
        const tdMercado = document.createElement('td');
        tdMercado.textContent = mercado;
        tr.appendChild(tdMercado);
        
        const tdOdd = document.createElement('td');
        tdOdd.textContent = odd.toFixed(2);
        tr.appendChild(tdOdd);
        
        const tdData = document.createElement('td');
        tdData.textContent = dataJogo;
        tr.appendChild(tdData);
        
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
        oddCombinada *= odd;
    });
    
    document.getElementById('odd-combinada').textContent = oddCombinada.toFixed(2);
    
    document.getElementById('valor-entrada-multipla').value = '';
    document.getElementById('retorno-esperado').value = '';
}


function removerItemMultipla(eventId) {
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
    
    preencherTabelaMultiplas();
    
    if (selectedItems.size === 0) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('entradasMultiplasModal'));
        if (modal) {
            modal.hide();
        }
    } else {
        verificarCiclo();
    }
}


function calcularRetornoEsperado() {
    const valorEntrada = parseFloat(document.getElementById('valor-entrada-multipla').value) || 0;
    const oddCombinada = parseFloat(document.getElementById('odd-combinada').textContent);
    
    const retornoEsperado = valorEntrada * oddCombinada;
    document.getElementById('retorno-esperado').value = retornoEsperado.toFixed(2);
}


function verificarCiclo() {
    const cicloWarning = document.getElementById('ciclo-warning');
    const cicloMultipla = document.getElementById('ciclo-multipla');
    const saldoDisponivel = document.getElementById('saldo-disponivel');
    
    if (!cicloWarning || !cicloMultipla || !saldoDisponivel) return;
    
    if (selectedItems.size === 0) {
        cicloWarning.classList.add('d-none');
        cicloMultipla.textContent = 'Não definido';
        saldoDisponivel.textContent = '0.00';
        return;
    }
    
    const datas = [];
    const checkboxes = document.querySelectorAll('.market-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const dataJogo = checkbox.dataset.dataJogo;
        if (dataJogo) {
            datas.push(dataJogo);
        }
    });

    const datasOrdenadas = datas.reverse();
    
    cicloMultipla.innerHTML = '<i class="bi bi-hourglass-split"></i> Verificando...';
    
    fetch('api/v1/analytics/verificar_ciclo/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ datas: datasOrdenadas })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cicloWarning.classList.add('d-none');
            cicloMultipla.textContent = data.ciclo.categoria + ': ' + 
                                      `${data.ciclo.data_inicial} a ${data.ciclo.data_final}`;
            saldoDisponivel.textContent = data.ciclo.valor_disponivel_entrada.toFixed(2);
            
            document.getElementById('confirmarMultiplaBtn').disabled = false;
            
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
            
            document.getElementById('confirmarMultiplaBtn').disabled = true;
        }
    })
    .catch(error => {
        console.error('Erro ao verificar ciclo:', error);
        cicloWarning.classList.remove('d-none');
        cicloWarning.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Erro ao verificar ciclo. Por favor, tente novamente.';
        cicloMultipla.textContent = 'Erro';
        saldoDisponivel.textContent = '0.00';
        
        document.getElementById('confirmarMultiplaBtn').disabled = true;
    });
}


function processarMultipla(action) {
    if (selectedItems.size === 0) {
        showNotification('Selecione pelo menos um item para executar esta ação.', 'warning');
        return;
    }
    
    const valorEntrada = parseFloat(document.getElementById('valor-entrada-multipla').value) || 0;
    if (action === 'aceitar' && valorEntrada <= 0) {
        showNotification('Informe um valor de entrada válido.', 'warning');
        return;
    }
    
    const eventIds = Array.from(selectedItems);
    const oddCombinada = parseFloat(document.getElementById('odd-combinada').textContent);
    const retornoEsperado = parseFloat(document.getElementById('retorno-esperado').value) || 0;
    
    const confirmarBtn = document.getElementById('confirmarMultiplaBtn');
    const recusarBtn = document.getElementById('recusarMultiplaBtn');
    
    const btnAtual = action === 'aceitar' ? confirmarBtn : recusarBtn;
    const textoOriginal = btnAtual.innerHTML;
    
    btnAtual.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';
    btnAtual.disabled = true;

    const valorMultiplaRateado = valorEntrada / eventIds.length;
    const retornoMultiplaRateado = parseFloat((retornoEsperado / eventIds.length).toFixed(2));
    
    if (action === 'aceitar') {
        recusarBtn.disabled = true;
    } else {
        confirmarBtn.disabled = true;
    }
    
    fetch('/api/v1/entrada_multipla', addCSRFToken({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_ids: eventIds,
            action: action,
            valor_entrada_total: valorEntrada,
            valor_entrada_rateado: valorMultiplaRateado,
            odd_combinada: oddCombinada,
            retorno_esperado: retornoMultiplaRateado
        })
    }))
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('entradasMultiplasModal')).hide();
            atualizarValorDisponivel(valorEntrada);
            
            const checkboxes = document.querySelectorAll('.market-checkbox:checked');
            
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.remove('table-active');
                    
                    updateEntryOptionIcon(true, row, action === 'aceitar' ? 'A' : 'R');
                    
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
            showNotification(
                `${selectedItems.size} ${action === 'aceitar' ? 'aposta(s) aceita(s)' : 'aposta(s) recusada(s)'} com sucesso!`,
                action === 'aceitar' ? 'success' : 'warning'
            );
            selectedItems.clear();
            updateSelectedCount();
            toggleChecklist();
        } else {
            btnAtual.innerHTML = textoOriginal;
            btnAtual.disabled = false;
            
            if (action === 'aceitar') {
                recusarBtn.disabled = false;
            } else {
                confirmarBtn.disabled = false;
            }
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


function atualizarValorDisponivel(valorEntrada) {
    const elValorTotalDisponivel = document.getElementById('valor-total-disponivel');
    const valorTotalDisponivel = parseFloat(elValorTotalDisponivel.textContent.replace(',', '.')).toFixed(2);

    elValorTotalDisponivel.textContent = parseFloat(valorTotalDisponivel - valorEntrada).toFixed(2);
}
