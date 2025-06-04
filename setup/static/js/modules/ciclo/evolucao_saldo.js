let graficoEvolucao = null;
let modalInstance = null;

export function setupEvolucaoSaldoModal() {
    const botoesEvolucao = document.querySelectorAll('.btn-evolucao-saldo');
    const modal = document.getElementById('evolucaoSaldoModal');

    if (!modal || botoesEvolucao.length === 0) return;

    // Inicializar instância do modal Bootstrap
    modalInstance = new bootstrap.Modal(modal);

    // Configurar event listeners para os botões
    botoesEvolucao.forEach(botao => {
        botao.addEventListener('click', function() {
            const cicloId = this.dataset.cicloId;
            const cicloCategoria = this.dataset.cicloCategoria;
            const cicloPeriodo = this.dataset.cicloPeriodo;

            // Atualizar título do modal
            document.getElementById('modalCicloInfo').textContent = 
                `${cicloCategoria} - ${cicloPeriodo}`;

            // Mostrar modal e carregar dados
            modalInstance.show();
            carregarDadosEvolucao(cicloId);
        });
    });

    // Limpar modal quando fechado
    modal.addEventListener('hidden.bs.modal', function() {
        limparModal();
    });

    // Configurar botão de exportar
    const btnExportar = document.getElementById('exportarDados');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarDados);
    }
}

async function carregarDadosEvolucao(cicloId) {
    const loadingElement = document.getElementById('evolucaoSaldoLoading');
    const contentElement = document.getElementById('evolucaoSaldoContent');
    const errorElement = document.getElementById('evolucaoSaldoError');

    // Mostrar loading
    mostrarElemento(loadingElement);
    ocultarElemento(contentElement);
    ocultarElemento(errorElement);

    try {
        const response = await fetch(`/ciclos/api/evolucao-saldo/${cicloId}/`);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            renderizarDados(data);
            mostrarElemento(contentElement);
        } else {
            throw new Error(data.error || 'Erro desconhecido ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de evolução:', error);
        mostrarElemento(errorElement);
        
        // Atualizar mensagem de erro
        const errorMsg = errorElement.querySelector('i').nextSibling;
        if (errorMsg) {
            errorMsg.textContent = ` ${error.message}`;
        }
    } finally {
        ocultarElemento(loadingElement);
    }
}

function renderizarDados(data) {
    const { ciclo, dados, analise } = data;
    
    // Atualizar estatísticas
    atualizarEstatisticas(analise);
    
    // Renderizar gráfico
    if (dados && dados.length > 0) {
        renderizarGrafico(dados);
    } else {
        mostrarGraficoVazio();
    }
    
    // Atualizar detalhes
    atualizarDetalhes(analise);
}

function atualizarEstatisticas(analise) {
    // Saldo inicial e final
    document.getElementById('saldoInicial').textContent = 
        `R$ ${(analise.saldo_inicial || 0).toFixed(2).replace('.', ',')}`;
    
    document.getElementById('saldoFinal').textContent = 
        `R$ ${(analise.saldo_final || 0).toFixed(2).replace('.', ',')}`;
    
    // Variação
    const variacao = analise.variacao_total || 0;
    const variacaoElement = document.getElementById('variacao');
    const variacaoCard = document.getElementById('variacao-card');
    
    variacaoElement.textContent = `R$ ${Math.abs(variacao).toFixed(2).replace('.', ',')}`;
    
    // Definir cor do card baseado na variação
    variacaoCard.className = 'card text-white';
    if (variacao > 0) {
        variacaoCard.classList.add('bg-success');
        variacaoElement.textContent = '+' + variacaoElement.textContent;
    } else if (variacao < 0) {
        variacaoCard.classList.add('bg-danger');
        variacaoElement.textContent = '-' + variacaoElement.textContent;
    } else {
        variacaoCard.classList.add('bg-secondary');
    }
    
    // Total de registros
    document.getElementById('totalRegistros').textContent = analise.total_registros || 0;
}

function renderizarGrafico(dados) {
    const ctx = document.getElementById('graficoEvolucaoSaldo');
    
    if (!ctx) {
        console.error('Canvas do gráfico não encontrado');
        return;
    }

    // Destruir gráfico existente
    if (graficoEvolucao) {
        graficoEvolucao.destroy();
        graficoEvolucao = null;
    }

    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        ctx.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    // Verificar tema atual
    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Preparar dados para o gráfico
    const labels = dados.map(item => item.data);
    const saldos = dados.map(item => parseFloat(item.saldo) || 0);
    const disponiveis = dados.map(item => parseFloat(item.disponivel_entrada) || 0);

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
                    tension: 0.3,
                    pointRadius: 5,
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
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDarkTheme ? '#555' : '#ddd',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        padding: 20,
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)',
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2).replace('.', ',');
                        },
                        color: textColor,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data',
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            size: 11
                        },
                        maxRotation: 45
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 3
                },
                point: {
                    radius: 5,
                    hoverRadius: 8,
                    borderWidth: 2
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutCubic'
            }
        }
    });
}

function mostrarGraficoVazio() {
    const ctx = document.getElementById('graficoEvolucaoSaldo');
    if (ctx) {
        ctx.parentElement.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="bi bi-info-circle me-2"></i>
                Não há dados de evolução disponíveis para este ciclo.
            </div>
        `;
    }
}

function atualizarDetalhes(analise) {
    // Maior saldo
    if (analise.maior_saldo) {
        document.getElementById('maiorSaldoValor').textContent = 
            `R$ ${analise.maior_saldo.valor.toFixed(2).replace('.', ',')}`;
        document.getElementById('maiorSaldoData').textContent = 
            analise.maior_saldo.data;
    } else {
        document.getElementById('maiorSaldoValor').textContent = 'N/A';
        document.getElementById('maiorSaldoData').textContent = 'N/A';
    }

    // Menor saldo
    if (analise.menor_saldo) {
        document.getElementById('menorSaldoValor').textContent = 
            `R$ ${analise.menor_saldo.valor.toFixed(2).replace('.', ',')}`;
        document.getElementById('menorSaldoData').textContent = 
            analise.menor_saldo.data;
    } else {
        document.getElementById('menorSaldoValor').textContent = 'N/A';
        document.getElementById('menorSaldoData').textContent = 'N/A';
    }
}

function exportarDados() {
    // Implementação futura para exportar os dados
    console.log('Exportar dados - funcionalidade em desenvolvimento');
    
    // Placeholder para futura implementação
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show';
    notification.innerHTML = `
        <i class="bi bi-info-circle me-2"></i>
        Funcionalidade de exportação em desenvolvimento.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const modalBody = document.querySelector('#evolucaoSaldoModal .modal-body');
    modalBody.insertBefore(notification, modalBody.firstChild);
    
    // Auto remover após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function limparModal() {
    // Destruir gráfico
    if (graficoEvolucao) {
        graficoEvolucao.destroy();
        graficoEvolucao = null;
    }

    // Limpar título
    document.getElementById('modalCicloInfo').textContent = '';
    
    // Resetar estatísticas
    document.getElementById('saldoInicial').textContent = 'R$ 0,00';
    document.getElementById('saldoFinal').textContent = 'R$ 0,00';
    document.getElementById('variacao').textContent = 'R$ 0,00';
    document.getElementById('totalRegistros').textContent = '0';
    
    // Resetar detalhes
    document.getElementById('maiorSaldoValor').textContent = '-';
    document.getElementById('maiorSaldoData').textContent = '-';
    document.getElementById('menorSaldoValor').textContent = '-';
    document.getElementById('menorSaldoData').textContent = '-';
    
    // Resetar card de variação
    const variacaoCard = document.getElementById('variacao-card');
    variacaoCard.className = 'card text-white bg-secondary';
    
    // Ocultar todos os elementos
    ocultarElemento(document.getElementById('evolucaoSaldoLoading'));
    ocultarElemento(document.getElementById('evolucaoSaldoContent'));
    ocultarElemento(document.getElementById('evolucaoSaldoError'));
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

// Exportar função para uso global se necessário
window.setupEvolucaoSaldoModal = setupEvolucaoSaldoModal;