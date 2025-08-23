import { showNotification } from './notifications.js';
import { updateEntryOptionIcon } from './table.js';
import { desabilitarBtnRecusar } from './utils.js';


export function setupRecusarModal() {
    // Obter elementos do modal
    const modal = document.getElementById('recusarApostaModal');
    const recusarBtn = document.querySelectorAll('#recusar-aposta');
    const confirmarBtn = document.getElementById('confirmarRecusaBtn');
    const motivoSelect = document.getElementById('recusarMotivo');
    const outroMotivoContainer = document.getElementById('outroMotivoContainer');
    
    if (!modal || !recusarBtn.length || !confirmarBtn || !motivoSelect) return;
    
    const modalInstance = new bootstrap.Modal(modal);
    
    let currentEventId = null;
    let currentRow = null;
    
    motivoSelect.addEventListener('change', function() {
        if (this.value === 'outros') {
            outroMotivoContainer.style.display = 'block';
        } else {
            outroMotivoContainer.style.display = 'none';
        }
    });
    
    recusarBtn.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            currentRow = this.closest('tr');
            if (!currentRow) return;
            
            const eventId = currentRow.querySelector('td:first-child').textContent.trim();
            const mercado = currentRow.querySelector('td:nth-child(2)').textContent;
            
            currentEventId = eventId;
            
            document.getElementById('recusar-evento-id').textContent = eventId;
            document.getElementById('recusar-evento-mercado').textContent = mercado;
            
            motivoSelect.value = '';
            document.getElementById('outroMotivo').value = '';
            outroMotivoContainer.style.display = 'none';
            
            modalInstance.show();
        });
    });
    
    confirmarBtn.addEventListener('click', function() {
        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }
        
        let motivo = motivoSelect.value;
        if (motivo === 'outros') {
            const outroMotivo = document.getElementById('outroMotivo').value.trim();
            if (outroMotivo) {
                motivo = outroMotivo;
            }
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';
        
        const url = `/api/v1/apostar?event_id=${currentEventId}&action=recusar`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro ao recusar a aposta');
            }
        }).then(data => {
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-x-circle"></i> Confirmar Recusa';

            updateEntryOptionIcon(false, currentRow, "R");
            currentEventId = null;
            currentRow = null;
            showNotification('Entrada recusada com sucesso!', 'warning');
        }).catch(error => {
            console.error('Erro ao recusar aposta: ' + error);
            showNotification('Falha ao recusada a entrada!', 'error');
        }).finally(() => {
            modalInstance.hide();
            desabilitarBtnRecusar(currentRow);
        });

    });
}