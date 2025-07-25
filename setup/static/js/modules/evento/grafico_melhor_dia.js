let graficoMelhorDia = null;

export function setupGraficoMelhorDia() {
    inicializarGraficoMelhorDia();
}


function inicializarGraficoMelhorDia() {
    const chartContainer = document.getElementById('graficoMelhorDia');
    if (!chartContainer) return;

    chartContainer.style.height = '150px';
    chartContainer.style.overflow = 'hidden';

    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    carregarDadosGraficoMelhorDia(chartContainer);
}

async function carregarDadosGraficoMelhorDia(chartContainer) {
    let dados = null;
    try {
        const response = await fetch('/api/grafico/melhor_dia_semana');
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

    const existingChart = window.graficoMelhorDia;
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
    const containerGrafico = document.getElementById('graficoMelhorDia');

    if (!container) {
        console.error('Canvas do gráfico não encontrado');
        return;
    }

    if (graficoMelhorDia) {
        graficoMelhorDia.destroy();
        graficoMelhorDia = null;
    }

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        containerGrafico.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    const mainChartContainer = document.createElement('div');
    mainChartContainer.style.width = '60%';
    mainChartContainer.style.height = '50%';
    mainChartContainer.style.position = 'absolute';
    containerGrafico.appendChild(mainChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartResultadoMelhorDiaSemana';
    mainChartContainer.appendChild(canvas);

    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    const borderColor = isDarkTheme ? '#444444' : '#ffffff';

    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div class="alert alert-danger">Chart.js não está disponível. Não foi possível renderizar o gráfico.</div>';
        console.error('Chart.js não está disponível');
        return;
    }

    const labels = dados.map(item => item.dia_aposta);
    const totais = dados.map(item => Number(item.total_retorno)) || 0;

    const ctx = canvas.getContext('2d');
    graficoMelhorDia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Melhor dia da semana',
                axis: 'y',
                fill: false,
                data: totais,
                backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
                ],
                borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(75, 192, 192)',
                'rgb(255, 205, 86)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
                ],
               borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: false,

                },
                y: {
                    stacked: false,
                }

            }
        }
    })

}

window.setupGraficoMelhorDia = setupGraficoMelhorDia;