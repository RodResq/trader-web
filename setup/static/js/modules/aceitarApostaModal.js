
import { updateEntryOptionIcon } from "./table.js";

export function initAceitarApostaModal() {
    let currentEventId = null;
    let currentRow = null;
    let valorOdd = null;

    const aceitarButtons = document.querySelectorAll('.apostar-btn');
    const modal = document.getElementById('aceitarApostaModal');
    const confirmarBtn = document.getElementById('confirmarAceiteBtn');
    const valorInput = document.querySelector('#aceitar-evento-valor-input input');

    aceitarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const eventId = this.dataset.eventId;
            currentRow = this.closest('tr');
            const mercado = currentRow.querySelector('td:nth-child(2)').textContent.trim();
            const odd = currentRow.querySelector('td:nth-child(3)').textContent.trim();
            valorOdd = parseFloat(odd.replace(',', '.'))

            
            document.getElementById('aceitar-evento-id').textContent = eventId;
            document.getElementById('aceitar-evento-mercado').textContent = mercado;
            document.getElementById('aceitar-evento-odd').textContent = odd;
            
            valorInput.value = '';
            
            atualizarTotal();
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        });
    });

    valorInput.addEventListener('input', atualizarTotal);

    confirmarBtn.addEventListener('click', enviarAposta);


    function atualizarTotal() {
        const valor = parseFloat(valorInput.value) || 0;
        document.getElementById('valorTotal').textContent = (valor.toFixed(2) * valorOdd.toFixed(2)).toFixed(2);
    }

    function atualizarTotalDisponivel() {
        const valor = parseFloat(valorInput.value) || 0;
        const elValorTotalDisponivel = document.getElementById('valor-total-disponivel');
        const valorTotalDisponivel = parseFloat(elValorTotalDisponivel.textContent.replace(',', '.')).toFixed(2);

        elValorTotalDisponivel.textContent = parseFloat(valorTotalDisponivel - valor).toFixed(2);
    }

    
    function enviarAposta() {
        const eventId = parseInt(document.getElementById('aceitar-evento-id').textContent);
        const mercado = document.getElementById('aceitar-evento-mercado').textContent;
        const odd = parseFloat(document.getElementById('aceitar-evento-odd').textContent.replace(',', '.'));
        const valorRetorno = parseFloat(document.getElementById('valorTotal').textContent);
        const valor = parseFloat(valorInput.value) || 0;
        
        if (valor <= 0) {
            exibirMensagem('Erro: O valor da entrada deve ser maior que zero', 'danger');
            return;
        }
        
        // Preparar dados para envio
        const dados = {
            evento_id: eventId,
            mercado: mercado,
            odd: odd,
            valor_entrada: valor,
            valor_retorno: valorRetorno
        };
        
  
        fetch('/analytics/apostas/aceitar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();

                atualizarTotal()

                atualizarTotalDisponivel();
                
                updateEntryOptionIcon(false, currentRow, 'A');
                
                // Desabilitar o botão de aposta
                const apostarBtn = currentRow.querySelector('.apostar-btn');
                apostarBtn.classList.remove('btn-success');
                apostarBtn.classList.add('btn-secondary');
                apostarBtn.innerHTML = '<i class="bi bi-check-all"></i>';
                apostarBtn.disabled = true;
                
                exibirMensagem('Aposta aceita com sucesso!', 'success');
            } else {
                exibirMensagem(`Erro: ${data.message}`, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro ao processar a aposta:', error);
            exibirMensagem('Erro ao processar a aposta. Verifique o console para mais detalhes.', 'danger');
        });
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