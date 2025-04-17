/**
 * Módulo de Status do Mercado - Gerencia indicadores de status do mercado
 */

/**
 * Atualiza indicadores de status do mercado baseado nos valores de porcentagem home
 */
export function updateMarketStatus() {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const mercadoColumnIndex = 1; // Índice da coluna de mercado
    const homeColumnIndex = 3;    // Índice da coluna de % home
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const mercadoCell = row.querySelector(`td:nth-child(${mercadoColumnIndex})`);
        const homeCell = row.querySelector(`td:nth-child(${homeColumnIndex})`);
        
        if (homeCell && mercadoCell) {
            const statusIcon = mercadoCell.querySelector('.market-status');
            if (!statusIcon) return;
            
            // Extrair valor numérico da célula (removendo % e quaisquer caracteres não numéricos)
            let homeValue = homeCell.textContent.trim();
            homeValue = parseFloat(homeValue);
            
            // Padrão para 0 se não for um número válido
            if (isNaN(homeValue)) {
                homeValue = 0;
            }
            
            // Remove classes existentes e adiciona a classe apropriada
            statusIcon.classList.remove('status-open', 'status-close', 'status-warning');
            
            if (homeValue >= 80) {
                statusIcon.classList.add('status-open');
            } else if (homeValue >= 70) {
                statusIcon.classList.add('status-warning');
            } else {
                statusIcon.classList.add('status-close'); 
            }
        }
    });
}