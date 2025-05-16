/**
 * Script principal para gráficos na tela de gerência
 * Versão refatorada para garantir correta inicialização
 */
import { initGerenciaGraficos } from './gerencia_graficos.js';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de gerência
    if (document.getElementById('lucroTable')) {
        console.log('Inicializando gráficos de desempenho...');
        
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está disponível. Carregando dinamicamente...');
            
            // Carregar Chart.js dinamicamente
            const chartScript = document.createElement('script');
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
            chartScript.onload = function() {
                console.log('Chart.js carregado com sucesso!');
                initGerenciaGraficos();
            };
            chartScript.onerror = function() {
                console.error('Erro ao carregar Chart.js');
                // Mostrar mensagem de erro no container do gráfico
                const chartContainer = document.getElementById('graficoDesempenhoSemanal');
                if (chartContainer) {
                    chartContainer.innerHTML = '<div class="alert alert-danger">Não foi possível carregar o gráfico. Chart.js não está disponível.</div>';
                }
            };
            document.head.appendChild(chartScript);
        } else {
            // Chart.js já está disponível, inicializar normalmente
            initGerenciaGraficos();
        }
        
        // Se houver abas para outros gráficos, configurar evento para renderizar ao trocar abas
        const graficosAbas = document.querySelectorAll('[data-bs-toggle="tab"][href*="grafico"]');
        if (graficosAbas.length > 0) {
            graficosAbas.forEach(aba => {
                aba.addEventListener('shown.bs.tab', function(event) {
                    // Re-renderizar gráficos quando a aba for ativada
                    initGerenciaGraficos();
                });
            });
        }
    }
});
