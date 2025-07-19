import { updateEntryOptionIcon } from './table.js';

export function initMultiplasHandlers() {
    const multiplaModal = document.getElementById('entradasMultiplasModal');
    const mostrarCheckListBtn = document.getElementById('mostrarCheckList');
    const marketsTable = document.getElementById('marketsTable');
    
    if (!multiplaModal || !mostrarCheckListBtn || !marketsTable) return;
    
    window.selectedMarkets = [];
    console.log('Inicializando selectedMarkets:', window.selectedMarkets);
    
    mostrarCheckListBtn.addEventListener('click', toggleCheckboxes);
    
    const btnAceitarMultipla = document.getElementById('aceitarMultiplaBtn');
    const btnRecusarMultipla = document.getElementById('recusarMultiplaBtn');

    if (!btnAceitarMultipla || !btnRecusarMultipla) return;
   
    btnAceitarMultipla.addEventListener('click', () => processarMultipla('aceitar'));
    btnRecusarMultipla.addEventListener('click', () => processarMultipla('recusar'));    
   
    document.getElementById('valor-entrada-multipla').addEventListener('input', calcularRetornoEsperado);

    abrirModalMultiplas();
}


function toggleCheckboxes() {
    const marketsTable = document.getElementById('marketsTable');
    const tbody = marketsTable.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    const hasCheckboxes = marketsTable.classList.contains('has-checkboxes');
    
    if (hasCheckboxes) {
        rows.forEach(row => {
            const checkboxCell = row.querySelector('td.checkbox-cell');
            if (checkboxCell) {
                row.removeChild(checkboxCell);
            }
        });
        
        marketsTable.classList.remove('has-checkboxes');
        document.getElementById('mostrarCheckList').classList.remove('active');
        
        const btnAbrirModal = document.getElementById('abrirModalMultiplas');
        if (btnAbrirModal) {
            btnAbrirModal.remove();
        }
        
        window.selectedMarkets = [];
    } else {
        rows.forEach(row => {
            const mercadoCell = row.querySelector('td:nth-child(2)');
            const iconElement = mercadoCell ? mercadoCell.querySelector('.bi-check, .bi-x') : null;
            
            if (iconElement) return; 
            
            const idEvent = row.querySelector('td:first-child').textContent.trim();
            // const mercado = undefined;
            const odd = parseFloat(row.querySelector('td:nth-child(3)').textContent.trim());
            const dataJogo = row.querySelector('td:nth-child(6)').textContent.trim();
            
            // Cria a célula de checkbox
            const checkboxCell = document.createElement('td');
            checkboxCell.className = 'checkbox-cell';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input market-checkbox';
            checkbox.dataset.idEvent = idEvent;
            checkbox.dataset.mercado = mercado;
            checkbox.dataset.odd = odd;
            checkbox.dataset.dataJogo = dataJogo;
            
            checkbox.addEventListener('change', function() {
                updateSelectedMarkets(this);
                updateSelectionCounter();
            });
            
            checkboxCell.appendChild(checkbox);
            row.insertBefore(checkboxCell, row.firstChild);
        });
        
        // Atualiza estado da tabela
        marketsTable.classList.add('has-checkboxes');
        document.getElementById('mostrarCheckList').classList.add('active');
        
        // Adiciona botão para abrir modal de múltiplas
        const tableHeader = document.querySelector('.card-header');
        if (tableHeader && !document.getElementById('abrirModalMultiplas')) {
            const btnAbrirModal = document.createElement('button');
            btnAbrirModal.id = 'abrirModalMultiplas';
            btnAbrirModal.className = 'btn btn-primary btn-sm ms-2 d-none';
            btnAbrirModal.innerHTML = '<i class="bi bi-list-check"></i> Processar selecionados <span class="badge bg-light text-dark ms-1">0</span>';
            btnAbrirModal.addEventListener('click', abrirModalMultiplas);
            
            tableHeader.appendChild(btnAbrirModal);
        }
    }
}

/**
 * Atualiza a contagem de mercados selecionados
 */
function updateSelectionCounter() {
    const btnAbrirModal = document.getElementById('abrirModalMultiplas');
    if (!btnAbrirModal) return;
    
    const count = window.selectedMarkets.length;
    const badge = btnAbrirModal.querySelector('.badge');
    
    if (badge) {
        badge.textContent = count;
    }
    
    if (count > 0) {
        btnAbrirModal.classList.remove('d-none');
    } else {
        btnAbrirModal.classList.add('d-none');
    }
}

/**
 * Atualiza a lista de mercados selecionados quando uma checkbox é alterada
 */
function updateSelectedMarkets(checkbox) {
    const idEvent = checkbox.dataset.idEvent;
    const mercado = checkbox.dataset.mercado;
    const odd = parseFloat(checkbox.dataset.odd);
    const dataJogo = checkbox.dataset.dataJogo;
    
    if (checkbox.checked) {
        // Adiciona à lista se não existir
        if (!window.selectedMarkets.some(m => m.idEvent === idEvent)) {
            window.selectedMarkets.push({
                idEvent,
                mercado,
                odd,
                dataJogo
            });
        }
    } else {
        // Remove da lista
        window.selectedMarkets = window.selectedMarkets.filter(m => m.idEvent !== idEvent);
    }
}


function abrirModalMultiplas() {
    if (window.selectedMarkets.length === 0) {
        return;
    }
    
    preencherTabelaMultiplas();

    const multiplaModal = new bootstrap.Modal(document.getElementById('entradasMultiplasModal'));
    multiplaModal.show();
}


function preencherTabelaMultiplas() {
    const tbody = document.getElementById('multipla-tbody');
    tbody.innerHTML = '';
    
    let oddCombinada = 1.0;
    
    window.selectedMarkets.forEach(market => {
        const tr = document.createElement('tr');
        
        // ID
        const tdId = document.createElement('td');
        tdId.textContent = market.idEvent;
        tr.appendChild(tdId);
        
        // Mercado
        const tdMercado = document.createElement('td');
        tdMercado.textContent = market.mercado;
        tr.appendChild(tdMercado);
        
        // Odd
        const tdOdd = document.createElement('td');
        tdOdd.textContent = market.odd.toFixed(2);
        tr.appendChild(tdOdd);
        
        // Data
        const tdData = document.createElement('td');
        tdData.textContent = market.dataJogo;
        tr.appendChild(tdData);
        
        // Remover
        const tdRemover = document.createElement('td');
        const btnRemover = document.createElement('button');
        btnRemover.className = 'btn btn-sm btn-outline-danger';
        btnRemover.innerHTML = '<i class="bi bi-trash"></i>';
        btnRemover.addEventListener('click', () => {
            removerMercadoMultipla(market.idEvent);
        });
        tdRemover.appendChild(btnRemover);
        tr.appendChild(tdRemover);
        
        tbody.appendChild(tr);
        
        // Atualiza odd combinada
        oddCombinada *= market.odd;
    });
    
    // Atualiza a odd combinada no modal
    document.getElementById('odd-combinada').textContent = oddCombinada.toFixed(2);
    
    // Limpa o campo de valor de entrada
    document.getElementById('valor-entrada-multipla').value = '';
    document.getElementById('retorno-esperado').value = '';
}


function removerMercadoMultipla(idEvent) {
    window.selectedMarkets = window.selectedMarkets.filter(m => m.idEvent !== idEvent);
    
    const checkbox = document.querySelector(`.market-checkbox[data-id-event="${idEvent}"]`);
    if (checkbox) {
        checkbox.checked = false;
    }
    
    preencherTabelaMultiplas();
    updateSelectionCounter();
    
    if (window.selectedMarkets.length === 0) {
        bootstrap.Modal.getInstance(document.getElementById('entradasMultiplasModal')).hide();
    } else {
        verificarCiclo();
    }
}


function verificarCiclo() {
    const cicloWarning = document.getElementById('ciclo-warning');
    const cicloMultipla = document.getElementById('ciclo-multipla');
    const saldoDisponivel = document.getElementById('saldo-disponivel');
    
    if (window.selectedMarkets.length === 0) {
        cicloWarning.classList.add('d-none');
        cicloMultipla.textContent = 'Não definido';
        saldoDisponivel.textContent = '0.00';
        return;
    }
    
    const datasJogo = window.selectedMarkets.map(m => m.dataJogo);
    
    // Faz uma requisição para obter informações do ciclo
    fetch(`/ciclo/verificar?datas=${encodeURIComponent(JSON.stringify(datasJogo))}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cicloWarning.classList.add('d-none');
                cicloMultipla.textContent = data.ciclo.nome || 
                                           `${data.ciclo.data_inicial} a ${data.ciclo.data_final}`;
                saldoDisponivel.textContent = data.ciclo.valor_disponivel_entrada.toFixed(2);
            } else {
                cicloWarning.classList.remove('d-none');
                cicloWarning.textContent = data.message;
                cicloMultipla.textContent = 'Não definido';
                saldoDisponivel.textContent = '0.00';
            }
        })
        .catch(error => {
            console.error('Erro ao verificar ciclo:', error);
            cicloWarning.classList.remove('d-none');
            cicloWarning.textContent = 'Erro ao verificar o ciclo. Verifique se todas as datas estão em um mesmo período.';
            cicloMultipla.textContent = 'Erro';
            saldoDisponivel.textContent = '0.00';
        });
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
 * Processa a múltipla (aceitar ou recusar)
 */
function processarMultipla(action) {
    if (window.selectedMarkets.length === 0) {
        alert('Selecione pelo menos um mercado para continuar.');
        return;
    }
    
    const valorEntrada = parseFloat(document.getElementById('valor-entrada-multipla').value) || 0;
    
    if (action === 'aceitar' && valorEntrada <= 0) {
        alert('Informe um valor de entrada válido.');
        return;
    }
    
    // Prepara os dados para envio
    const eventIds = window.selectedMarkets.map(m => m.idEvent);
    const oddCombinada = parseFloat(document.getElementById('odd-combinada').textContent);
    const retornoEsperado = parseFloat(document.getElementById('retorno-esperado').value) || 0;
    
    const dados = {
        event_ids: eventIds,
        action: action,
        valor_entrada: valorEntrada,
        odd_combinada: oddCombinada,
        retorno_esperado: retornoEsperado
    };
    
    // Envia os dados para o servidor
    fetch('/analytics/entrada_multipla/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('entradasMultiplasModal')).hide();
            
            atualizarUIAposProcessamentoMultipla(action);
            
            alert(data.message);
            
            atualizarTabelaMercados();
        } else {
            alert(`Erro: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao processar múltipla:', error);
        alert('Erro ao processar a múltipla. Tente novamente.');
    });
}

/**
 * Atualiza a UI após processar uma múltipla
 */
function atualizarUIAposProcessamentoMultipla(action) {
    // Limpa as seleções
    window.selectedMarkets = [];
    
    // Remove as checkboxes
    toggleCheckboxes();
    
    // Atualiza a UI dos botões
    const marketsTable = document.getElementById('marketsTable');
    const tbody = marketsTable.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const idEvent = row.querySelector('td:first-child').textContent.trim();
        
        // Atualiza o ícone de status
        updateEntryOptionIcon(true, row, action === 'aceitar' ? 'A' : 'R');
    });
}

/**
 * Atualiza a tabela de mercados
 */
function atualizarTabelaMercados() {
    fetch('/analytics/mercados/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Atualiza a tabela
                const marketsTable = document.getElementById('marketsTable');
                const tbody = marketsTable.querySelector('tbody');
                
                // Limpa a tabela
                tbody.innerHTML = '';
                
                // Adiciona as novas linhas
                data.mercados.forEach(mercado => {
                    // Cria a linha conforme a estrutura atual
                    // ...
                });
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar tabela de mercados:', error);
        });
}

/**
 * Obtém o token CSRF do cookie
 */
function getCsrfToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken='.length) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken='.length));
                break;
            }
        }
    }
    return cookieValue;
}
