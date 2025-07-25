/**
 * Módulo de Recusa de Aposta - Gerencia a funcionalidade do modal de recusa
 */
import { showNotification } from './notifications.js';
import { updateEntryOptionIcon } from './table.js';
import { desabilitarBtnDesfazer } from './utils.js';

/**
 * Inicializa o modal de desfazer ação
 */
export function setupDesfazerAcaoModal() {

    const modal = document.getElementById('desfazerAcaoModal');
    const desfazerBtn = document.querySelectorAll('#desfazer-acao');
    const confirmarBtn = document.getElementById('confirmarDesfazerAcaoBtn');

    if (!modal || !desfazerBtn.length || !confirmarBtn) return;

    const modalInstance = new bootstrap.Modal(modal);

    let currentEventId = null;
    let currentRow = null;

    desfazerBtn.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            currentRow = this.closest('tr');
            if (!currentRow) return;

            const eventId = currentRow.querySelector('td:first-child').textContent;
            const mercado = currentRow.querySelector('td:nth-child(2)').textContent;

            currentEventId = eventId;

            document.getElementById('evento-id-desfazer').textContent = eventId;
            document.getElementById('evento-mercado-desfazer').textContent = mercado;

            modalInstance.show();
        });
    });

    confirmarBtn.addEventListener('click', function() {
        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }

        this.disabled = true;
        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';

         const url = `/api/apostar?event_id=${currentEventId}&action=desfazer`;

         fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro ao desfazer a entrada');
            }
            return response.json();
        }).then(data => {

            desabilitarBtnDesfazer(currentRow);
            
            modalInstance.hide();
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-x-circle"></i> Confirmar Desfazer';

            updateEntryOptionIcon(false, currentRow, "E");
            
            showNotification('Entrada desfeita com sucesso!', 'warning');
            
            currentEventId = null;
            currentRow = null;
        })

    })


   
}