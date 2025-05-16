/**
 * Módulo para gráficos de desempenho na gerência de apostas
 * Versão corrigida para exibir apenas os totais por ciclo
 */

/**
 * Inicializa os gráficos de desempenho na tela de gerência
 */
export function initGerenciaGraficos() {
    // Verifica se estamos na página correta
    if (!document.getElementById('lucroTable')) return;
    
    // Inicializa os gráficos
    inicializarGraficoDesempenho();
    
    // Configurar observador de mudanças na tabela para atualização automática
    setupTableObserver();
}

/**
 * Configura um observador para detectar mudanças na tabela e atualizar o gráfico
 */
function setupTableObserver() {
    const tabela = document.getElementById('lucroTable');
    if (!tabela) return;
    
    // Configurar o MutationObserver para monitorar mudanças na tabela
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // Verificar se alguma linha foi adicionada ou removida
            if (mutation.type === 'childList' || 
                (mutation.type === 'attributes' && mutation.attributeName === 'class')) {
                shouldUpdate = true;
            }
            
            // Verificar se houve mudanças no conteúdo das células
            if (mutation.type === 'characterData' && 
                mutation.target.parentNode && 
                mutation.target.parentNode.tagName === 'TD') {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            console.log('Detectada alteração na tabela, atualizando gráfico...');
            // Pequeno atraso para garantir que todas as mudanças tenham sido aplicadas
            setTimeout(inicializarGraficoDesempenho, 300);
        }
    });
    
    // Configurar opções do observador (observar adições/remoções de nós e mudanças de atributos)
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
    
    // Adicionar listener para eventos específicos que indicam mudanças nos dados
    document.addEventListener('cicloAdded', () => {
        console.log('Evento cicloAdded detectado');
        inicializarGraficoDesempenho();
    });
    
    document.addEventListener('apostaUpdated', () => {
        console.log('Evento apostaUpdated detectado');
        inicializarGraficoDesempenho();
    });
    
    // Adicionar listener para atualização quando um botão de salvamento for clicado
    const salvarBtns = document.querySelectorAll('.salvar-resultado, .confirmarResultadoBtn');
    salvarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Aguardar um pouco para que os dados sejam salvos no servidor
            setTimeout(inicializarGraficoDesempenho, 500);
        });
    });
}

/**
 * Inicializa o gráfico de desempenho usando os dados da tabela
 */
function inicializarGraficoDesempenho() {
    const chartContainer = document.getElementById('graficoDesempenhoSemanal');
    if (!chartContainer) return;
    
    // Configurar o container para ter uma altura fixa adequada
    chartContainer.style.height = '350px';
    chartContainer.style.overflow = 'hidden';

    // Exibir loader enquanto carrega
    chartContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
    
    // Extrair dados diretamente das linhas principais da tabela
    const dados = extrairApenasLinhasPrincipais();
    
    if (dados && dados.length > 0) {
        renderizarGraficoDesempenho(chartContainer, dados);
    } else {
        chartContainer.innerHTML = '<div class="alert alert-info">Não foi possível extrair dados dos ciclos. Verifique se a tabela está carregada corretamente.</div>';
    }
}

/**
 * Extrai dados APENAS das linhas principais da tabela de resultados
 * Implementação mais restritiva para garantir que apenas as linhas de total sejam capturadas
 * @returns {Array} Array de objetos com os dados extraídos
 */
function extrairApenasLinhasPrincipais() {
    // Obter a tabela principal
    const tabela = document.getElementById('lucroTable');
    if (!tabela) {
        console.error('Tabela não encontrada');
        return [];
    }
    
    const dados = [];
    
    // Obter todas as linhas da tabela que são linhas raiz (não estão dentro de tr.collapse)
    // Abordagem completamente nova: usar apenas linhas que têm a célula de categoria (coluna 1) com um link de expansão
    const todasLinhas = tabela.querySelectorAll('tbody > tr');
    
    // Filtrar apenas as linhas principais que têm um link para expandir na primeira coluna
    const linhasPrincipais = Array.from(todasLinhas).filter(linha => {
        // Verificar se é uma linha principal real (tem link de expansão na primeira coluna)
        const primeiraColuna = linha.querySelector('td:first-child');
        if (!primeiraColuna) return false;
        
        // Verificar se tem um link de expansão
        const linkExpansao = primeiraColuna.querySelector('a[data-bs-toggle="collapse"]');
        return !!linkExpansao;
    });
    
    console.log(`Encontradas ${linhasPrincipais.length} linhas principais`);
    
    // Processar apenas as linhas principais
    linhasPrincipais.forEach((linha, index) => {
        try {
            // Extrair categoria diretamente
            const categoriaCell = linha.querySelector('td:first-child');
            const categoriaLink = categoriaCell ? categoriaCell.querySelector('a') : null;
            const categoria = categoriaLink ? categoriaLink.textContent.trim() : '';
            
            // Extrair período/ciclo
            const cicloCell = linha.querySelector('td:nth-child(2)');
            const cicloText = cicloCell ? cicloCell.textContent.trim() : '';
            
            // Extrair datas do período (formato: "De DD/MM/YYYY à DD/MM/YYYY")
            let dataInicial = '';
            let dataFinal = '';
            if (cicloText) {
                const match = cicloText.match(/De\s+(\d{2}\/\d{2}\/\d{4})\s+à\s+(\d{2}\/\d{2}\/\d{4})/i);
                if (match && match.length >= 3) {
                    dataInicial = match[1];
                    dataFinal = match[2];
                }
            }
            
            // Obter quantidade de entradas
            const qtdCell = linha.querySelector('td:nth-child(3)');
            const qtdEntradas = qtdCell ? parseInt(qtdCell.textContent.trim(), 10) || 0 : 0;
            
            // Obter valor total de entradas (valor investido)
            const entradaCell = linha.querySelector('td:nth-child(4)');
            const entradaText = entradaCell ? entradaCell.textContent.trim() : '0';
            // Parser mais robusto para números com vírgula decimal
            const valorEntrada = parseFloat(entradaText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            
            // Obter valor total retornado
            const retornoCell = linha.querySelector('td:nth-child(5)');
            const retornoText = retornoCell ? retornoCell.textContent.trim() : '0';
            // Parser mais robusto para números com vírgula decimal
            const valorRetorno = parseFloat(retornoText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            
            // Determinar categoria do ciclo para exibição
            let categoriaNome = 'Semanal';
            if (categoria.includes('S')) categoriaNome = 'Semanal';
            else if (categoria.includes('Q')) categoriaNome = 'Quinzenal';
            else if (categoria.includes('M')) categoriaNome = 'Mensal';
            
            // Logging para debug
            console.log(`Linha principal ${index}: Categoria: ${categoria}, Período: ${cicloText}, Entrada: ${valorEntrada}, Retorno: ${valorRetorno}`);
            
            // Adicionar dados ao array apenas se tivermos período válido
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
    
    // Se a extração falhar, tente uma abordagem alternativa
    if (dados.length === 0) {
        console.log('Tentando abordagem alternativa...');
        try {
            // Extrair diretamente das linhas que têm links de categoria (S, Q, M)
            const linhasCategoria = tabela.querySelectorAll('tbody > tr td:first-child a');
            
            linhasCategoria.forEach(link => {
                // Verificar se não é um link de expansão
                if (link.getAttribute('data-bs-toggle') === 'collapse') {
                    const linha = link.closest('tr');
                    if (!linha) return;
                    
                    const categoria = link.textContent.trim();
                    
                    // Extrair período/ciclo
                    const cicloCell = linha.querySelector('td:nth-child(2)');
                    const cicloText = cicloCell ? cicloCell.textContent.trim() : '';
                    
                    // Extrair datas do período
                    let dataInicial = '';
                    let dataFinal = '';
                    if (cicloText) {
                        const match = cicloText.match(/De\s+(\d{2}\/\d{2}\/\d{4})\s+à\s+(\d{2}\/\d{2}\/\d{4})/i);
                        if (match && match.length >= 3) {
                            dataInicial = match[1];
                            dataFinal = match[2];
                        }
                    }
                    
                    // Obter quantidade de entradas
                    const qtdCell = linha.querySelector('td:nth-child(3)');
                    const qtdEntradas = qtdCell ? parseInt(qtdCell.textContent.trim(), 10) || 0 : 0;
                    
                    // Obter valor total de entradas
                    const entradaCell = linha.querySelector('td:nth-child(4)');
                    const entradaText = entradaCell ? entradaCell.textContent.trim() : '0';
                    const valorEntrada = parseFloat(entradaText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    
                    // Obter valor total retornado
                    const retornoCell = linha.querySelector('td:nth-child(5)');
                    const retornoText = retornoCell ? retornoCell.textContent.trim() : '0';
                    const valorRetorno = parseFloat(retornoText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    
                    // Determinar categoria do ciclo
                    let categoriaNome = 'Semanal';
                    if (categoria.includes('S')) categoriaNome = 'Semanal';
                    else if (categoria.includes('Q')) categoriaNome = 'Quinzenal';
                    else if (categoria.includes('M')) categoriaNome = 'Mensal';
                    
                    // Adicionar dados ao array
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
    
    // Ordenar dados por data inicial
    dados.sort((a, b) => {
        const dateA = parseDateBR(a.dataInicial);
        const dateB = parseDateBR(b.dataInicial);
        return dateA - dateB;
    });
    
    console.log('Dados extraídos das linhas principais:', dados);
    return dados;
}

/**
 * Função para converter data no formato BR (DD/MM/YYYY) para objeto Date
 * @param {string} dateStr - Data no formato DD/MM/YYYY
 * @returns {Date} Objeto Date
 */
function parseDateBR(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    // Note: mês em JS é zero-based (0-11)
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

/**
 * Renderiza o gráfico de desempenho
 * @param {HTMLElement} container - Elemento onde o gráfico será renderizado
 * @param {Array} dados - Dados do desempenho
 */
function renderizarGraficoDesempenho(container, dados) {
    // Limpar container
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
    
    // Criar canvas para o gráfico principal em um container próprio
    const mainChartContainer = document.createElement('div');
    mainChartContainer.style.width = '100%';
    mainChartContainer.style.height = '300px';
    mainChartContainer.style.position = 'relative';
    container.appendChild(mainChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'mainChartDesempenho';
    mainChartContainer.appendChild(canvas);
    
    // Verificar completude dos dados para debugging
    const dadosCompletos = dados.every(item => 
        item.hasOwnProperty('valorEntrada') && 
        item.hasOwnProperty('valorRetorno') && 
        item.hasOwnProperty('dataInicial')
    );
    
    console.log('Todos os dados estão completos?', dadosCompletos);
    
    // Preparar dados para o gráfico
    const labels = dados.map(item => {
        // Mostrar a data inicial em formato curto
        if (item.dataInicial) {
            const parts = item.dataInicial.split('/');
            if (parts.length === 3) {
                return `${parts[0]}/${parts[1]}/${parts[2].substr(2, 2)}`;
            }
        }
        return 'Período';
    });
    
    // Extrair valores de retorno e entrada diretamente
    const valorRetornos = dados.map(item => item.valorRetorno || 0);
    const valorEntradas = dados.map(item => item.valorEntrada || 0);
    
    console.log('Valores de retorno a serem plotados:', valorRetornos);
    console.log('Valores de entrada a serem plotados:', valorEntradas);
    
    // Verificar o tema atual
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    
    // Determinar o valor máximo para configurar a escala Y corretamente
    const maxRetorno = Math.max(...valorRetornos);
    const maxEntrada = Math.max(...valorEntradas);
    const maxValue = Math.max(maxRetorno, maxEntrada, 10);
    
    // Adicionar 20% de margem no topo para melhor visualização
    const yAxisMax = maxValue * 1.2;
    
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div class="alert alert-danger">Chart.js não está disponível. Não foi possível renderizar o gráfico.</div>';
        console.error('Chart.js não está disponível');
        return;
    }
    
    // Configuração do Chart.js
    const ctx = canvas.getContext('2d');
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
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1, // Reduzido para linhas mais retas
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1, // Reduzido para linhas mais retas
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
                duration: 500 // Animação mais rápida para atualizações
            }
        }
    });

    // Armazenar referência ao gráfico na janela para poder destruí-lo mais tarde se necessário
    window.graficoDesempenho = chart;

    // Calcular e exibir resumo dos valores totais
    const totalEntradas = valorEntradas.reduce((sum, value) => sum + value, 0);
    const totalRetornos = valorRetornos.reduce((sum, value) => sum + value, 0);
    
    // Formatar valores
    const formattedTotalEntradas = totalEntradas.toFixed(2);
    const formattedTotalRetornos = totalRetornos.toFixed(2);
    
    // Criar um elemento para o resumo
    const resumoDiv = document.createElement('div');
    resumoDiv.className = 'mt-3 text-center bg-light p-2 rounded';
    resumoDiv.innerHTML = `
        <p class="mb-0">Total investido: <strong>R$ ${formattedTotalEntradas}</strong> | Total retornado: <strong>R$ ${formattedTotalRetornos}</strong></p>
    `;
    container.appendChild(resumoDiv);
}

// Adicionar listener para atualização quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Pequeno atraso para garantir que a tabela esteja completamente carregada
    setTimeout(initGerenciaGraficos, 300);
    
    // Adicionar botão de atualização manual (opcional)
    const chartContainer = document.getElementById('graficoDesempenhoSemanal');
    if (chartContainer) {
        const refreshButton = document.createElement('button');
        refreshButton.className = 'btn btn-sm btn-outline-primary position-absolute';
        refreshButton.style.top = '10px';
        refreshButton.style.right = '10px';
        refreshButton.style.zIndex = '100';
        refreshButton.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
        refreshButton.title = 'Atualizar gráfico';
        refreshButton.addEventListener('click', inicializarGraficoDesempenho);
        
        // Encontrar o elemento pai do gráfico
        const chartParent = chartContainer.closest('.card-body') || chartContainer.parentNode;
        if (chartParent) {
            chartParent.style.position = 'relative';
            chartParent.appendChild(refreshButton);
        }
    }
});
