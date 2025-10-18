
import { updateEntryOptionIcon } from "./table.js";
import { showNotification } from './notifications.js';

export function initAceitarApostaModal() {
    let currentRow = null;
    const aceitarButtons = document.querySelectorAll('.apostar-btn');
    const modal = document.getElementById('aceitarApostaModal');
    const confirmarBtn = document.getElementById('confirmarAceiteBtn');
    const valorInput = document.querySelector('#aceitar-evento-valor-input input');
    
    aceitarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.dataset.eventId;
            currentRow = this.closest('tr');

            const eventOrigin = currentRow.getAttribute('data-event-origin');
            const mercado = currentRow.querySelector('td:nth-child(3)').textContent.trim();
            const odd = currentRow.querySelector('td:nth-child(4)').textContent.trim();
            
            document.getElementById('aceitar-event-origin').textContent = eventOrigin;
            document.getElementById('aceitar-evento-id').textContent = eventId;
            document.getElementById('aceitar-evento-mercado').textContent = mercado;
            document.getElementById('aceitar-evento-odd').textContent = odd;
            
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            valorInput.value = '';
        });
    });
    
    valorInput.addEventListener('keyup', atualizarTotalRetornado);
    confirmarBtn.addEventListener('click', enviarAposta);


    function atualizarTotalRetornado() {
        const odd = parseFloat(document.getElementById('aceitar-evento-odd').textContent.trim()).toFixed(2);
        const valor = parseFloat(valorInput.value).toFixed(2) || 0;
        document.getElementById('valorTotal').textContent = (valor * odd) || 0;
    }

    function atualizarTotalDisponivel() {
        const valor = parseFloat(valorInput.value) || 0;
        const elValorTotalDisponivel = document.getElementById('valor-total-disponivel');
        const valorTotalDisponivel = parseFloat(elValorTotalDisponivel.textContent.replace(',', '.')).toFixed(2);

        elValorTotalDisponivel.textContent = parseFloat(valorTotalDisponivel - valor).toFixed(2);
    }

    
    async function enviarAposta() {
        const eventOrigin = document.getElementById('aceitar-event-origin').textContent.trim();
        const eventId = parseInt(document.getElementById('aceitar-evento-id').textContent.trim());
        const valorRetorno = parseFloat(document.getElementById('valorTotal').textContent.trim());
        const valor = parseFloat(valorInput.value) || 0;
        
        if (valor <= 0) {
            showNotification('Erro: O valor da entrada deve ser maior que zero', 'danger');
            return;
        }
        
        const dados = {
            event_origin: eventOrigin,
            valor_entrada: valor,
            valor_retorno: valorRetorno
        };
  
        try {
            const response = await fetch(`api/v1/entradas/${eventId}/aceitar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
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

                atualizarTotalRetornado()
                atualizarTotalDisponivel();
                updateEntryOptionIcon(false, currentRow, 'A');
                
                const apostarBtn = currentRow.querySelector('.apostar-btn');
                apostarBtn.classList.remove('btn-success');
                apostarBtn.classList.add('btn-secondary');
                apostarBtn.innerHTML = '<i class="bi bi-check-all"></i>';
                apostarBtn.disabled = true;
                
                showNotification('Aposta registrada com sucesso!', 'success');
            } else {
                showNotification('Erro ao registrar aposta. Tente novamente.', 'danger');
            }

        } catch(error) {
            console.error('Erro ao processar a aposta:', error);
            showNotification('Erro ao processar a aposta. Verifique o console para mais detalhes.', 'danger');
        };
    }
    
    function getCSRFToken() {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
    }
    
    // function exibirMensagem(texto, tipo) {
    //     const alerta = document.createElement('div');
    //     alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    //     alerta.role = 'alert';
    //     alerta.innerHTML = `
    //         ${texto}
    //         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    //     `;
        
    //     const container = document.querySelector('.container-fluid');
    //     container.insertBefore(alerta, container.firstChild);
        
    //     setTimeout(() => {
    //         alerta.classList.remove('show');
    //         setTimeout(() => alerta.remove(), 300);
    //     }, 5000);
    // }
}
