import { initGerenciaGraficos } from './gerencia_graficos.js';

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('lucroTable')) {
        console.log('Inicializando gráficos de desempenho...');
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está disponível. Carregando dinamicamente...');
            
            const chartScript = document.createElement('script');
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
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
});
