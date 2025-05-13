import { atualizaIconeResultado } from "./gerencia_aposta/icone_lista_aposta.js";
import { showNotification } from "./notifications.js";

export function setupGerenciaResultado() {
    const btnSalvarResultado = document.querySelectorAll('.salvar-resultado');

    if (!btnSalvarResultado || btnSalvarResultado.length === 0) return;

    btnSalvarResultado.forEach(btn => {
        // Remover o event listener anterior (se existir) clonando o botão
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn); 

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) {
                console.error("ID do evento não encontrado");
                return;
            }

            const currentRow = this.closest('tr');
            if (!currentRow) return;

            const selectResultado = currentRow.querySelector('.resultado-select');
            const valueSelected = selectResultado ? selectResultado.value: null;

            if (!valueSelected) {
                showNotification('Por favor, selecione um resultado', 'warning');
                return;
            }

            // Confirmar a ação
            if (!confirm(`Confirmar resultado: ${valueSelected === 'G' ? 'Green (Ganhou)' : valueSelected === 'R' ? 'Red (Perdeu)' : 'Anulado'}?`)) {
                return;
            }

            // Mostrar indicador de carregamento
            this.disabled = true;
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="bi bi-hourglass-split"></i>';

            // Fazer a requisição para a API
            const url = `/analytics/gerencia/resultado?event_id=${eventId}&resultado=${valueSelected}`;
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
                    // Atualizar o ícone de resultado
                    atualizaIconeResultado(currentRow, data.data.resultado);
                    
                    // Se o resultado for Green (G), atualizar o valor total retornado na tabela principal
                    if (valueSelected === 'G' && data.data  && data.data.valor_total_retorno) {
                        updateValorTotalRetornado(currentRow, data.data.valor_total_retorno);
                    }
    
                    showNotification('Resultado registrado com sucesso!', 'success');
                } else {
                    showNotification(data.message || 'Erro ao atualizar resultado', 'danger');
                }

            }).catch(error => {
                console.error('Erro:', error)
                showNotification('Erro ao registra resultado da entrada. Tente novamente.', 'danger');
            }).finally(() => {
                // Restaurar o botão
                this.disabled = false;
                this.innerHTML = originalHTML;
            });
        });
    });

  // Adicionar listener para inicializar botões em conteúdo carregado dinamicamente
  setupDynamicContentListener();

}

/**
 * Atualiza o valor total retornado na tabela principal
 * @param {HTMLElement} row - A linha da tabela com a aposta
 * @param {number} valorTotalRetorno - O novo valor total retornado
 */

function updateValorTotalRetornado(row, valorTotalRetorno) {
    // Encontrar a seção de collapse que contém esta linha
    const collapseSection = row.closest(".collapse");
    if (!collapseSection) return;

    // Obter a linha principal do ciclo (tr anterior ao collapse)
    const cicloRow = collapseSection.previousElementSibling;
    if (!cicloRow) return;

    // Encontrar a célula que contém o valor total retornado (5a coluna)
    const valorRetornoCell = cicloRow.querySelector('td:nth-child(5)');
    if (!valorRetornoCell) return;

    // Atualizar o valor formatado
    valorRetornoCell.textContent = parseFloat(valorTotalRetorno).toFixed(2);

    // Destacar visualmente a célula atualizada para chamar atenção
    valorRetornoCell.style.transition = 'background-color 0.5s';
    valorRetornoCell.style.backgroundColor = '#28a745';
    valorRetornoCell.style.color = 'white';

    // Remover o destaque após 1 segundo
    setTimeout(() => {
        valorRetornoCell.style.backgroundColor = '';
        valorRetornoCell.style.color = '';
    }, 1000);
}


/**
 * Configura um listener para inicializar botões em conteúdo carregado dinamicamente
 */
function setupDynamicContentListener() {
    // Remover listener existente para evitar duplicação
    document.removeEventListener('click', dynamicContentHandler);
    
    // Adicionar novo listener
    document.addEventListener('click', dynamicContentHandler);
}


/**
 * Manipulador de eventos para inicializar botões em conteúdo carregado dinamicamente
 * @param {Event} e - O evento de clique
 */
function dynamicContentHandler(e) {
    const trigger = e.target.closest('[data-bs-toggle="collapse"]');
    if (!trigger) return;
    
    const targetId = trigger.getAttribute('href') || trigger.getAttribute('data-bs-target');
    if (!targetId || !targetId.startsWith('#detalhesLucro')) return;
    
    // Usar setTimeout para garantir que o DOM seja atualizado
    setTimeout(() => {
        const targetElement = document.querySelector(targetId);
        if (!targetElement || !targetElement.classList.contains('show')) return;
        
        // Inicializar os botões dentro do conteúdo expandido
        const buttons = targetElement.querySelectorAll('.salvar-resultado');
        if (!buttons || buttons.length === 0) return;
        
        setupGerenciaResultado();
    }, 300);
}
