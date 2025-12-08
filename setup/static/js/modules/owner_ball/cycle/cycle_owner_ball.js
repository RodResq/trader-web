import { showSpinner, hideSpinner } from "../../utils.js";

const API_BASE_URL = '/api/v1';

export function initCycleOwnerBall() {
    const modal = document.getElementById('modalCycleOwnerBall');
    const btnNewCycle = document.getElementById('btnNewCycleOwnerBall');
    const btnSaveCycle = document.getElementById('btnSaveCycleOwnerBall')

    let token = "";

    if (!btnNewCycle) return;

    btnNewCycle.addEventListener('click', function(e) {
        e.preventDefault();
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    });

    btnSaveCycle.addEventListener('click', saveCycle);

    function getApiUrl(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }


    async function preRequestLogin() {
        try {
            const dadosLogin = {
                username: 'rresq',
                password: '123'
            }
            const response = await fetch('/api/token/', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(dadosLogin)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            const data = await response.json();
            token = data['access'];
        } catch (error) {
            console.error(error);
        }
    }

    async function saveCycle() {

       await preRequestLogin(); 
       const category = document.getElementById('categoryCycleOwnerBall');
       const startDate = document.getElementById('inputStartDateCycleOwnerBall');
       const endDate = document.getElementById('inputEndDateCycleOwnerBall');
       const currentBalance = document.getElementById('inputCurrentBalance');
       const availebleValue = document.getElementById('inputAvailebleValue');
       
       if (!category || !startDate || !endDate || !currentBalance || !availebleValue) return;
       
       const dados = {
        category: category.value,
        start_date: startDate.value,
        end_date: endDate.value,
        current_balance: parseFloat(currentBalance.value),
        available_value: parseFloat(availebleValue.value)
       }

       try {
           const response = await fetch(getApiUrl('/owner_ball/cycle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(dados)
           });
       
           if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
           }
       
           const data = await response.json();
           if (data.success) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                refreshCycleOwnerBall();
           } else {
                exibirMensagem(`Erro: ${data.message}`, 'danger'); 
           }
       } catch(error) {
            console.error('Erro ao gravar ciclo Owner Ball:', error);
            exibirMensagem('Erro ao Gravar Ciclo Owner Ball. Verifique o console para mais detalhes.', 'danger');
       }
    }

    async function refreshCycleOwnerBall() {
        const tableContainer = document.querySelector('#ciclosOwnerBallTable');

        if (!tableContainer) return;

        try {
            showSpinner(tableContainer);

            const response = await fetch('/api/v1/owner_ball/cycle', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
           
            const data = await response.json();
            if (data.success) {
                updateOwnerBallTable(data.data);
                exibirMensagem('Tabela Owner Ball atualizada com sucesso.', 'success');
            } else {
                exibirMensagem('Erro ao recuperar listagem.', 'danger');
            }
            
        } catch (error) {
            console.error('Erro ao atualizar listagem de Cycle Owner Ball: ', error);
            exibirMensagem('Erro ao atualizar Listagem Cycle Owner Ball.', 'danger');
        } finally {
            setTimeout(() => {
                hideSpinner(tableContainer);
            }, 1000)
        }

    }
    
    function getCSRFToken() {
        return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    }
    
    function exibirMensagem(texto, tipo) {
        const span = document.createElement('span');
        span.innerHTML = `
            <div class="alert alert-${tipo}" role="alert">
                ${texto}
            </div>
        `;
        
        const cycleTitle = document.querySelector('.alert-message');
        cycleTitle.appendChild(span);
        
        setTimeout(() => {
            span.classList.remove('show');
            setTimeout(() => span.remove(), 300);
        }, 5000);
    }

    function updateOwnerBallTable(cycles) {
        const tbody = document.querySelector('#ciclosOwnerBallTable tbody');
        
        if(!tbody) return;
        
        tbody.innerHTML = `
            <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;

        if (!cycles && cycles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Nenhum ciclo Owner Ball cadastrado.</td>
                </tr>
            `;
            return;
        };
    
        let html = '';
        cycles.forEach(cycle => {
            const startDate = new Date(cycle.start_date).toLocaleDateString('pt-BR');
            const endDate = new Date(cycle.end_date).toLocaleDateString('pt-BR');
    
            html += `
                <tr>
                    <td>${cycle.category_display}</td>
                    <td>${startDate} a ${endDate}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="me-2">R$ ${Number(cycle.current_balance).toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-info btn-evolucao-saldo" 
                                    data-ciclo-id="${cycle.id}"
                                    data-ciclo-categoria="${cycle.category_display}"
                                    data-ciclo-periodo="${startDate} à ${endDate}"
                                    title="Ver evolução do saldo">
                                <i class="bi bi-graph-up"></i>
                            </button>
                        </div>
                    </td>
                    <td>R$ ${Number(cycle.available_value).toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary" onclick="editCycle(${cycle.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCycle(${cycle.id})" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    
        tbody.innerHTML = html;
    }

}
