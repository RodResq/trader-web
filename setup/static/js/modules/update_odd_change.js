
export async function setupUpdateOddChange() {
    const btnsOddChange = document.querySelectorAll('.odd-change-btn');

    if (!btnsOddChange || btnsOddChange.length === 0) return;

    btnsOddChange.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
    
            const eventId = this.dataset.eventId;
            const currentRow = this.closest('tr');

            if (!eventId || !currentRow) {
                console.error('Event ID ou linha não encontrados');
                return;
            }

            const originalIcon = this.innerHTML;
            this.innerHTML = '<i class="bi bi-hourglass-split"></i>';
            this.disabled = true;

            try {
                const url = `/api/odd_change/${eventId}`
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                       'Accept': 'application/json' 
                    }
                });
        
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`)
                }
        
                const data = await response.json();
                console.log('Dados recebidos da API:', data);

                if (data.success && data.oddChange) {
                    await atualizarIconeOdd(currentRow, data.oddChange);
                } else {
                    console.warn('Dados de odd change não encontrados na resposta');
                }
                                
                return data;
        
            } catch(error) {
                console.error('Erro ao buscar dados: ', error);
                throw error;
            } finally {
                this.innerHTML = originalIcon;
                this.disabled = false;
            }
            
        });
    });
}

async function atualizarIconeOdd(row, oddChangeData) {
    const oddCell = row.querySelector('td:nth-child(3)');

    if (!oddCell) {
        console.error('Célula de odd não encontrada');
        return;
    }

    const currentOddText = oddCell.textContent.trim();
    const currentOddValue = parseFloat(currentOddText.replace(/[^\d.,]/g, '').replace(',', '.'));

    const newOddValue = parseFloat(oddChangeData.home_fractional_value);

    if (isNaN(currentOddValue) || isNaN(newOddValue)) {
        console.error('Valores de odd inválidos:', { current: currentOddValue, new: newOddValue });
        return;
    }

    console.log('Comparando odds:', { current: currentOddValue, new: newOddValue });

    let changeType = 'P'; 
    let iconClass = 'bi-stop';
    let iconColor = 'yellow';

    if (newOddValue > currentOddValue) {
        changeType = 'S'; 
        iconClass = 'bi-arrow-up-short';
        iconColor = 'green';
    } else if (newOddValue < currentOddValue) {
        changeType = 'D'; 
        iconClass = 'bi-arrow-down-short';
        iconColor = 'red';
    }

    updateOddCell(oddCell, newOddValue, iconClass, iconColor);

    await updateOddChangeInBackend(row, newOddValue, changeType); 

    // if (typeof showNotification === 'function') {
    //     const changeText = changeType === 'S' ? 'subiu' : changeType === 'D' ? 'desceu' : 'manteve-se';
    //     showNotification(`Odd atualizada: ${currentOddValue.toFixed(2)} → ${newOddValue.toFixed(2)} (${changeText})`, 'success');
    // }

}


function updateOddCell(oddCell, newOddValue, iconClass, iconColor) {
    const updateButton = oddCell.querySelector('#atualizar-odd-change');

    const elementsToRemove = [];
    for (let child of oddCell.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE && child.id !== 'atualizar-odd-change') {
            elementsToRemove.push(child);
        } else if (child.nodeType === Node.TEXT_NODE) {
            elementsToRemove.push(child);
        }
    }

    elementsToRemove.forEach(element => element.remove());
    
    const iconElement = document.createElement('i');
    iconElement.className = `bi ${iconClass}`;
    iconElement.style.cssText = `color: ${iconColor}; vertical-align: middle; margin-right: 5px; font-size: 1rem;`;
    
    const oddText = document.createTextNode(` ${newOddValue.toFixed(2)}`);
    
    if (updateButton) {
        oddCell.insertBefore(iconElement, updateButton);
        oddCell.insertBefore(oddText, updateButton);
        // Adicionar um espaço antes do botão
        oddCell.insertBefore(document.createTextNode(' '), updateButton);
    } else {
        oddCell.appendChild(iconElement);
        oddCell.appendChild(oddText);
    }
    
    iconElement.style.transition = 'background-color 0.3s ease';
    iconElement.style.backgroundColor = iconColor === 'green' ? '#d4edda' : iconColor === 'red' ? '#f8d7da' : '#fff3cd';
    
    setTimeout(() => {
        iconElement.style.backgroundColor = '';
    }, 2000);
}


async function updateOddChangeInBackend(row, newOddValue, changeType) {
    const eventId = row.querySelector('td:first-child')?.textContent?.trim();

    if (!eventId) {
        console.error('ID do evento não encontrado para atualização no backend');
        return;
    }

    try {
        const response = await fetch('/api/update_odd', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                event_id: eventId,
                odd_value: newOddValue,
                odd_change: changeType
            })
        })

        if (!response.ok) {

        }

    } catch (error) {
        console.error('Erro ao atualizar status no backend:', error);
    }

}


function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

