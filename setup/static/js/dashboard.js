/**
 * Script para controle do Dashboard
 * Este arquivo gerencia as interações do usuário na página do dashboard
 */
document.addEventListener("DOMContentLoaded", function () {

// Função para formatar células de data na tabela de mercados
    function formatDateCells() {
        const table = document.getElementById('marketsTable');
        if (!table) return;
        
        const dateColumnIndex = 4;
        const rows = table.querySelectorAll('tbody td');
        
        rows.forEach(row => {
            const dateCell = row.querySelector(`td:nth-child(${dateColumnIndex + 1})`);
            if (dateCell) {
                const originalDate = dateCell.textContent.trim();
                
                if (isValidateFormat(originalDate)) {
                    return;
                }
                // Tenta formatar a data para DD/MM/YYYY
                try {
                    const date = new Date(originalDate);
                    if (!isNaN(date.getTime())) { // Verifica se a data é válida
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year =  date.getFullYear();
                        
                        dataCell.textContent = `${day}/${month}/${year}`;
                        dateCell.setAttribute = ('data-original-date', originalDate)
                    }
    
                } catch (e) {
                    console.warn('Não foi possível formatar a data:', originalDate)
                }

            }
        });
    }

    // Função para aplicar as classes de status com base nos valores de Home %
  function updateHomeStatusIcons() {
    const table = document.getElementById('marketsTable');
    if (!table) return;
    
    const mercadoColumnIndex = 0;
    const homeColumnIndex = 2; // Índice da coluna Home % (3ª coluna, índice 2)
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const mercadoCell = row.querySelector(`td:nth-child(${mercadoColumnIndex + 1})`);
      const homeCell = row.querySelector(`td:nth-child(${homeColumnIndex + 1})`);
      
      if (homeCell) {
        const statusIcon = mercadoCell.querySelector('.market-status');
        if (!statusIcon) return;
        
        // Extrair o valor numérico da célula (removendo o span do texto)
        let homeValue = homeCell.textContent.trim();
        
        // Tenta converter para número
        homeValue = parseFloat(homeValue);
        
        // Se não for um número válido, considera como 0
        if (isNaN(homeValue)) {
          homeValue = 0;
        }
        
        // Remove as classes existentes e adiciona a classe apropriada
        statusIcon.classList.remove('status-open', 'status-close', 'status-warning');
        
        if (homeValue >= 75) {
            statusIcon.classList.add('status-open');
        } else if (homeValue <=75 && homeValue < 65) {
            statusIcon.classList.add('status-open');
        } else {
            statusIcon.classList.add('status-close'); 
        }
      }
    });
  }


    // Executa a formatação das datas quando a página carregar
    formatDateCells();
    updateHomeStatusIcons();

    function isValidateFormat(dataString) {
        // Verifica se o formato é DD/MM/YYYY
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        return regex.test(dataString)
    }

// Função para formatar e normalizar datas para comparação
   function formatDateForComparison(dateString) {
    if (!dateString) return '';

    // Remove espaços extras
    dateString = dateString.trim();

    // Verifica se está no formato esperado DD/MM/YYYY
    if (isValidateFormat(dateString)) {
        return dateString;
    }

    return dateString;
    }

// Função para aplicar máscara de data no formato DD/MM/YYYY
    function applyDateMask(input) {
        let v = input.value;
        v = v.replace(/\D/g, ''); // Remove não-dígitos

        // Aplica a máscara
        if (v.length > 4) {
            // Formata como DD/MM/YYYY
            v = v.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
        }

        input.value = v;

        return v;
    }

// Controle do sidebar
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-collapsed");
    
        // Para dispositivos móveis
        if (window.innerWidth < 768) {
          document.body.classList.toggle("sidebar-active");
        }
      });
  }

  // Inicialização para dispositivos móveis
  if (window.innerWidth < 768) {
    document.body.classList.add("sidebar-collapsed");
  }

  // Controle de visibilidade dos mercados
  const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome')
  const marketsCard = document.getElementById('marketsCard');

  // Configura o listener para o checkbox
  if (toggleSuperFavoritosHome && marketsCard) {
      toggleSuperFavoritosHome.addEventListener("change", function () {
        if (this.checked) {
          marketsCard.style.display = "block";
        } else {
          marketsCard.style.display = "none";
        }
      });
    
    }

    // Define o estado inicial baseado no checkbox
    if (!toggleSuperFavoritosHome.checked) {
      marketsCard.style.display = "none";
    }

// Implementação do filtro por data na tabela de mercados
    const marketDateFilter = document.getElementById('marketDateFilter')
    const clearDateFilter = document.getElementById('clearDateFilter')
    const marketsTable = document.getElementById('marketsTable')
    
    if (marketDateFilter && marketsTable) {
        // Função para filtrar a tabela por data
        function filterTableByDate() {
            const filterDate = marketDateFilter.value;
            const formattedFilterDate = formatDateForComparison(filterDate);

            // Se não houver valor de filtro, mostre todas as linhas
            if (!filterDate) {
                const rows = marketsTable.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    row.style.display = '';
                });
                return;
            }

            // Filtra as linhas da tabela
            const rows = marketsTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const dataCell = row.querySelector('td:nth-child(5)'); // Coluna de data (5ª coluna)

                if (dataCell) {
                    const rowDate = dataCell.textContent.trim();
                    const formattedRowDate = formatDateForComparison(rowDate);

                     // Compara as datas
                    if (formattedRowDate === formattedFilterDate) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none'
                    }
                }
            });
        }

        // Aplicar máscara durante a digitação
        marketDateFilter.addEventListener('input', function(e) {
            e.preventDefault(); // Impede o comportamento padrão
            applyDateMask(this);
        });

        // Impede que o campo seja tratado como data
        marketDateFilter.addEventListener('focus', function(e) {
            // Garante que o input seja tratado como texto
            this.setAttribute('type', 'text');
        });

        // Evento para aplicar o filtro quando o usuário sair do campo ou pressionar Enter
        marketDateFilter.addEventListener('blur', function(e) {
            filterTableByDate()
        });
        
        marketDateFilter.addEventListener('keyup', function(e) {
            if (e.key == 'Enter') {
                filterTableByDate();
            }
        });

        // Evento para limpar o filtro
        if (clearDateFilter) {
            clearDateFilter.addEventListener('click', function() {
                marketDateFilter.value = '';
                filterTableByDate()
            })
        }
    }

});
