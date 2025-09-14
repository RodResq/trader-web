

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

    async function saveCycle() {
       const category = document.getElementById('categoryCycleOwnerBall');
       const period = document.getElementById('inputPeriodCycleOwnerBall');
       const currentValue = document.getElementById('inputCurrentValue');
       const availebleValue = document.getElementById('inputAvailebleValue');
       
       if (!category || !period || !currentValue || !availebleValue) return;
       
       const dados = {
        category: category.value,
        period: period.value,
        currentValue: parseFloat(currentValue.value),
        availebleValue: parseFloat(availebleValue.value)
       }

       try {
           const response = await fetch('api/v1/owner_ball/cycle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRFToken': getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
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
