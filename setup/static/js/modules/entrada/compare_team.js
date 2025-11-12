import { showNotification } from "../notifications.js";


let modalInstance = null;
let nameHome = '';
let nameAway = '';

export function setupCompareTeam() {
    const btnCompareTeam = document.querySelectorAll('.compare-team');
    const modal = document.getElementById('compareTeamModal');

    if (!btnCompareTeam) return;

    if (!modal) return;

    modalInstance = new bootstrap.Modal(modal);

    btnCompareTeam.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute('data-event-id');
            const eventOrigin = this.getAttribute('data-event-origin');
            const idHome = this.getAttribute('data-home-id');
            nameHome = this.getAttribute('data-home-name');
            const idAway = this.getAttribute('data-away-id');
            nameAway = this.getAttribute('data-away-name');            

            if (!idHome || !idAway) return;

            const url = `api/v1/statistic/compare/${idHome}/${idAway}?event_origin=${eventOrigin}&id_event=${idEvent}`;

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
                } else {
                    showNotification('Erro ao recuperar estatisticas dos times.', 'danger');
                }
            } catch(error) {
                showNotification('Erro ao recuperar estatisticas dos times.', 'danger');
            }
            
        });
    });
}

function showModal(modalInstance, compareData) {
    modalInstance.show();
    renderizarGrafico(compareData);
}

function renderizarGrafico(dados) {
    const dataHome = dados?.home;
    const dataAway = dados?.away;

    const ctx = document.getElementById('graficoCompareTeam');

    if (!ctx) return;

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado');
        ctx.parentElement.innerHTML = '<div class="alert alert-warning">Chart.js não está disponível</div>';
        return;
    }

    const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDarkTheme ? '#e0e0e0' : '#333333';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const tickColor = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

    const homeColor = isDarkTheme ? 'rgb(255, 107, 107)' : 'rgb(255, 99, 132)';
    const awayColor = isDarkTheme ? 'rgb(100, 200, 255)' : 'rgb(54, 162, 235)';
    const homeBgColor = isDarkTheme ? 'rgba(255, 107, 107, 0.25)' : 'rgba(255, 99, 132, 0.2)';
    const awayBgColor = isDarkTheme ? 'rgba(100, 200, 255, 0.25)' : 'rgba(54, 162, 235, 0.2)';

    const data = {
        labels: [
            'Atack',
            'Defense',
            'Control',
            'Discipline',
        ],
        datasets: [{
            label: nameHome,
            data: [dataHome?.atack, dataHome?.control, dataHome?.defese, dataHome?.discipline],
            fill: true,
            backgroundColor: homeBgColor,
            borderColor: homeColor,
            pointBackgroundColor: homeColor,
            pointBorderColor: isDarkTheme ? '#1a1a1a' : '#fff',
            pointHoverBackgroundColor: homeColor,
            pointHoverBorderColor: isDarkTheme ? '#1a1a1a' : '#fff'
        }, {
            label: nameAway,
            data: [dataAway?.atack, dataAway?.control, dataAway?.defese, dataAway?.discipline],
            fill: true,
            backgroundColor: awayBgColor,
            borderColor: awayColor,
            pointBackgroundColor: awayColor,
            pointBorderColor: isDarkTheme ? '#1a1a1a' : '#fff',
            pointHoverBackgroundColor: awayColor,
            pointHoverBorderColor: isDarkTheme ? '#1a1a1a' : '#fff'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        fill: true,
        options: {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: (chart) => {
                        const icons = ['🏠', '✈️']; 
                        const labels = chart.data.datasets.map((dataset, i) => ({
                            text: `${icons[i]} ${dataset.label}`,
                            fillStyle: dataset.borderColor,
                            hidden: !chart.isDatasetVisible(i),
                            index: i
                        }));
                        return labels;
                        }
                    } 
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: tickColor,
                        font: {
                            size: 10
                        },
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: gridColor,
                        lineWidth: 1
                    },
                    pointLabels: {
                        color: textColor,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            elements: {
            line: {
                borderWidth: 3
                }
            }
        },
    };

    graficoCompareTeam = new Chart(ctx, config)

}