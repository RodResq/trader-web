/**
 * Atualiza o icone da linha da aposta onde a ação do resultado foi executada
*/
export function atualizaIconeResultado(row, resultado="A") {
    if (!row) return;
    
    const mercadoCell = row.querySelector('td:nth-child(2)');
    
    // Cria elemento de ícone para estado da entrada
    const iconElement = document.createElement('i');
    // Se não existir, cria um novo
    if (!iconElement) {
        iconElement = document.createElement('i');
        mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);
    }

    // Obtém o texto original do mercado
    const mercadoText = mercadoCell.textContent.trim();

    // Reseta classes do ícone
    // iconElement.classList.remove('bi-check-circle-fill', 'bi-x-circle-fill', 'bi-stopwatch-fil');

    const opcoesEntradaMap = {
        'G': {
            icon: 'bi-check-circle',
            color: 'green',
            iconColor: 'white',
        },
        'R': {
            icon: 'bi-x-circle-fill', 
            color: 'red',
        },
        'A': {
            icon: 'bi-stopwatch-fill', 
            color: 'cornflowerblue'
        }
    };
    
    // Aplica o estilo correto
    const iconeResultado = opcoesEntradaMap[resultado];
    
    // Adiciona classes de ícone e estilo
    iconElement.classList.add('bi', iconeResultado.icon)
    iconElement.style.fontSize = '1rem';
    iconElement.style.marginRight = '5px';
    iconElement.style.color = resultado === "G" ? iconeResultado.iconColor: iconeResultado.color;
    iconElement.style.backgroundColor = resultado === "G" ? iconeResultado.color: null;
    iconElement.style.borderColor = resultado === "G" ? iconeResultado.color: null;
    iconElement.style.borderRadius = '100%';
    iconElement.style.verticalAlign = 'middle';
    
    // Remove o marcador de estado do texto
    mercadoCell.textContent = mercadoText.replace(/\[\w\]\s*/, '').trim();
    mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);

}