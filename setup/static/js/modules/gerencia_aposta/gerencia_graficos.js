/**
 * Módulo para gráficos de desempenho na gerência de apostas
 * Versão otimizada com uso de API e melhor integração com o Django
 */

/**
 * Inicializa os gráficos de desempenho na tela de gerência
 */
export function initGerenciaGraficos() {
    // Verifica se estamos na página correta
    if (!document.getElementById('lucroTable')) return;
    
    // Inicializa os gráficos
    inicializarGraficoSemanal();
}

/**
 * Inicializa o gráfico de desempenho semanal usando a API
 */
function inicializarGraficoSemanal() {
    const chartContainer = document.getElementById('graficoDesempenhoSemanal');
    if (!chartContainer) return;
    
    // Exibir loader enquanto carrega
    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    // Primeiro vamos tentar obter dados da API
    fetch('/analytics/gerencia/api/desempenho-semanal/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar dados de desempenho semanal');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.dados && data.dados.length > 0) {
                renderizarGraficoSemanal(chartContainer, data.dados, data.analise);
            } else {
                // Se a API não retornar dados, extraímos dados da tabela
                const dados = extrairDadosTabela('S');
                renderizarGraficoSemanal(chartContainer, dados);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados do gráfico semanal:', error);
            // Fallback para extração de dados da tabela
            const dados = extrairDadosTabela('S');
            renderizarGraficoSemanal(chartContainer, dados);
        });
}



/**
 * Extrai dados da tabela para os gráficos
 * @param {string} categoria - Categoria de ciclo ('S' para semanal, 'M' para mensal)
 * @returns {Array} Array de objetos com os dados extraídos
 */
function extrairDadosTabela(categoria) {
    const tabela = document.getElementById('lucroTable');
    if (!tabela) return [];
    
    const linhas = tabela.querySelectorAll('tbody > tr:not(.collapse)');
    const dados = [];
    
    linhas.forEach(linha => {
        // Ignorar linhas sem dados ou linhas de colapso
        if (linha.classList.contains('collapse') || linha.children.length < 5) return;
        
        try {
            // Determinar categoria do ciclo
            const categoriaTd = linha.querySelector('td:nth-child(1) a');
            let categoriaTexto = '';
            
            if (categoriaTd) {
                categoriaTexto = categoriaTd.textContent.trim();
            }
            
            // Filtrar pela categoria solicitada
            let categoriaCiclo = '';
            if (categoriaTexto.includes('Semanal')) categoriaCiclo = 'S';
            else if (categoriaTexto.includes('Quinzenal')) categoriaCiclo = 'Q';
            else if (categoriaTexto.includes('Mensal')) categoriaCiclo = 'M';
            
            // Se não for a categoria solicitada, pular
            if (categoria && categoriaCiclo !== categoria) return;
            
            // Extrair período
            const periodoTd = linha.querySelector('td:nth-child(2)');
            let periodo = periodoTd ? periodoTd.textContent.trim() : '';
            
            // Extrair quantidade de entradas
            const qtdEntradasTd = linha.querySelector('td:nth-child(3)');
            const qtdEntradas = qtdEntradasTd ? parseInt(qtdEntradasTd.textContent.trim(), 10) || 0 : 0;
            
            // Extrair valor de entrada
            const valorEntradaTd = linha.querySelector('td:nth-child(4)');
            const valorEntrada = valorEntradaTd ? parseFloat(valorEntradaTd.textContent.trim().replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;
            
            // Extrair valor de retorno
            const valorRetornoTd = linha.querySelector('td:nth-child(5)');
            const valorRetorno = valorRetornoTd ? parseFloat(valorRetornoTd.textContent.trim().replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;
            
            // Calcular lucratividade
            let lucratividade = 0;
            if (valorEntrada > 0) {
                lucratividade = ((valorRetorno - valorEntrada) / valorEntrada) * 100;
            }
            
            // Adicionar dados ao array
            dados.push({
                periodo: periodo,
                qtdEntradas: qtdEntradas,
                valorEntrada: valorEntrada,
                valorRetorno: valorRetorno,
                lucratividade: lucratividade
            });
        } catch (error) {
            console.error('Erro ao extrair dados da linha:', error);
        }
    });
    
    return dados;
}

/**
 * Renderiza o gráfico de desempenho semanal
 * @param {HTMLElement} container - Elemento onde o gráfico será renderizado
 * @param {Array} dados - Dados do desempenho semanal
 * @param {Object} analise - Dados de análise geral (opcional)
 */
function renderizarGraficoSemanal(container, dados, analise = null) {
    // Limpar container
    container.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Não há dados de desempenho semanal disponíveis.</div>';
        return;
    }
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    canvas.style.height = '250px';
    container.appendChild(canvas);
    
    // Preparar dados para o gráfico
    const labels = dados.map(item => {
        // Usar primeiro item antes do "a" se possível para evitar labels muito longos
        if (item.periodo && item.periodo.includes('a')) {
            return item.periodo.split('a')[0].trim();
        }
        return item.periodo;
    });
    
    const valorRetornos = dados.map(item => item.valorRetorno);
    const valorEntradas = dados.map(item => item.valorEntrada);
    const lucratividades = dados.map(item => item.lucratividade);
    
    // Criar o gráfico
    const ctx = canvas.getContext('2d');
    
    // Configuração do Chart.js
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Valor Retornado (R$)',
                    data: valorRetornos,
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    pointBackgroundColor: '#4e73df',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4e73df',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Valor Investido (R$)',
                    data: valorEntradas,
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    pointBackgroundColor: '#1cc88a',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#1cc88a',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
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
                        // Adicionar lucratividade no tooltip
                        afterBody: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            const lucro = lucratividades[index];
                            return `Lucratividade: ${lucro.toFixed(2)}%`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Adicionar um gráfico de barras para lucratividade abaixo do gráfico principal
    const lucratividadeDiv = document.createElement('div');
    lucratividadeDiv.style.marginTop = '20px';
    lucratividadeDiv.style.height = '100px';
    container.appendChild(lucratividadeDiv);
    
    const lucratividadeCanvas = document.createElement('canvas');
    lucratividadeDiv.appendChild(lucratividadeCanvas);
    
    // Cores das barras com base nos valores (positivo/negativo)
    const backgroundColors = lucratividades.map(valor => 
        valor >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)'
    );
    
    const borderColors = lucratividades.map(valor => 
        valor >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'
    );
    
    new Chart(lucratividadeCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lucratividade (%)',
                data: lucratividades,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Lucratividade: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Lucratividade (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    display: false
                }
            }
        }
    });
    
    // Se tivermos dados de análise, exibir resumo estatístico
    if (analise) {
        const resumoDiv = document.createElement('div');
        resumoDiv.className = 'mt-3 text-center';
        resumoDiv.innerHTML = `
            <p class="mb-0"><small>Lucratividade média: <strong>${analise.lucratividade_media?.toFixed(2) || 0}%</strong></small></p>
        `;
        container.appendChild(resumoDiv);
    }
}
