// Script para calcular automaticamente o valor disponível para entrada
export function calcularValorDisponivelEntrada() {
    const saldoAtualInput = document.getElementById('id_saldo_atual');
    
    // Calcular automaticamente quando o saldo atual for alterado
    saldoAtualInput.addEventListener('focusout', function() {
        calcularValorDisponivel(saldoAtualInput.firstChild)
    });
    
};

// Função para calcular 6% do saldo atual
function calcularValorDisponivel(saldoAtualInput) {
    const valorDisponivelInput = document.getElementById('id_valor_disponivel_entrada');

    const saldoAtual = parseFloat(saldoAtualInput.value) || 0;
    const valorDisponivel = (saldoAtual * 0.06).toFixed(2);

    valorDisponivelInput.firstChild.value = valorDisponivel;

}