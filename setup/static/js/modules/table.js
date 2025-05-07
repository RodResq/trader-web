/**
 * Módulo Tabela - Gerencia funcionalidades relacionadas à tabela
 */
import { isValidDateFormat } from './utils.js';

/**
 * Inicializa manipuladores e formatadores de tabela
 */
export function initTableHandlers() {
    // formatDateCells();
    checkAcceptedBets();
    checkRejectBets();
    checkDesfazerAcao();
}

/**
 * Formata células de data na tabela de mercados
 */
export function formatDateCells() {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const dateColumnIndex = 6; // Índice da coluna de data
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const dateCell = row.querySelector(`td:nth-child(${dateColumnIndex})`);
        if (dateCell) {
            const originalDate = dateCell.textContent.trim();
            
            if (isValidDateFormat(originalDate)) {
                return;
            }
            
            // Tenta formatar a data para DD/MM/YYYY
            try {
                const date = new Date(originalDate);
                if (!isNaN(date.getTime()) && isNaN(Date.parse(originalDate)) === false) { // Verifica se a data é válida
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    
                    dateCell.textContent = `${day}/${month}/${year}`;
                    dateCell.setAttribute('data-original-date', originalDate);
                }
            } catch (e) {
                console.warn('Não foi possível formatar a data:', originalDate);
            }
        }
    });
}

/**
 * Atualiza o icone da linha onde a ação foi executada
*/
export function updateEntryOptionIcon(isMutipla=false, row, estado="E") {
    if (!row) return;
    
    const mercadoCell = row.querySelector(isMutipla ? 'td:nth-child(3)': 'td:nth-child(2)');
    
    // Cria elemento de ícone para estado da entrada
    const iconElement = document.createElement('i');
    // Se não existir, cria um novo
    if (!iconElement) {
        iconElement = document.createElement('i');
        mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);
    }

    // Obtém o texto original do mercado
    const mercadoText = mercadoCell.textContent.trim();

    // Reseta classes do ícone
    iconElement.classList.remove('bi-check', 'bi-x', 'bi-alarm');
    iconElement.classList.remove('text-success', 'text-danger', 'text-primary');

    const opcoesEntradaMap = {
        'A': {
            icon: 'bi-check',
            color: 'text-success'
        },
        'R': {
            icon: 'bi-x', 
            color: 'text-danger'
        },
        'E': {
            icon: 'bi-alarm', 
            color: 'text-primary'
        }
    };
    
    // Aplica o estilo correto
    const estadoConfig = opcoesEntradaMap[estado] || opcoesEntradaMap['E'];
    
    // Adiciona classes de ícone e estilo
    iconElement.classList.add('bi', estadoConfig.icon, estadoConfig.color);
    iconElement.style.fontSize = '1rem';
    iconElement.style.marginRight = '5px';
    
    // Remove o marcador de estado do texto
    mercadoCell.textContent = mercadoText.replace(/\[\w\]\s*/, '').trim();
    mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);

    initTableHandlers()
}


/**
 * Verifica apostas já aceitas e atualiza a UI adequadamente / refatora
 */
export function checkAcceptedBets() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const mercadoCell = row.querySelector('td:nth-child(2)');
        const iconElement = mercadoCell ? mercadoCell.querySelector('.bi-check') : null;

        if (iconElement) {
            const apostarBtn = row.querySelector('.apostar-btn');

            if (apostarBtn && !apostarBtn.disabled) {
                apostarBtn.classList.remove('btn-success');
                apostarBtn.classList.add('btn-secondary');
                apostarBtn.innerHTML = '<i class="bi bi-check-all"></i>';
                apostarBtn.disabled = true;
            } 
        }
    });
}

/**
 * Verifica apostas já aceitas e atualiza a UI adequadamente / refatora
 */
export function checkRejectBets() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const mercadoCell = row.querySelector('td:nth-child(2)');
        const iconElement = mercadoCell ? mercadoCell.querySelector('.bi-x') : null;

        if (iconElement) {
            const recusarBtn = row.querySelector('.recusar-btn');
            if (recusarBtn && !recusarBtn.disabled) {
                recusarBtn.classList.remove('btn-danger');
                recusarBtn.classList.add('btn-secondary');
                recusarBtn.innerHTML = '<i class="bi bi-x"></i>';
                recusarBtn.disabled = true;
            } else if (recusarBtn && recusarBtn.disabled) {
                recusarBtn.disabled = false;
            }
        }
    });
}

/**
 * Verifica se estado no estado de espera e atualiza a UI adequadamente 
 **/
export function checkDesfazerAcao() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const mercadoCell = row.querySelector('td:nth-child(2)');
        const iconElement = mercadoCell ? mercadoCell.querySelector('.bi-alarm') : null;

        const desfazerBtn = row.querySelector('.desfazer-acao-btn');
        if (!desfazerBtn) return;
        
        if (iconElement) {
            if (!desfazerBtn.disabled) {
                desfazerBtn.classList.remove('btn-warning');
                desfazerBtn.classList.add('btn-secondary');
            }
        } else {
            desfazerBtn.classList.remove('btn-secondary');
            desfazerBtn.classList.add('btn-warning');
            desfazerBtn.disabled = false;
        }
    });
}

/**
 * Atualiza a tabela de mercados com novos dados
 * @param {Object} data - Os dados retornados pela API
 */
export function updateMarketsTable(data) {
    // Verificar se os dados são um objeto com propriedade mercados ou um array direto
    const mercados = Array.isArray(data) ? data : (data.success && data.mercados ? data.mercados : null);
    
    if (!mercados) {
        return false;
    }
    
    const table = document.getElementById('marketsTable');
    if (!table) return false;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return false;
    
    // Limpar a tabela existente
    tbody.innerHTML = '';
    
    // Adicionar as novas linhas
    data.mercados.forEach(mercado => {
        const row = document.createElement('tr');
        
        // Célula de ID
        const idCell = document.createElement('td');
        idCell.textContent = mercado.id_event;
        row.appendChild(idCell);
        
        // Célula de Mercado
        const mercadoCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = 'market-status';

        // Cria elemento de ícone para estado da entrada
        const iconElement = document.createElement('i');
        const opcoesEntradaMap = {
            'A': {
                icon: 'bi-check',
                color: 'text-success'
            },
            'R': {
                icon: 'bi-x', 
                color: 'text-danger'
            },
            'E': {
                icon: 'bi-alarm',
                color: 'text-primary'
            }
        }; 

        const estadoConfig = opcoesEntradaMap[mercado.opcao_entrada] || opcoesEntradaMap['E'];
        iconElement.classList.add('bi', estadoConfig.icon, estadoConfig.color);
        iconElement.style.fontSize = '1rem';
        iconElement.style.color = estadoConfig.color;
        iconElement.style.marginRight = '5px';

        mercadoCell.appendChild(statusSpan);
        mercadoCell.appendChild(iconElement)
        mercadoCell.appendChild(document.createTextNode(mercado.mercado));
        row.appendChild(mercadoCell);
        
        // Célula de Odd
        const oddCell = document.createElement('td');
        oddCell.textContent = parseFloat(mercado.odd);
        row.appendChild(oddCell);
        
        // Célula de Home
        const homeCell = document.createElement('td');
        homeCell.textContent = mercado.home_actual + '%';
        row.appendChild(homeCell);
        
        // Célula de Away
        const awayCell = document.createElement('td');
        awayCell.textContent = mercado.away_actual + '%';
        row.appendChild(awayCell);
        
        // Célula de Data
        const dataCell = document.createElement('td');
        dataCell.textContent = mercado.data_jogo;
        row.appendChild(dataCell);
        
        // Célula de Ações
        const acoesCell = document.createElement('td');
        
        if (mercado.opcao_entrada === 'A') {
            // Botão desabilitado para apostas já aceitas
            const btnAceito = document.createElement('a');
            btnAceito.className = 'btn btn-sm btn-secondary disabled';
            btnAceito.title = 'Aposta já aceita';
            
            const iconAceito = document.createElement('i');
            iconAceito.className = 'bi bi-check-all';
            btnAceito.appendChild(iconAceito);
            
            acoesCell.appendChild(btnAceito);
        } else {
            aceitarBtn.className = 'btn btn-sm btn-success apostar-btn';
            aceitarBtn.innerHTML = '<i class="bi bi-check"></i>';
        }
        
        aceitarBtn.dataset.eventId = mercado.id_event;
        aceitarBtn.title = 'Aceitar aposta';
        acoesCell.appendChild(aceitarBtn);
        

        // Botão recusar aposta
        const recusarBtn = document.createElement('a');
        recusarBtn.id = 'recusar-aposta';
        
        if (mercado.opcao_entrada === 'R') {
            // Botão desabilitado para apostas já recusadas
            recusarBtn.className = 'btn btn-sm btn-secondary recusar-btn';
            recusarBtn.disabled = true;
        } else {
            recusarBtn.className = 'btn btn-sm btn-danger recusar-btn';
        }

        recusarBtn.dataset.eventId = mercado.id_event;
        recusarBtn.title = 'Recusar aposta';
        recusarBtn.innerHTML = '<i class="bi bi-x"></i>';
        acoesCell.appendChild(recusarBtn);

        // Botão desfazer ação
        const desfazerBtn = document.createElement('a');
        desfazerBtn.id = 'desfazer-acao';

        // Verificar estado de ação para estilizar o botão de desfazer
        if (mercado.opcao_entrada === 'E') {
            desfazerBtn.className = 'btn btn-sm btn-secondary desfazer-acao-btn';
            desfazerBtn.disabled = true;
        } else {
            desfazerBtn.className = 'btn btn-sm btn-warning desfazer-acao-btn';
        }

        desfazerBtn.dataset.eventId = mercado.id_event;
        desfazerBtn.title = 'Desfazer ação';
        desfazerBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
        acoesCell.appendChild(desfazerBtn);
        
        row.appendChild(acoesCell);
        tbody.appendChild(row);
    });
    return true;
}