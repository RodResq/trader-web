import { showNotification } from "../notifications.js";

export function setupPrioridadeEvento() {
    const checkPrioridadeEvento = document.querySelectorAll('.checkPrioridadeEvento');

    if (!checkPrioridadeEvento) return;

    checkPrioridadeEvento.forEach(check => {
        check.removeEventListener('change', handlerPriorityChange);
        check.addEventListener('change', handlerPriorityChange)
    })
}

function handlerPriorityChange() {
    const idEvento = this.value;
    if (!idEvento) {
        showNotification('ID evento não encontrado', 'error');
        return;
    }
    updateProximoEventoPrioridade(idEvento, this.checked);
}
 
async function updateProximoEventoPrioridade(idEvento, checked) {
    try {
        const url = `api/v1/team/event?id_event=${idEvento}&checked=${checked}`;
        await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`); 
            }
            return response.json();
        }).then(data => {
            if (data.success) {
                showNotification('Próximo evento prioritário atualizado com sucesso.')
            } else {
                showNotification(`Falha ao recuperar dados de evento do evento`, 'danger');
            }
        });

    } catch(error) {
        console.error('Erro:', error);
        this.disabled = false;
    } finally {

    }
}