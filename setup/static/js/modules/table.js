/**
 * Módulo Tabela - Gerencia funcionalidades relacionadas à tabela
 */
import { isValidDateFormat } from './utils.js';


export function initTableHandlers() {
    checkAcceptedBets();
    checkRejectBets();
    checkDesfazerAcao();
}


export function formatDateCells() {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const dateColumnIndex = 6; 
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const dateCell = row.querySelector(`td:nth-child(${dateColumnIndex})`);
        if (dateCell) {
            const originalDate = dateCell.textContent.trim();
            
            if (isValidDateFormat(originalDate)) {
                return;
            }
            
            try {
                const date = new Date(originalDate);
                if (!isNaN(date.getTime()) && isNaN(Date.parse(originalDate)) === false) {
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


export function updateEntryOptionIcon(isMutipla=false, row, estado="E") {
    if (!row) return;
    
    const mercadoCell = row.querySelector(isMutipla ? 'td:nth-child(3)': 'td:nth-child(2)');
    
    if (mercadoCell && !mercadoCell.classList.contains('mercado-column')) {
        mercadoCell.classList.add('mercado-column');
    }
    
    const iconElement = document.createElement('i');
    
    if (!iconElement) {
        iconElement = document.createElement('i');
        mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);
    }

    const mercadoText = mercadoCell.textContent.trim();

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
    
    const estadoConfig = opcoesEntradaMap[estado] || opcoesEntradaMap['E'];
    
    iconElement.classList.add('bi', estadoConfig.icon, estadoConfig.color);
    iconElement.style.fontSize = '1rem';
    iconElement.style.marginRight = '5px';
    iconElement.style.verticalAlign
    
    mercadoCell.textContent = mercadoText.replace(/\[\w\]\s*/, '').trim();
    mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);

    initTableHandlers()
}


export function checkAcceptedBets() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const mercadoCell = row.querySelector('td:nth-child(2)');

        if (mercadoCell && !mercadoCell.classList.contains('mercado-column')) {
            mercadoCell.classList.add('mercado-column');
        }

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


export function checkRejectBets() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const mercadoCell = row.querySelector('td:nth-child(2)');

        if (mercadoCell && !mercadoCell.classList.contains('mercado-column')) {
            mercadoCell.classList.add('mercado-column');
        }

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


export function checkDesfazerAcao() {
    const table = document.getElementById('marketsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const mercadoCell = row.querySelector('td:nth-child(2)');

        if (mercadoCell && !mercadoCell.classList.contains('mercado-column')) {
            mercadoCell.classList.add('mercado-column');
        }

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


export function updateMarketsTable(data) {
    const mercados = Array.isArray(data) ? data : (data.success && data.mercados ? data.mercados : null);
    
    if (!mercados) {
        return false;
    }
    
    const table = document.getElementById('marketsTable');
    if (!table) return false;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return false;
    
    tbody.innerHTML = '';
    
    data.mercados.forEach(mercado => {
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = mercado.id_event;
        row.appendChild(idCell);

        const statusCell = document.createElement('td');
        if (mercado.resultado_entrada === 'G') {
            statusCell.innerHTML = `
                <span class="icon-soccer">
                    <img src="{% static \'images/icons/soccer.svg\' %}" alt="soccer" class="me-2r" style="width: 15px; height: 15px;">
                </span>
            `;
        }
        row.appendChild(statusCell);
        
        const mercadoCell = document.createElement('td');
        mercadoCell.className = 'mercado-column';

        const statusSpan = document.createElement('span');
        statusSpan.className = 'market-status';

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

        if (mercado.resultado_entrada === 'G') {
            statusCell.innerHTML = `
                <span class="icon-soccer">
                    <img src="{% static \'images/icons/soccer.svg\' %}" alt="soccer" class="me-2r" style="width: 15px; height: 15px;">
                </span>
            `;
        }

        const estadoConfig = opcoesEntradaMap[mercado.opcao_entrada] || opcoesEntradaMap['E'];
        iconElement.classList.add('bi', estadoConfig.icon, estadoConfig.color);
        iconElement.style.fontSize = '1rem';
        iconElement.style.color = estadoConfig.color;
        iconElement.style.marginRight = '5px';

        mercadoCell.appendChild(statusSpan);
        mercadoCell.appendChild(iconElement)
        mercadoCell.appendChild(document.createTextNode(`${mercado.name_home} ${mercado.placar} ${mercado.name_away}`));
        row.appendChild(mercadoCell);
        
        

        const oddCell = document.createElement('td');
        const iconElementChangeOdd = document.createElement('i');

        if (mercado.odd_change === 'P') {
            iconElementChangeOdd.className = 'bi bi-stop';
            iconElementChangeOdd.style = '1rem; color: yellow; vertical-align: middle;'
        } else if (mercado.odd_change === 'S') {
            iconElementChangeOdd.className = 'bi bi-arrow-up-short';
            iconElementChangeOdd.style = 'color: green; vertical-align: middle;'
        } else if (mercado.odd_change === 'D') {
            iconElementChangeOdd.className = 'bi bi-arrow-down-short';
            iconElementChangeOdd.style = 'color: red; vertical-align: middle;'
        }

        oddCell.appendChild(iconElementChangeOdd);
        oddCell.appendChild(document.createTextNode(' ' + mercado.odd))
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
        
        const aceitarBtn = document.createElement('a');
        aceitarBtn.id = 'aceitar-aposta';
        
        if (mercado.opcao_entrada === 'A') {
            aceitarBtn.className = 'btn btn-sm btn-secondary apostar-btn disabled';
            aceitarBtn.title = 'Aposta já aceita';
            
            const iconAceito = document.createElement('i');
            iconAceito.className = 'bi bi-check-all';
            aceitarBtn.appendChild(iconAceito);
            
        } else {
            aceitarBtn.className = 'btn btn-sm btn-success apostar-btn';
            aceitarBtn.innerHTML = '<i class="bi bi-check"></i>';
        }
        
        aceitarBtn.dataset.eventId = mercado.id_event;
        aceitarBtn.title = 'Aceitar aposta';
        acoesCell.appendChild(aceitarBtn);
        

        const recusarBtn = document.createElement('a');
        recusarBtn.id = 'recusar-aposta';
        
        if (mercado.opcao_entrada === 'R') {
            recusarBtn.className = 'btn btn-sm btn-secondary recusar-btn';
            recusarBtn.disabled = true;
        } else {
            recusarBtn.className = 'btn btn-sm btn-danger recusar-btn';
        }

        recusarBtn.dataset.eventId = mercado.id_event;
        recusarBtn.title = 'Recusar aposta';
        recusarBtn.innerHTML = '<i class="bi bi-x"></i>';
        acoesCell.appendChild(recusarBtn);

        const desfazerBtn = document.createElement('a');
        desfazerBtn.id = 'desfazer-acao';

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