
const API_BASE_URL = '/api/v1';

export function initCycleOwnerBall() {
    const modal = document.getElementById('modalCycleOwnerBall');
    const btnNewCycle = document.getElementById('btnNewCycleOwnerBall');
    const btnSaveCycle = document.getElementById('btnSaveCycleOwnerBall')

    let token = "";

    if (!btnNewCycle) return;

    btnNewCycle.addEventListener('click', function(e) {
        e.preventDefault();
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    });

    btnSaveCycle.addEventListener('click', saveCycle);

    function getApiUrl(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }


    async function preRequestLogin() {
        try {
            const dadosLogin = {
                username: 'rresq',
                password: '123'
            }
            const response = await fetch('/api/token/', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(dadosLogin)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            const data = await response.json();
            token = data['access'];
        } catch (error) {
            console.error(error);
        }
    }

    async function saveCycle() {

       preRequestLogin(); 
       const category = document.getElementById('categoryCycleOwnerBall');
       const startDate = document.getElementById('inputStartDateCycleOwnerBall');
       const endDate = document.getElementById('inputEndDateCycleOwnerBall');
       const currentBalance = document.getElementById('inputCurrentBalance');
       const availebleValue = document.getElementById('inputAvailebleValue');
       
       if (!category || !startDate || !endDate || !currentBalance || !availebleValue) return;
       
       const dados = {
        category: category.value,
        start_date: startDate.value,
        end_date: endDate.value,
        current_balance: parseFloat(currentBalance.value),
        available_value: parseFloat(availebleValue.value)
       }

       try {
           const response = await fetch(getApiUrl('/owner_ball/cycle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(dados)
           });
       
           if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
           }
       
           const data = await response.json();
           if (data.success) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                //TODO Atualizar Listagem Cycle Owner Ball
           } else {
                exibirMensagem(`Erro: ${data.message}`, 'danger'); 
           }
       } catch(error) {
            console.error('Erro ao gravar ciclo Owner Ball:', error);
            exibirMensagem('Erro ao Gravar Ciclo Owner Ball. Verifique o console para mais detalhes.', 'danger');
       }
    }

    function getCSRFToken() {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
    }

    function exibirMensagem(texto, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.role = 'alert';
        alerta.innerHTML = `
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        `;
        
        const container = document.querySelector('.container-fluid');
        container.insertBefore(alerta, container.firstChild);
        
        setTimeout(() => {
            alerta.classList.remove('show');
            setTimeout(() => alerta.remove(), 300);
        }, 5000);
    }

}
