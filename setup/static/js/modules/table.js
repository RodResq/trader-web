/**
 * Módulo Tabela - Gerencia funcionalidades relacionadas à tabela
 */
import { isValidDateFormat } from './utils.js';

/**
 * Inicializa manipuladores e formatadores de tabela
 */
export function initTableHandlers() {
    formatDateCells();
    checkAcceptedBets();
}

/**
 * Formata células de data na tabela de mercados
 */
export function formatDateCells() {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const dateColumnIndex = 5; // Índice da coluna de data
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
                if (!isNaN(date.getTime())) { // Verifica se a data é válida
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
 * Verifica apostas já aceitas e atualiza a UI adequadamente
 */
export function checkAcceptedBets() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        if (row.classList.contains('table-success')) {
            const apostarBtn = row.querySelector('.apostar-btn');
            if (apostarBtn) {
                apostarBtn.classList.remove('btn-success');
                apostarBtn.classList.add('btn-secondary');
                apostarBtn.innerHTML = '<i class="bi bi-check-all"></i>';
                apostarBtn.disabled = true;
            }
        }
    });
}

/**
 * Atualiza a tabela de mercados com novos dados
 * @param {Object} data - Os dados retornados pela API
 */
export function updateMarketsTable(data) {
    if (!data.success || !data.mercados) {
        return false;
    }
    
    const table = document.getElementById('marketsTable');
    if (!table) return false;
    
    const tbody = table.querySelector('tbody');
    
    // Limpar a tabela existente
    tbody.innerHTML = '';
    
    // Adicionar as novas linhas
    data.mercados.forEach(mercado => {
        const row = document.createElement('tr');
        
        // Adicionar classe para linhas de apostas aceitas
        if (mercado.aposta_aceita) {
            row.classList.add('table-success');
        }
        
        // Célula de ID
        const idCell = document.createElement('td');
        idCell.textContent = mercado.id_event;
        row.appendChild(idCell);
        
        // Célula de Mercado
        const mercadoCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = 'market-status';
        mercadoCell.appendChild(statusSpan);
        mercadoCell.appendChild(document.createTextNode(mercado.mercado));
        row.appendChild(mercadoCell);
        
        // Célula de Odd
        const oddCell = document.createElement('td');
        oddCell.textContent = mercado.odd;
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
        
        if (mercado.aposta_aceita) {
            // Botão desabilitado para apostas já aceitas
            const btnAceito = document.createElement('a');
            btnAceito.className = 'btn btn-sm btn-secondary disabled';
            btnAceito.title = 'Aposta já aceita';
            
            const iconAceito = document.createElement('i');
            iconAceito.className = 'bi bi-check-all';
            btnAceito.appendChild(iconAceito);
            
            acoesCell.appendChild(btnAceito);
        } else {
            // Botão de aceitar aposta
            const btnAceitar = document.createElement('a');
            btnAceitar.className = 'btn btn-sm btn-success apostar-btn';
            btnAceitar.setAttribute('data-event-id', mercado.id_event);
            btnAceitar.title = 'Aceitar aposta';
            
            const iconAceitar = document.createElement('i');
            iconAceitar.className = 'bi bi-check';
            btnAceitar.appendChild(iconAceitar);
            
            acoesCell.appendChild(btnAceitar);
        }
        
        // Botão de recusar aposta (sempre presente)
        const btnRecusar = document.createElement('a');
        btnRecusar.className = 'btn btn-sm btn-danger ms-1';
        btnRecusar.setAttribute('id', 'recusar-aposta');
        
        const iconRecusar = document.createElement('i');
        iconRecusar.className = 'bi bi-x';
        btnRecusar.appendChild(iconRecusar);
        
        acoesCell.appendChild(btnRecusar);
        row.appendChild(acoesCell);
        
        // Adicionar a linha completa à tabela
        tbody.appendChild(row);
    });
    
    return true;
}