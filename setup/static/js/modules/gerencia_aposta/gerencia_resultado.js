import { atualizaIconeResultado } from "./icone_lista_aposta.js";
import { showNotification } from "../notifications.js";

const BASE_URL_API = '/api/v1/gerencia';

export function setupGerenciaResultado() {
    const btnSalvarResultado = document.querySelectorAll('.salvar-resultado');

    if (!btnSalvarResultado || btnSalvarResultado.length === 0) return;

    btnSalvarResultado.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn); 

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const eventId = this.getAttribute('data-event-id');
            if (!eventId) return;

            const eventOrigin = this.getAttribute('data-event-origin');
            if (!eventOrigin) return;

            const currentRow = this.closest('tr');
            if (!currentRow) return;

            const selectResultado = currentRow.querySelector('.resultado-select');
            const valueSelected = selectResultado ? selectResultado.value: null;

            if (!valueSelected) {
                showNotification('Por favor, selecione um resultado', 'warning');
                return;
            }

            if (!confirm(`Confirmar resultado: ${valueSelected === 'G' ? 'Green (Ganhou)' : valueSelected === 'R' ? 'Red (Perdeu)' : 'Anulado'}?`)) {
                return;
            }

            this.disabled = true;
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="bi bi-hourglass-split"></i>';

            const url = `${BASE_URL_API}/resultado?eventId=${eventId}&eventOrigin=${eventOrigin}&resultado=${valueSelected}`;
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
                    atualizaIconeResultado(currentRow, data.data.resultado);
                    
                    if ((data.data.resultado === 'G' || data.data.resultado === 'R') && data.data) {
                        updateValorTotalRetornado(currentRow, data.data.valorIndividualAposta, data.data.resultado);
                    }
    
                    showNotification('Resultado registrado com sucesso!', 'success');
                } else {
                    showNotification(data.message || 'Erro ao atualizar resultado', 'danger');
                    return;
                }

            }).catch(error => {
                console.error('Erro:', error)
                showNotification('Erro ao registra resultado da entrada. Tente novamente.', 'danger');
            }).finally(() => {
                this.disabled = false;
                this.innerHTML = originalHTML;
            });
        });
    });

  setupDynamicContentListener();

}


function updateValorTotalRetornado(row, valorIndivualAposta, resultadoSelecionado) {
    const collapseSection = row.closest(".collapse");
    if (!collapseSection) return;

    const cicloRow = collapseSection.previousElementSibling;
    if (!cicloRow) return;

    const valorRetornoCell = cicloRow.querySelector('td:nth-child(4)');
    if (!valorRetornoCell) return;

    if (resultadoSelecionado === 'R') {
        const currentValueCell = parseFloat(String(valorRetornoCell.textContent).replace(',', '.')).toFixed(2);
        const valorTotalRetornoResponse = parseFloat(valorIndivualAposta).toFixed(2);
        valorRetornoCell.textContent = parseFloat(currentValueCell - valorTotalRetornoResponse).toFixed(2);
    }

    valorRetornoCell.style.transition = 'background-color 1s';
    valorRetornoCell.style.backgroundColor = resultadoSelecionado === 'G'? '#28a745': '#CC0000';
    valorRetornoCell.style.color = 'white';

    setTimeout(() => {
        valorRetornoCell.style.backgroundColor = '';
        valorRetornoCell.style.color = '';
    }, 1000);
}


function setupDynamicContentListener() {
    document.removeEventListener('click', dynamicContentHandler);
    document.addEventListener('click', dynamicContentHandler);
}



function dynamicContentHandler(e) {
    const trigger = e.target.closest('[data-bs-toggle="collapse"]');
    if (!trigger) return;
    
    const targetId = trigger.getAttribute('href') || trigger.getAttribute('data-bs-target');
    if (!targetId || !targetId.startsWith('#detalhesLucro')) return;
    
    setTimeout(() => {
        const targetElement = document.querySelector(targetId);
        if (!targetElement || !targetElement.classList.contains('show')) return;
        
        const buttons = targetElement.querySelectorAll('.salvar-resultado');
        if (!buttons || buttons.length === 0) return;
        
        setupGerenciaResultado();
    }, 300);
}
