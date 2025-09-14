
const API_BASE_URL = '/api/v1';

export function initCycleOwnerBall() {
    const modal = document.getElementById('modalCycleOwnerBall');
    const btnNewCycle = document.getElementById('btnNewCycleOwnerBall');
    const btnSaveCycle = document.getElementById('btnSaveCycleOwnerBall')

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

    async function saveCycle() {
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
                    //TODO RECUPERAR TOKEN DO SESSION ID
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU3ODY0MTkyLCJpYXQiOjE3NTc4NjA1OTIsImp0aSI6IjA3MjY5OWYwOGE4MDQ1NTFhNWQ0MzcxZTU0NzJkYzY5IiwidXNlcl9pZCI6IjEiLCJ1c2VybmFtZSI6InJyZXNxIiwiZW1haWwiOiJyb2RyaWdvLnJlc3F1ZUBnbWFpbC5jb20iLCJmaXJzdF9uYW1lIjoiIiwibGFzdF9uYW1lIjoiIiwiaXNfc3RhZmYiOnRydWUsImlzX3N1cGVydXNlciI6dHJ1ZSwidXNlcl90eXBlIjoiYWRtaW4iLCJncm91cHMiOltdfQ.O_7bs2wH3iK3W9XGqQz3qgUZXodFZu_mei8WUloHezo'
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
       
                //  TODO Atualizar Listagem de Cycle Owner Ball
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
