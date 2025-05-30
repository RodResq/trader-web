
export async function setupUpdateOddChange() {
    const btnOddChange = document.getElementById('atualizar-odd-change');

    if (!btnOddChange) return;

    btnOddChange.addEventListener('click', async function(e) {
        e.preventDefault();

        const eventId = this.dataset.eventId;
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
            
            return data;
    
        } catch(error) {
            console.error('Erro ao buscar dados: ', error);
            throw error;
        }
        
    });
}

