
export function atualizaIconeResultado(row, resultado="A") {
    if (!row) return;
    
    const mercadoCell = row.querySelector('td:nth-child(2)');
    
    const iconElement = document.createElement('i');
    if (!iconElement) {
        iconElement = document.createElement('i');
        mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);
    }

    const mercadoText = mercadoCell.textContent.trim();

    const opcoesEntradaMap = {
        'G': {
            icon: 'bi-check-circle',
            color: 'green',
            iconColor: 'white',
        },
        'R': {
            icon: 'bi-x-circle-fill', 
            color: '#e94949',
        },
        'A': {
            icon: 'bi-stopwatch-fill', 
            color: 'cornflowerblue'
        }
    };
    
    const iconeResultado = opcoesEntradaMap[resultado];
    
    iconElement.classList.add('bi', iconeResultado.icon)
    iconElement.style.fontSize = '1rem';
    iconElement.style.marginRight = '5px';
    iconElement.style.color = resultado === "G" ? iconeResultado.iconColor: iconeResultado.color;
    iconElement.style.backgroundColor = resultado === "G" ? iconeResultado.color: null;
    iconElement.style.borderColor = resultado === "G" ? iconeResultado.color: null;
    iconElement.style.borderRadius = '100%';
    iconElement.style.verticalAlign = 'middle';
    
    mercadoCell.textContent = mercadoText.replace(/\[\w\]\s*/, '').trim();
    mercadoCell.insertBefore(iconElement, mercadoCell.firstChild);

}