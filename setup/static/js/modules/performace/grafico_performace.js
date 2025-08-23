export async function setupProgressPerformace() {
    let dados = [];

    try {
        const response = await fetch('/api/v1/performace');
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        dados = await response.json();
        if (dados.success) {
            renderizarDados(dados);
        } else {
            throw new Error(data.error || 'Erro desconhecido ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados de resutltado das apostas:', error);
    } finally {
        console.log('Finaly grafico performace');
    }
}

function renderizarDados(dados) {
    const progressPerformace = document.getElementById('progressPerformace');
    const textoProgressBar = document.getElementById('textoProgressBar');

    if (!progressPerformace || !textoProgressBar) return;

    const percentual_green = parseFloat(dados['percentual_green']);

    const performaceConfig = [
        { condition: (val) => val >= 0.0 && val < 25.0, class: 'bg-danger'},
        { condition: (val) => val >= 25.0 && val < 50.0, class: 'bg-warning' },
        { condition: (val) => val > 50.0 && val < 75.0, class: 'bg-info' },
        { condition: (val) => val >= 75.0, class: 'bg-success' }
    ];

    const config = performaceConfig.find(item => item.condition(percentual_green));

    if (config) {
        progressPerformace.classList.add(config.class);
    }

    progressPerformace.style.width = `${dados['percentual_green']}%`;
    textoProgressBar.textContent = `${dados['percentual_green']}%`;
}