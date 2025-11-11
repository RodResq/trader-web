import { showNotification } from "../notifications.js";

let modalInstance = null;

export function setupCompareTeam() {
    const btnCompareTeam = document.querySelectorAll('.compare-team');
    const modal = document.getElementById('compareTeamModal');

    if (!btnCompareTeam) return;

    if (!modal) return;

    modalInstance = new bootstrap.Modal(modal);

    btnCompareTeam.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const idHome = this.getAttribute('data-home-id');
            const idAway = this.getAttribute('data-away-id');

            if (!idHome || !idAway) return;

            const url = `api/v1/statistic/compare/${idHome}/${idAway}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao comparar times');
                }

                const data = await response.json();
                if (data.success) {
                    showModal(modalInstance, data.data);
                }

            } catch(error) {
                showNotification('Erro ao recuperar estatisticas dos times.', 'danger');
            }
            
        });
    });
}

function showModal(modalInstance, compareData) {
    console.log('>>>>> DADOS DA COMPARACAO: ', compareData);
    modalInstance.show();
    renderizarGrafico(compareData);
}

function renderizarGrafico(dados) {
    const ctx = document.getElementById('graficoCompareTeam');

    if (!ctx) return;

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        ctx.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#cccccc' : '#666666';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const data = {
        labels: [
            'Atack',
            'Defense',
            'Control',
            'Discipline',
        ],
        datasets: [{
            label: 'Time A',
            data: [65, 59, 90, 81],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }, {
            label: 'Time B',
            data: [28, 48, 40, 19],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            elements: {
            line: {
                borderWidth: 3
                }
            }
        },
    };

    graficoCompareTeam = new Chart(ctx, config)

}