
import { updateEntryOptionIcon } from "./table.js";

export function initAceitarApostaModal() {
    let currentEventId = null;
    let currentRow = null;
    let valorOdd = null;

    const aceitarButtons = document.querySelectorAll('.apostar-btn');
    const modal = document.getElementById('aceitarApostaModal');
    const confirmarBtn = document.getElementById('confirmarAceiteBtn');
    const valorInput = document.querySelector('#aceitar-evento-valor-input input');

    // Mostrar o modal quando o botão de aposta é clicado
    aceitarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const eventId = this.dataset.eventId;
            currentRow = this.closest('tr');
            const mercado = currentRow.querySelector('td:nth-child(2)').textContent.trim();
            const odd = currentRow.querySelector('td:nth-child(3)').textContent.trim();
            valorOdd = parseFloat(odd.replace(',', '.'))

            
            // Preencher dados no modal
            document.getElementById('aceitar-evento-id').textContent = eventId;
            document.getElementById('aceitar-evento-mercado').textContent = mercado;
            document.getElementById('aceitar-evento-odd').textContent = odd;
            
            // Limpar o valor de entrada
            valorInput.value = '';
            
            // Calcular e mostrar o total (será atualizado quando o usuário inserir o valor)
            atualizarTotal();
            
            // Abrir o modal usando o Bootstrap
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        });
    });

    // Atualizar o valor total quando o valor da entrada mudar
    valorInput.addEventListener('input', atualizarTotal);

    // Confirmar a aposta quando o botão for clicado
    confirmarBtn.addEventListener('click', enviarAposta);


    function atualizarTotal() {
        const valor = parseFloat(valorInput.value) || 0;
        document.getElementById('valorTotal').textContent = (valor.toFixed(2) * valorOdd.toFixed(2)).toFixed(2);
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
        
        // Enviar dados para o backend via AJAX
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
                // Fechar o modal
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                
                // Atualizar a UI para mostrar a aposta como aceita
                // const row = document.querySelector(`tr td:first-child:contains('${eventId}')`).closest('tr');
                updateEntryOptionIcon(false, currentRow, 'A');
                
                // Desabilitar o botão de aposta
                const apostarBtn = currentRow.querySelector('.apostar-btn');
                apostarBtn.classList.remove('btn-success');
                apostarBtn.classList.add('btn-secondary');
                apostarBtn.innerHTML = '<i class="bi bi-check-all"></i>';
                apostarBtn.disabled = true;
                
                // Mostrar mensagem de sucesso
                exibirMensagem('Aposta aceita com sucesso!', 'success');
            } else {
                // Mostrar mensagem de erro
                exibirMensagem(`Erro: ${data.message}`, 'danger');
            }
        })
        .catch(error => {
            console.error('Erro ao processar a aposta:', error);
            exibirMensagem('Erro ao processar a aposta. Verifique o console para mais detalhes.', 'danger');
        });
    }
    
    function getCSRFToken() {
        // Obter o token CSRF dos cookies
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
    }
    
    function exibirMensagem(texto, tipo) {
        // Criar elemento de alerta
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.role = 'alert';
        alerta.innerHTML = `
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        `;
        
        // Adicionar ao topo da página
        const container = document.querySelector('.container-fluid');
        container.insertBefore(alerta, container.firstChild);
        
        // Configurar para desaparecer após alguns segundos
        setTimeout(() => {
            alerta.classList.remove('show');
            setTimeout(() => alerta.remove(), 300);
        }, 5000);
    }
}