let graficoPerformaceSemanal = null;

export function setupGraficoPerformaceSemanal() {
    inicializarGraficoPerformaceSemanal();
}

function inicializarGraficoPerformaceSemanal() {
    const chartContainer = document.getElementById('graficoPerformaceSemanal');
    if (!chartContainer) return;
    
    chartContainer.style.height = '350px';
    chartContainer.style.overflow = 'hidden';

    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    carregarDadosGraficoPerformaceSemanal(chartContainer);
    
}


async function carregarDadosGraficoPerformaceSemanal(chartContainer) {
    let dados = null;
    try {
        const response = await fetch(`/api/grafico-performace-semanal`);
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
        console.error('Erro ao carregar dados de evolução:', error);
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
    
    const existingChart = window.graficoDesempenho;
    if (existingChart && existingChart.destroy) {
        existingChart.destroy();
    }
    
    if (dados.dados && dados.dados.length > 0) {
        renderizarGrafico(container, dados.dados);
    } else {
        mostrarGraficoVazio();
    }
    // atualizarDetalhes(analise);
}


function renderizarGrafico(container, dados) {
    const containerGrafico = document.getElementById('graficoPerformaceSemanal');
    
    if (!containerGrafico) {
        console.error('Canvas do gráfico não encontrado');
        return;
    }

    if (graficoPerformaceSemanal) {
        graficoPerformaceSemanal.destroy();
        graficoPerformaceSemanal = null;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        containerGrafico.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    const mainChartContainer = document.createElement('div');
    mainChartContainer.style.width = '90%';
    mainChartContainer.style.height = '90%';
    mainChartContainer.style.position = 'relative';
    containerGrafico.appendChild(mainChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartDesempenho';
    mainChartContainer.appendChild(canvas);
    
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    
    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div class="alert alert-danger">Chart.js não está disponível. Não foi possível renderizar o gráfico.</div>';
        console.error('Chart.js não está disponível');
        return;
    }
    
    const labes = dados.map(item => item.periodo);
    const valores_retorno = dados.map(item => parseFloat(item.valor_retorno) || 0);

    const ctx = canvas.getContext('2d');
    graficoPerformaceSemanal = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: labes,
        datasets: [{
            label: 'Performace Valores Totais Disponíveis',
            data: valores_retorno,
            backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)'
            ],
            borderWidth: 1
        }]
        },
        options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
        }
    });

    window.graficoPerformaceSemanal = graficoPerformaceSemanal;
}


function mostrarGraficoVazio() {
    const ctx = document.getElementById('graficoPerformaceSemanal');
    if (ctx) {
        ctx.parentElement.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="bi bi-info-circle me-2"></i>
                Não há dados de performace para este ciclo.
            </div>
        `;
    }
}

window.setupGraficoPerformaceSemanal = setupGraficoPerformaceSemanal;
