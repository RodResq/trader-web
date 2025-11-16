import { initGerenciaGraficos } from './gerencia_graficos.js';

export function setupGraficoDesempenhoSemanal() {
    
    const lucroTable = document.getElementById('lucroTable');

    if (!lucroTable) return;

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está disponível. Carregando dinamicamente...');
        
        const chartScript = document.createElement('script');
        chartScript.onload = function() {
            console.log('Chart.js carregado com sucesso!');
            initGerenciaGraficos();
        };
        chartScript.onerror = function() {
            console.error('Erro ao carregar Chart.js');
            const chartContainer = document.getElementById('graficoDesempenhoSemanal');
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="alert alert-danger">Não foi possível carregar o gráfico. Chart.js não está disponível.</div>';
            }
        };
        document.head.appendChild(chartScript);
    } else {
        initGerenciaGraficos();
    }
    
    const graficosAbas = document.querySelectorAll('[data-bs-toggle="tab"][href*="grafico"]');
    if (graficosAbas.length > 0) {
        graficosAbas.forEach(aba => {
            aba.addEventListener('shown.bs.tab', function(event) {
                initGerenciaGraficos();
            });
        });
    }

}


