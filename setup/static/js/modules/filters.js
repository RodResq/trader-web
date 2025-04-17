/**
 * Módulo de Filtros - Gerencia funcionalidades de filtragem de tabela
 */
import { isValidDateFormat, applyDateMask, formatDateForComparison } from './utils.js';

/**
 * Inicializa funcionalidade de filtragem
 */
export function initFilters() {
    initDateFilter();
}

/**
 * Inicializa filtro de data para a tabela de mercados
 */
function initDateFilter() {
    const marketDateFilter = document.getElementById('marketDateFilter');
    const clearDateFilter = document.getElementById('clearDateFilter');
    const marketsTable = document.getElementById('marketsTable');
    
    if (!marketDateFilter || !marketsTable) return;
    
    // Aplica máscara durante a digitação
    marketDateFilter.addEventListener('input', function(e) {
        e.preventDefault(); // Previne comportamento padrão
        applyDateMask(this);
    });

    // Garante que a entrada seja tratada como texto
    marketDateFilter.addEventListener('focus', function() {
        this.setAttribute('type', 'text');
    });

    // Filtra quando o usuário sai do campo ou pressiona Enter
    marketDateFilter.addEventListener('blur', function() {
        filterTableByDate();
    });
    
    marketDateFilter.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterTableByDate();
        }
    });

    // Botão de limpar filtro
    if (clearDateFilter) {
        clearDateFilter.addEventListener('click', function() {
            marketDateFilter.value = '';
            filterTableByDate();
        });
    }
    
    /**
     * Filtra linhas da tabela por data
     */
    function filterTableByDate() {
        const filterDate = marketDateFilter.value;
        const formattedFilterDate = formatDateForComparison(filterDate);

        // Se não houver valor de filtro, mostre todas as linhas
        if (!filterDate) {
            const rows = marketsTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                row.style.display = '';
            });
            return;
        }

        // Filtra as linhas da tabela
        const rows = marketsTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const dataCell = row.querySelector('td:nth-child(6)'); // Coluna de data (6ª coluna)

            if (dataCell) {
                const rowDate = dataCell.textContent.trim();
                const formattedRowDate = formatDateForComparison(rowDate);

                // Compara as datas
                if (formattedRowDate === formattedFilterDate) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    }
}