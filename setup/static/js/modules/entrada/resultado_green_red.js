import { showNotification } from "../notifications.js";

export function setupResultadoEntradaModal() {
    const modal = document.getElementById('resultadoEntradaModal');
    const eventBtn = document.querySelectorAll('.eventBtn');
    const confirmBtn = document.getElementById('confirmarResultadoEntradaBtn');

    if (!eventBtn || !modal || !confirmBtn) return;

    const modalInstance = new bootstrap.Modal(modal);

    let currentEventId = null;
    let currentRow = null;

    eventBtn.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error('ID do evento não encontrado')
                return;
            }

            currentRow = this.closest('tr');
            if (!currentRow) return;

            const mercado = currentRow.querySelector('td:nth-child(3)').textContent.trim();
            
            currentEventId = eventId;

            document.getElementById('resultado-entrada-evento-id').textContent = eventId;
            document.getElementById('resultado-entrada-mercado').textContent = mercado;

            modalInstance.show();
        });
    });

    confirmBtn.addEventListener('click', async function() {
        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }

        const selectResultadoEntrada = document.querySelector('.resultado-entrada-select');
        const valueSelected = selectResultadoEntrada ? selectResultadoEntrada.value: null;

        if (!valueSelected) {
            showNotification('Por favor, selecione um resultado', 'warning');
            return;
        }

        this.disabled = true;
        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';

        try {
            const url = `api/analytics/resultado_entrada?event_id=${currentEventId}&resultado_entrada=${valueSelected}`;
            await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`)
                }
                return response.json();
            }).then(data => {
                if (data.success) {
                    showNotification(`Resultado da entrada ${currentEventId} registrado com sucesso`, 'success');
                } else {
                    showNotification(`Falha ao registrar resultado da entrada`, 'danger');
                }
                this.disabled = false;
                this.innerHTML = '<i class="bi bi-save"></i> Salvar';

                
            });

        } catch(error) {
            console.error('Erro:', error);
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-save"></i> Salvar';
            showNotification('Erro ao registrar resultado da entrada. Tente novamente.', 'danger');
        } finally { 
            modalInstance.hide();
        }
    });

}