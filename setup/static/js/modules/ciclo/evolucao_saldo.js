let graficoEvolucao = null;
let chartJsLoaded = false;

// async function loadChartJs() {
//     if (typeof Chart !== 'undefined') {
//         chartJsLoaded = true;
//         return Promise.resolve();
//     }

//     return new Promise((resolve, reject) => {
//         const script = document.createElement('script');
//         script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
//         script.onload = () => {
//             chartJsLoaded = true;
//             console.log('Chart.js carregado dinamicamente');
//             resolve();
//         };
//         script.onerror = () => {
//             console.error('Erro ao carregar Chart.js dinamicamente');
//             reject(new Error('Falha ao carregar Chart.js'));
//         };
//         document.head.appendChild(script);
//     });
// }

// document.addEventListener('DOMContentLoaded', async function() {

//     try {
//         await loadChartJs();
//         // setupEvolucaoSaldoModal();
//     } catch (error) {
//         console.error('Erro ao carregar Chart.js:', error);
//         showChartError();
//     }

// });

export function setupEvolucaoSaldoModal() {

    const botoesEvolucao = document.querySelectorAll('.btn-evolucao-saldo');
    const modal = document.getElementById('evolucaoSaldoModal');

    if (!modal || botoesEvolucao.length === 0) return;

    

    botoesEvolucao.forEach(botao => {
        botao.addEventListener('click', function() {
            console.log('Clicou no btn de modal');
            
            const cicloId = this.dataset.cicloId;
            const cicloCategoria = this.dataset.cicloCategoria;
            const cicloPeriodo = this.dataset.cicloPeriodo;

            document.getElementById('modalCicloInfo').textContent = 
                `${cicloCategoria} ${cicloPeriodo}`;

            modalInstance.show();
            carregarDadosEvolucao(cicloId);
        });
    });

    modal.addEventListener('hidden.bs.modal', function() {
        limparModal();
    });
}

async function carregarDadosEvolucao(cicloId) {
    const loadingElement = documento.getElementById('evolucaoSaldoLoading');
    const contentElement = document.getElementById('evolucaoSaldoContent');
    const errorElement = document.getElementById('evolucaoSaldoError');

    mostrarElemento(loadingElement);
    ocultarElemento(contentElement);
    ocultarElemento(errorElement);

    try {
        const response = await fetch(`/ciclos/api/evolucao-saldo/${cicloId}/`);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            renderizarDados(data);
            mostrarElemento(contentElement);
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarElemento(errorElement);
    } finally {
        ocultarElemento(loadingElement);
    }
}

function renderizarDados(data) {
    const { ciclo, dados, analise } = data;
    atualizarEstatisticas(analise);
    renderizarGrafico(dados);
    atualizarDetalhes(analise);
}

function atualizarEstatisticas(analise) {
    document.getElementById('saldoInicial').textContent = 
        `R$ ${analise.saldo_inicial?.toFixed(2) || '0,00'}`;
    
    document.getElementById('saldoFinal').textContent = 
        `R$ ${analise.saldo_final?.toFixed(2) || '0,00'}`;
    
    const variacao = analise.variacao_total || 0;
    const variacaoElement = document.getElementById('variacao');
    const variacaoCard = document.getElementById('variacao-card');
    
    variacaoElement.textContent = `R$ ${variacao.toFixed(2)}`;
    
    variacaoCard.className = 'card text-white';
    if (variacao > 0) {
        variacaoCard.classList.add('bg-success');
    } else if (variacao < 0) {
        variacaoCard.classList.add('bg-danger');
    } else {
        variacaoCard.classList.add('bg-secondary');
    }
    
    document.getElementById('totalRegistros').textContent = analise.total_registros || 0;
}

function renderizarGrafico(dados) {
    const ctx = document.getElementById('graficoEvolucaoSaldo');
    
    if (!ctx) {
        console.error('Canvas do gráfico não encontrado');
        return;
    }

    // Destruir gráfico existente se houver
    if (graficoEvolucao) {
        graficoEvolucao.destroy();
    }

    // Verificar o tema atual
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Preparar dados
    const labels = dados.map(item => item.data);
    const saldos = dados.map(item => item.saldo);
    const disponiveis = dados.map(item => item.disponivel_entrada);

    // Configurar gráfico
    graficoEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Saldo Atual (R$)',
                    data: saldos,
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    pointBackgroundColor: '#4e73df',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4e73df',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Disponível para Entrada (R$)',
                    data: disponiveis,
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    pointBackgroundColor: '#1cc88a',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#1cc88a',
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
                        color: gridColor
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data',
                        color: textColor
                    },
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
                duration: 800
            }
        }
    });
}


function atualizarDetalhes(analise) {
    if (analise.maior_saldo) {
        document.getElementById('maiorSaldoValor').textContent = 
            `R$ ${analise.maior_saldo.valor.toFixed(2)}`;
        document.getElementById('maiorSaldoData').textContent = 
            analise.maior_saldo.data;
    } else {
        document.getElementById('maiorSaldoValor').textContent = '-';
        document.getElementById('maiorSaldoData').textContent = '-';
    }

    if (analise.menor_saldo) {
        document.getElementById('menorSaldoValor').textContent = 
            `R$ ${analise.menor_saldo.valor.toFixed(2)}`;
        document.getElementById('menorSaldoData').textContent = 
            analise.menor_saldo.data;
    } else {
        document.getElementById('menorSaldoValor').textContent = '-';
        document.getElementById('menorSaldoData').textContent = '-';
    }
}

function limparModal() {
    if (graficoEvolucao) {
        graficoEvolucao.destroy();
        graficoEvolucao = null;
    }

    document.getElementById('modalCicloInfo').textContent = '';
    
    document.getElementById('saldoInicial').textContent = 'R$ 0,00';
    document.getElementById('saldoFinal').textContent = 'R$ 0,00';
    document.getElementById('variacao').textContent = 'R$ 0,00';
    document.getElementById('totalRegistros').textContent = '0';
    
    document.getElementById('maiorSaldoValor').textContent = '-';
    document.getElementById('maiorSaldoData').textContent = '-';
    document.getElementById('menorSaldoValor').textContent = '-';
    document.getElementById('menorSaldoData').textContent = '-';
    
    const variacaoCard = document.getElementById('variacao-card');
    variacaoCard.className = 'card text-white bg-secondary';
}

function mostrarElemento(element) {
    if (element) {
        element.style.display = 'block';
    }
}

function ocultarElemento(element) {
    if (element) {
        element.style.display = 'none';
    }
}

window.setupEvolucaoSaldoModal = setupEvolucaoSaldoModal;
