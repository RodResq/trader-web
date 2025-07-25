let graficoResultadoAposta = null;

export function setupGraficoResultadoTotalGanhos() {
    inicializarGraficoResultadoTotalGanhos();
}


function inicializarGraficoResultadoTotalGanhos() {
    const chartContainer = document.getElementById('graficoResultadoAposta');
    if (!chartContainer) return;

    chartContainer.style.height = '175px';
    chartContainer.style.overflow = 'hidden';

    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    carregarDadosGraficoResultadoTotalGanhos(chartContainer);
}

async function carregarDadosGraficoResultadoTotalGanhos(chartContainer) {
    let dados = null;
    try {
        const response = await fetch('/api/grafico/resultado_aposta');
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        dados = await response.json();
        if (dados.success) {
            renderizarDados(chartContainer, dados);
        } else {
            chartContainer.innerHTML = '<div class="alert alert-info">Não foi possível extrair dados dos ciclos. Verifique se a tabela está carregada corretamente.</div>';
            throw new Error(data.error || 'Erro desconhecido ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de resutltado das apostas:', error);
    } finally {
        console.log('Finaly grafico performace');
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
        containerGrafico.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    const mainChartContainer = document.createElement('div');
    mainChartContainer.style.width = '45%';
    mainChartContainer.style.height = '85%';
    mainChartContainer.style.position = 'absolute';
    containerGrafico.appendChild(mainChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartResultadoTotalGanhos';
    mainChartContainer.appendChild(canvas);

    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    const borderColor = isDarkTheme ? '#444444' : '#ffffff';

    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div class="alert alert-danger">Chart.js não está disponível. Não foi possível renderizar o gráfico.</div>';
        console.error('Chart.js não está disponível');
        return;
    }

    const labels = dados.map(item => item.resultado);
    const totais = dados.map(item => Number(item.total)) || 0;

    const ctx = canvas.getContext('2d');
    graficoResultadoAposta = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'My First Dataset',
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
                position: 'right'
            }
            }
        }
    })

}

window.setupGraficoResultadoTotalGanhos = setupGraficoResultadoTotalGanhos;