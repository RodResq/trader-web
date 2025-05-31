
export async function setupUpdateOddChange() {
    const btnsOddChange = document.querySelectorAll('.odd-change-btn');
    let currentRow = null;

    if (!btnsOddChange) return;

    btnsOddChange.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
    
            const eventId = this.dataset.eventId;
            currentRow = this.closest('tr');

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
                console.log(data);
                                
                if (data.oddChange) {
                    const oddElement = currentRow.querySelector('td:nth-child(3)');
                    let valorOdd = oddElement.textContent.trim();
                    valorOdd = parseFloat(valorOdd.replace(',', '.'))

                    const oddAtual = data.oddChange['home_fractional_value']

                    if (oddAtual != valorOdd) {
                        const iconOdd = oddElement.firstElementChild;
                        iconOdd.classList.remove('bi-stop', 'bi-arrow-up-short', 'arrow-down-short');

                        const iconElement = document.createElement('i');
                        if (oddAtual < valorOdd) {
                            iconElement.classList.add('arrow-down-short');
                            iconElement.style.color = 'red';
                            iconElement.style.verticalAlign = 'middle';
                            
                            oddElement.insertBefore(iconElement, oddElement.firstElementChild);
                            oddElement.textContent = oddAtual;
                        } else {
                            iconOdd.classList.add('bi-arrow-up-short');
                            iconOdd.style.color = 'green';
                            iconOdd.style.verticalAlign = 'middle';
                        }
                    }
                }
                
                return data;
        
            } catch(error) {
                console.error('Erro ao buscar dados: ', error);
                throw error;
            }
            
        });
    });
}

