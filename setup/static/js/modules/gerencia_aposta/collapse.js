/**
 * Módulo para inicializar os elementos de collapse para os detalhes de gerência de apostas
 */

/**
 * Inicializa os collapses de detalhes de gerência
 */
export function initGerenciaCollapses() {
    // Selecionar todos os botões de toggle de collapse na tabela de gerência
    const collapseButtons = document.querySelectorAll('a[data-bs-toggle="collapse"]');
    
    if (!collapseButtons.length) return;
    
    // Verificar se o Bootstrap está carregado
    if (typeof bootstrap === 'undefined') {
      console.error('Bootstrap não está carregado. Os collapses não funcionarão corretamente.');
      return;
    }
    
    // Inicializar manualmente os collapses
    collapseButtons.forEach(button => {
      const targetId = button.getAttribute('href') || button.getAttribute('data-bs-target');
      
      if (!targetId) return;
      
      const targetElement = document.querySelector(targetId);
      
      if (!targetElement) {
        console.warn(`Elemento alvo ${targetId} não encontrado.`);
        return;
      }
      
      // Criar instância de Collapse (sem toggle inicial)
      try {
        new bootstrap.Collapse(targetElement, {
          toggle: false
        });
      } catch (error) {
        console.error(`Erro ao inicializar collapse para ${targetId}:`, error);
      }
      
      // Adicionar evento de clique para atualizar o ícone
      button.addEventListener('click', function(e) {
        // Deixamos o Bootstrap lidar com o toggle do collapse
        
        // Atualizamos apenas o ícone
        const icon = this.querySelector('.bi');
        if (icon) {
          // Timeout curto para permitir que o Bootstrap atualize as classes primeiro
          setTimeout(() => {
            const isCollapsed = !targetElement.classList.contains('show');
            icon.classList.remove('bi-chevron-down', 'bi-chevron-up');
            icon.classList.add(isCollapsed ? 'bi-chevron-up' : 'bi-chevron-down');
          }, 50);
        }
      });
    });
  }
  