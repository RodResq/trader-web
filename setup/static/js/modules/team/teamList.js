export function setupTeamList() {
    let currentPage = 0;
    let isLoading = false;
    let hasNextPage = true;

    const scrollContainer = document.getElementById('teamsScrollContainer');
    const teamsTableBody = document.getElementById('teamsTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const table = document.getElementById('tableClubesSF');

    if (!scrollContainer || !teamsTableBody) {
        console.error('Elementos scrollContainer e teamsTableBody');
        return;
    }

    const resizeObserver = new ResizeObserver(() => {});

    resizeObserver.observe(table);
    table.classList.add('table-with-border');

    function renderTeamRow(team) {
        const row = document.createElement('tr');
        row.className = 'tr-clubes';
        row.setAttribute('id', team.id_team);
        row.setAttribute('data-team-id', team.id_team);

        const iconHtml = team.icon_data_url 
            ? `<img src="${team.icon_data_url}" 
                alt="Logo ${team.name}" 
                class="team-logo" 
                style="width: 20px; height: 20px; object-fit: contain; margin-right: 8px;" 
                onerror="this.style.display='none'" />`
            : '';

        row.innerHTML = `
            <td class="td-clubes">
                ${team.id_team}
            </td>
            <td class="td-clubes">
                <div class="team-info">
                    ${iconHtml}
                    <span>${team.name}</span>
                </div>
            </td>
        `;

        return row;
    }

    function loadNextPage() {
        if (isLoading || !hasNextPage) return;

        isLoading = true;
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        const nextPage = currentPage + 1;
        const apiUrl = `api/v1/team/list/?page=${nextPage}`;

        fetch(apiUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Http Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.results  && data.results.length > 0) {
                data.results.forEach(team => {
                    const row = renderTeamRow(team);
                    teamsTableBody.appendChild(row);
                });

                currentPage = data.current_page;
                hasNextPage = data.has_next;
            }

            isLoading = false;
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar a pagina: ', error);
            isLoading = false;
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        });
    }

    scrollContainer.addEventListener('scroll', function() {
        const { scrollHeight, scrollTop, clientHeight } = scrollContainer;

        if (scrollHeight - scrollTop - clientHeight < 100) {
            loadNextPage();
        }
    });

    loadNextPage();

}
