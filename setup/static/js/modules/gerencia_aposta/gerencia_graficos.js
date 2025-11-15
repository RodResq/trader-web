
export function initGerenciaGraficos() {
    if (!document.getElementById('lucroTable')) return;
    
    inicializarGraficoDesempenho();
    setupTableObserver();
}


function setupTableObserver() {
    const tabela = document.getElementById('lucroTable');
    if (!tabela) return;
    
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || 
                (mutation.type === 'attributes' && mutation.attributeName === 'class')) {
                shouldUpdate = true;
            }
            
            if (mutation.type === 'characterData' && 
                mutation.target.parentNode && 
                mutation.target.parentNode.tagName === 'TD') {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            console.log('Detectada alteração na tabela, atualizando gráfico...');
            setTimeout(inicializarGraficoDesempenho, 300);
        }
    });
    
    const config = { 
        childList: true,        // Observar adições/remoções diretas de nós filhos
        subtree: true,          // Observar todos os descendentes
        characterData: true,    // Observar mudanças no conteúdo de texto
        attributes: true,       // Observar mudanças de atributos
        attributeFilter: ['class', 'style']  // Filtrar apenas atributos relevantes
    };
    
    // Iniciar observação da tabela
    observer.observe(tabela, config);
    console.log('Observador de tabela configurado com sucesso');
    
    document.addEventListener('cicloAdded', () => {
        console.log('Evento cicloAdded detectado');
        inicializarGraficoDesempenho();
    });
    
    document.addEventListener('apostaUpdated', () => {
        console.log('Evento apostaUpdated detectado');
        inicializarGraficoDesempenho();
    });
    
    const salvarBtns = document.querySelectorAll('.salvar-resultado, .confirmarResultadoBtn');
    salvarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(inicializarGraficoDesempenho, 500);
        });
    });
}

/**
 * TODO Inicializa o gráfico de desempenho usando os dados da tabela - USAR DADOS DO BACKEND
 */
function inicializarGraficoDesempenho() {
    const chartContainer = document.getElementById('graficoDesempenhoSemanal');
    if (!chartContainer) return;
    
    chartContainer.style.height = '350px';
    chartContainer.style.overflow = 'hidden';

    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    const dados = extrairApenasLinhasPrincipais();
    
    if (dados && dados.length > 0) {
        renderizarGraficoDesempenho(chartContainer, dados);
    } else {
        chartContainer.innerHTML = '<div class="alert alert-info">Não foi possível extrair dados dos ciclos. Verifique se a tabela está carregada corretamente.</div>';
    }
}


function extrairApenasLinhasPrincipais() {
    const tabela = document.getElementById('lucroTable');
    if (!tabela) {
        console.error('Tabela não encontrada');
        return [];
    }
    
    const dados = [];

    const todasLinhas = tabela.querySelectorAll('tbody > tr');
    
    const linhasPrincipais = Array.from(todasLinhas).filter(linha => {
        const primeiraColuna = linha.querySelector('td:first-child');
        if (!primeiraColuna) return false;
        
        const linkExpansao = primeiraColuna.querySelector('a[data-bs-toggle="collapse"]');
        return !!linkExpansao;
    });
    
    console.log(`Encontradas ${linhasPrincipais.length} linhas principais`);
    
    linhasPrincipais.forEach((linha, index) => {
        try {            
            const cicloCell = linha.querySelector('td:first-child');
            const cicloText = cicloCell ? cicloCell.textContent.trim() : '';
            
            let dataInicial = '';
            let dataFinal = '';
            if (cicloText) {
                const match = cicloText.match(/De\s+(\d{2}\/\d{2}\/\d{4})\s+à\s+(\d{2}\/\d{2}\/\d{4})/i);
                if (match && match.length >= 3) {
                    dataInicial = match[1];
                    dataFinal = match[2];
                }
            }
            
            const qtdCell = linha.querySelector('td:nth-child(2)');
            const qtdEntradas = qtdCell ? parseInt(qtdCell.textContent.trim(), 10) || 0 : 0;
            
            const entradaCell = linha.querySelector('td:nth-child(3)');
            const entradaText = entradaCell ? entradaCell.textContent.trim() : '0';
            const valorEntrada = parseFloat(entradaText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            
            const retornoCell = linha.querySelector('td:nth-child(4)');
            const retornoText = retornoCell ? retornoCell.textContent.trim() : '0';
            const valorRetorno = parseFloat(retornoText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            
            let categoriaNome = 'Semanal';
            
            console.log(`Linha principal ${index}: Categoria: ${categoriaNome}, Período: ${cicloText}, Entrada: ${valorEntrada}, Retorno: ${valorRetorno}`);
            
            if (dataInicial && cicloText) {
                dados.push({
                    categoria: categoriaNome,
                    periodo: cicloText,
                    dataInicial: dataInicial,
                    dataFinal: dataFinal,
                    qtdEntradas: qtdEntradas,
                    valorEntrada: valorEntrada,
                    valorRetorno: valorRetorno
                });
            }
        } catch (error) {
            console.error('Erro ao processar linha principal:', error, linha);
        }
    });
    
    // TODO refatorar
    if (dados.length === 0) {
        console.log('Tentando abordagem alternativa...');
        try {
            const linhasCategoria = tabela.querySelectorAll('tbody > tr td:first-child a');
            
            linhasCategoria.forEach(link => {
                if (link.getAttribute('data-bs-toggle') === 'collapse') {
                    const linha = link.closest('tr');
                    if (!linha) return;
                    
                    const categoria = link.textContent.trim();
                    
                    const cicloCell = linha.querySelector('td:nth-child(2)');
                    const cicloText = cicloCell ? cicloCell.textContent.trim() : '';
                    
                    let dataInicial = '';
                    let dataFinal = '';
                    if (cicloText) {
                        const match = cicloText.match(/De\s+(\d{2}\/\d{2}\/\d{4})\s+à\s+(\d{2}\/\d{2}\/\d{4})/i);
                        if (match && match.length >= 3) {
                            dataInicial = match[1];
                            dataFinal = match[2];
                        }
                    }
                    
                    const qtdCell = linha.querySelector('td:nth-child(3)');
                    const qtdEntradas = qtdCell ? parseInt(qtdCell.textContent.trim(), 10) || 0 : 0;
                    
                    const entradaCell = linha.querySelector('td:nth-child(4)');
                    const entradaText = entradaCell ? entradaCell.textContent.trim() : '0';
                    const valorEntrada = parseFloat(entradaText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    
                    const retornoCell = linha.querySelector('td:nth-child(5)');
                    const retornoText = retornoCell ? retornoCell.textContent.trim() : '0';
                    const valorRetorno = parseFloat(retornoText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    
                    let categoriaNome = 'Semanal';
                    if (categoria.includes('S')) categoriaNome = 'Semanal';
                    else if (categoria.includes('Q')) categoriaNome = 'Quinzenal';
                    else if (categoria.includes('M')) categoriaNome = 'Mensal';
                    
                    if (dataInicial) {
                        dados.push({
                            categoria: categoriaNome,
                            periodo: cicloText,
                            dataInicial: dataInicial,
                            dataFinal: dataFinal,
                            qtdEntradas: qtdEntradas,
                            valorEntrada: valorEntrada,
                            valorRetorno: valorRetorno
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Erro na abordagem alternativa:', error);
        }
    }
    
    dados.sort((a, b) => {
        const dateA = parseDateBR(a.dataInicial);
        const dateB = parseDateBR(b.dataInicial);
        return dateA - dateB;
    });
    
    console.log('Dados extraídos das linhas principais:', dados);
    return dados;
}


function parseDateBR(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    return new Date(parts[2], parts[1] - 1, parts[0]);
}


function renderizarGraficoDesempenho(container, dados) {
    container.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Não há dados de desempenho disponíveis.</div>';
        return;
    }
    
    const existingChart = window.graficoDesempenho;

    const mainChartContainer = document.createElement('div');
    mainChartContainer.style.width = '100%';
    mainChartContainer.style.height = '300px';
    mainChartContainer.style.position = 'relative';
    container.appendChild(mainChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartDesempenho';
    mainChartContainer.appendChild(canvas);
    
    const dadosCompletos = dados.every(item => 
        item.hasOwnProperty('valorEntrada') && 
        item.hasOwnProperty('valorRetorno') && 
        item.hasOwnProperty('dataInicial')
    );
    
    console.log('Todos os dados estão completos?', dadosCompletos);
    
    const labels = dados.map(item => {
        if (item.dataInicial) {
            const parts = item.dataInicial.split('/');
            if (parts.length === 3) {
                return `${parts[0]}/${parts[1]}/${parts[2].substr(2, 2)}`;
            }
        }
        return 'Período';
    });
    
    const valorRetornos = dados.map(item => item.valorRetorno || 0);
    const valorEntradas = dados.map(item => item.valorEntrada || 0);
    
    console.log('Valores de retorno a serem plotados:', valorRetornos);
    console.log('Valores de entrada a serem plotados:', valorEntradas);
    
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    
    const maxRetorno = Math.max(...valorRetornos);
    const maxEntrada = Math.max(...valorEntradas);
    const maxValue = Math.max(maxRetorno, maxEntrada, 10);
    
    const yAxisMax = maxValue * 1.2;
    
    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div class="alert alert-danger">Chart.js não está disponível. Não foi possível renderizar o gráfico.</div>';
        console.error('Chart.js não está disponível');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Valor Retornado (R$)',
                    data: valorRetornos,
                    borderColor: '#147006',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    pointBackgroundColor: '#147006',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#147006',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1, 
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Valor Investido (R$)',
                    data: valorEntradas,
                    borderColor: '#c81c1c',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    pointBackgroundColor: '#c81c1c',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#c81c1c',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1, 
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'R$ ' + context.parsed.y.toFixed(2);
                            }
                            return label;
                        },
                        afterBody: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            const periodo = dados[index].periodo || '';
                            const categoria = dados[index].categoria || 'Semanal';
                            
                            return [
                                `Período: ${periodo}`,
                                `Categoria: ${categoria}`,
                                `Qtd. Entradas: ${dados[index].qtdEntradas}`
                            ];
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                        padding: 15,
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMin: 0,
                    suggestedMax: yAxisMax,
                    title: {
                        display: true,
                        text: 'Valor (R$)',
                        color: textColor
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        },
                        color: textColor,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 3
                },
                point: {
                    radius: 6,
                    hoverRadius: 8,
                    borderWidth: 2
                }
            },
            animation: {
                duration: 200 
            }
        }
    });

    window.graficoDesempenho = chart;

    const totalEntradas = valorEntradas.reduce((sum, value) => sum + value, 0);
    const totalRetornos = valorRetornos.reduce((sum, value) => sum + value, 0);
    
    const formattedTotalEntradas = totalEntradas.toFixed(2);
    const formattedTotalRetornos = totalRetornos.toFixed(2);
    
    const resumoDiv = document.createElement('div');
    resumoDiv.className = 'mt-3 text-center p-2 rounded';
    resumoDiv.innerHTML = `
        <p class="mb-0">Total investido: <strong>R$ ${formattedTotalEntradas}</strong> | Total retornado: <strong>R$ ${formattedTotalRetornos}</strong></p>
    `;
    container.appendChild(resumoDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGerenciaGraficos, 300);
    
    const chartContainer = document.getElementById('graficoDesempenhoSemanalCardHeader');
    if (chartContainer) {
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn btn-sm btn-outline-primary position-absolute';
        refreshButton.style.top = '10px';
        refreshButton.style.right = '10px';
        refreshButton.style.zIndex = '100';
        refreshButton.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
        refreshButton.title = 'Atualizar gráfico';
        refreshButton.addEventListener('click', inicializarGraficoDesempenho);
        
        const chartParent = chartContainer.closest('.card-body') || chartContainer.parentNode;
        if (chartParent) {
            chartParent.style.position = 'relative';
            chartParent.appendChild(refreshButton);
        }
    }
});
