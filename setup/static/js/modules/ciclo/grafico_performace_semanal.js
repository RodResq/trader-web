let graficoPerformaceSemanal = null;

export function setupGraficoPerformaceSemanal() {

    inicializarGraficoPerformaceSemanal();

}

function inicializarGraficoPerformaceSemanal() {
    const chartContainer = document.getElementById('graficoPerformaceSemanal');
    if (!chartContainer) return;
    
    // Configurar o container para ter uma altura fixa adequada
    chartContainer.style.height = '350px';
    chartContainer.style.overflow = 'hidden';

    // Exibir loader enquanto carrega
    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    // Extrair dados diretamente das linhas principais da tabela
    const dados =  [65, 59, 80, 81, 56, 55, 40];
    
    if (dados && dados.length > 0) {
        renderizarDados(chartContainer, dados);
    } else {
        chartContainer.innerHTML = '<div class="alert alert-info">Não foi possível extrair dados dos ciclos. Verifique se a tabela está carregada corretamente.</div>';
    }
}



function renderizarDados(container, dados) {
    // const { ciclo, dados, analise } = data;
    container.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Não há dados de desempenho disponíveis.</div>';
        return;
    }
    
    // Destruir gráfico existente se houver
    const existingChart = window.graficoDesempenho;
    if (existingChart && existingChart.destroy) {
        existingChart.destroy();
    }
    
    if (dados && dados.length > 0) {
        renderizarGrafico(dados);
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

    // Destruir gráfico existente
    if (graficoPerformaceSemanal) {
        graficoPerformaceSemanal.destroy();
        graficoPerformaceSemanal = null;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        containerGrafico.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    // Criar canvas para o gráfico principal em um container próprio
    const mainChartContainer = document.createElement('div');
    mainChartContainer.style.width = '100%';
    mainChartContainer.style.height = '300px';
    mainChartContainer.style.position = 'relative';
    containerGrafico.appendChild(mainChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartDesempenho';
    mainChartContainer.appendChild(canvas);
    
    // Extrair valores de retorno e entrada diretamente
    
    // Verificar o tema atual
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    
    // Determinar o valor máximo para configurar a escala Y corretamente
    
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div class="alert alert-danger">Chart.js não está disponível. Não foi possível renderizar o gráfico.</div>';
        console.error('Chart.js não está disponível');
        return;
    }
    

    const ctx = canvas.getContext('2d');
    graficoPerformaceSemanal = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 15, 3, 5, 2, 3],
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