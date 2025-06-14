import { showNotification } from './notifications.js';
import { atualizarCellOddAposEditar } from './update_odd_change.js'

/**
 * Configura componentes de edição de odd
 */
export function setupEditarModal() {
    const modal = document.getElementById('editarOddModal');
    const editarOddBtns = document.querySelectorAll('.edit-odd-btn');
    const confirmBtn = document.getElementById('confirmarEdicaoOddBtn');
    const novaOddInput = document.getElementById('novaOddInput');

    if (!modal || !editarOddBtns.length || !confirmBtn || !novaOddInput) return;

    const modalInstance = new bootstrap.Modal(modal);

    let currentEventId = null;
    let currentRow = null;

    editarOddBtns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error('ID do evento não encontrado');
                return;
            }

            currentRow = this.closest('tr');
            if (!currentRow) return;

            const mercado = currentRow.querySelector('td:nth-child(2)').textContent;
            const oddAtual = currentRow.querySelector('td:nth-child(3)').textContent;

            currentEventId = eventId;

            document.getElementById('editar-odd-evento-id').textContent = eventId;
            document.getElementById('editar-odd-evento-mercado').textContent = mercado;
            novaOddInput.value = oddAtual;

            modalInstance.show();
        });
    });

    confirmBtn.addEventListener('click', function() {
        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }
        
        const novaOdd = parseFloat(novaOddInput.value.trim().replace(/[^\d.,]/g, '').replace(',', '.'));

        if (!novaOdd || isNaN(novaOdd) || novaOdd < 1.01) {
            showNotification('Por favor, insira uma odd válida (mínimo 1.01)', 'warning');
            return;
        }

        const url = `/api/editar_odd?event_id=${currentEventId}&odd=${novaOdd}`;

        this.disabled = true;
        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro ao editar odd');
            }
        }).then(data => {
            const oddCell = currentRow.querySelector('td:nth-child(3)');
            if (oddCell) {
                // oddCell.textContent = novaOdd;
                console.log('Logica atualizar os icones de odd_change');
                atualizarCellOddAposEditar(currentEventId, currentRow, novaOdd);
            }

            modalInstance.hide();
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-save"></i> Salvar';

            showNotification('Odd atualizada com sucesso!', 'success');
        }).catch(error => {
            console.error('Erro:', error);
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-save"></i> Salvar';
            showNotification('Erro ao atualizar odd. Tente novamente.', 'danger');
        })
    });

}