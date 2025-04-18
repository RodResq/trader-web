/**
 * Módulo de Recusa de Aposta - Gerencia a funcionalidade do modal de recusa
 */
import { showNotification } from './notifications.js';
import { updateEntryOptionIcon } from './table.js';

/**
 * Inicializa o modal de recusa de aposta e seus manipuladores de eventos
 */
export function setupRecusarModal() {
    // Obter elementos do modal
    const modal = document.getElementById('recusarApostaModal');
    const recusarBtn = document.querySelectorAll('#recusar-aposta');
    const confirmarBtn = document.getElementById('confirmarRecusaBtn');
    const motivoSelect = document.getElementById('recusarMotivo');
    const outroMotivoContainer = document.getElementById('outroMotivoContainer');
    
    // Verificar se os elementos existem
    if (!modal || !recusarBtn.length || !confirmarBtn || !motivoSelect) return;
    
    // Criar instância do modal usando Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Armazenar dados da aposta atual
    let currentEventId = null;
    let currentRow = null;
    
    // Configurar evento de alteração do motivo de recusa
    motivoSelect.addEventListener('change', function() {
        if (this.value === 'outros') {
            outroMotivoContainer.style.display = 'block';
        } else {
            outroMotivoContainer.style.display = 'none';
        }
    });
    
    // Configurar botões de recusa para abrir o modal
    recusarBtn.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obter dados da linha da tabela
            currentRow = this.closest('tr');
            if (!currentRow) return;
            
            const eventId = currentRow.querySelector('td:first-child').textContent;
            const mercado = currentRow.querySelector('td:nth-child(2)').textContent;
            
            // Armazenar ID do evento atual
            currentEventId = eventId;
            
            // Atualizar dados no modal
            document.getElementById('evento-id').textContent = eventId;
            document.getElementById('evento-mercado').textContent = mercado;
            
            // Resetar campos do formulário
            motivoSelect.value = '';
            document.getElementById('outroMotivo').value = '';
            outroMotivoContainer.style.display = 'none';
            
            // Abrir o modal
            modalInstance.show();
        });
    });
    
    // Configurar botão de confirmação de recusa
    confirmarBtn.addEventListener('click', function() {
        if (!currentEventId || !currentRow) {
            modalInstance.hide();
            return;
        }
        
        // Obter motivo da recusa
        let motivo = motivoSelect.value;
        if (motivo === 'outros') {
            const outroMotivo = document.getElementById('outroMotivo').value.trim();
            if (outroMotivo) {
                motivo = outroMotivo;
            }
        }
        
        // Desabilitar botão durante o processamento
        this.disabled = true;
        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';
        
        // Chamada de API (você deve implementar a chamada real à API)
        const url = `/api/apostar?event_id=${currentEventId}&action=recusar`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro ao recusar a aposta');
            }
            return response.json();
        }).then(data => {
            // Marcar visualmente a linha como recusada
            // currentRow.classList.add('table-danger');
            const btnRecusar = currentRow.querySelector('.recusar-btn')
            if (btnRecusar) {
                btnRecusar.classList.remove('btn-danger');
                btnRecusar.classList.add('btn-secondary');
                btnRecusar.disabled = true;
            }

            
            modalInstance.hide();
            // Resetar botão
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-x-circle"></i> Confirmar Recusa';

            updateEntryOptionIcon(currentRow, "R");
            
            // Mostrar notificação
            showNotification('Aposta recusada com sucesso!', 'warning');
            
            // Limpar referências
            currentEventId = null;
            currentRow = null;
        })

    });
}