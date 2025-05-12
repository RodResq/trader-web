import { atualizaIconeResultado } from "./gerencia_aposta/icone_lista_aposta.js";
import { showNotification } from "./notifications.js";

export function setupGerenciaResultado() {
    const selectResultado = document.querySelectorAll('.resultado-select');
    const btnSalvarResultado = document.querySelectorAll('.salvar-resultado');

    if (!selectResultado || !btnSalvarResultado) return;

    let currentEventId = null;
    let currentRow = null;

    btnSalvarResultado.forEach(resultado => {
        resultado.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error("ID do evento não encontrado");
                return;
            }

            const salvarResultadoBrn = this;
            currentRow = salvarResultadoBrn.closest('tr');

            const valueSelected = currentRow.querySelector('.resultado-select').value;
            if (!currentRow) return;

            currentEventId = eventId;
            //TODO implementar api
            const url = `/analytics/gerencia/resultado?event_id=${currentEventId}&resultado=${valueSelected}`;
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao processar resultado');
                }
                return response.json();
            }).then(data => {
                if (data.success) {
                    showNotification(`${data.message}. Id evento: ${data.data.id_event}, opção: ${data.data.resultado}, valor total retorno: ${data.data.valor_total_retorno}`, 'success')
                }
                return atualizaIconeResultado(currentRow, data.data.resultado);
            }).catch(error => {
                console.error('Erro:', error)
                showNotification('Erro ao registra resultado da entrada. Tente novamente.', 'danger');
            })
        })
    });

}