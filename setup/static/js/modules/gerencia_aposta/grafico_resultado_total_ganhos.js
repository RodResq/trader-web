let graficoResultadoAposta = null;

export function setupGraficoResultadoTotalGanhos() {
    inicializarGraficoResultadoTotalGanhos();
}


function inicializarGraficoResultadoTotalGanhos() {
    const chartContainer = document.getElementById('graficoResultadoAposta');
    if (!chartContainer) return;

    // Dimensiona o container como 90% altura x 95% largura do card-body pai
    const cardBody = chartContainer.closest('.card-body');
    if (cardBody) {
        const cardBodyHeight = cardBody.offsetHeight;
        const cardBodyWidth  = cardBody.offsetWidth;
        chartContainer.style.height = (cardBodyHeight * 0.9) + 'px';
        chartContainer.style.width  = (cardBodyWidth  * 0.95) + 'px';
    } else {
        chartContainer.style.height = '175px';
        chartContainer.style.width  = '95%';
    }
    chartContainer.style.overflow = 'hidden';
    chartContainer.style.position = 'relative';

    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

    carregarDadosGraficoResultadoTotalGanhos(chartContainer);
}

async function carregarDadosGraficoResultadoTotalGanhos(chartContainer) {
    let dados = null;
    try {
        const response = await fetch('/api/v1/grafico/resultado_aposta');
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        dados = await response.json();
        if (dados.success) {
            renderizarDados(chartContainer, dados);
        } else {
            chartContainer.innerHTML = '<div class="alert alert-info">Não foi possível extrair dados dos ciclos. Verifique se a tabela está carregada corretamente.</div>';
            throw new Error(dados.error || 'Erro desconhecido ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de resultado das apostas:', error);
    }
}

function renderizarDados(container, dados) {
    container.innerHTML = '';

    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Não há dados de desempenho disponíveis.</div>';
        return;
    }

    const existingChart = window.graficoResultadoAposta;
    if (existingChart && existingChart.destroy) {
        existingChart.destroy();
    }

    if (dados.dados && dados.dados.length > 0) {
        renderizarGrafico(container, dados.dados);
    } else {
        mostrarGraficoVazio();
    }
}

function renderizarGrafico(container, dados) {
    const containerGrafico = document.getElementById('graficoResultadoAposta');

    if (!container) {
        console.error('Canvas do gráfico não encontrado');
        return;
    }

    if (graficoResultadoAposta) {
        graficoResultadoAposta.destroy();
        graficoResultadoAposta = null;
    }

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        containerGrafico.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    // Wrapper com dimensões explícitas em px para que o Chart.js calcule corretamente
    const wrapper = document.createElement('div');
    wrapper.style.width  = containerGrafico.style.width  || '95%';
    wrapper.style.height = containerGrafico.style.height || '150px';
    wrapper.style.margin = '0 -90px';
    containerGrafico.appendChild(wrapper);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartResultadoTotalGanhos';
    wrapper.appendChild(canvas);

    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const borderColor = isDarkTheme ? '#444444' : '#ffffff';

    const labels = dados.map(item => item.resultado);
    const totais = dados.map(item => Number(item.total)) || 0;

    const ctx = canvas.getContext('2d');
    graficoResultadoAposta = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Resultado das Apostas',
                data: totais,
                backgroundColor: [
                    'rgb(54, 162, 235)',
                    'rgb(25, 135, 84)',
                    'rgb(220, 53, 69)',
                ],
                borderColor: borderColor,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        padding: 6,
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

window.setupGraficoResultadoTotalGanhos = setupGraficoResultadoTotalGanhos;
