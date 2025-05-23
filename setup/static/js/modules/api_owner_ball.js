let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

export function setupApiOwnerBall() {

    const url = `/api/mercados_sfs_owner_ball?page=${currentPage}&items_per_page=${itemsPerPage}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(reponse => {
        if (!Response.ok) {
            throw new Error('Erro ao carregar dados da página');
        }
        return reponse.json();
    }).then(data => {
        if (data.success) {
            //TODO atualizar nova tabela owner ball
        }
    }).catch(error => {
        console.error('Erro ao carregar página:', error);
        showPaginationError('Erro ao carregar dados. Tente novamente.');
    }).finally(() => {
        // TODO Implementar o finally
    })
}