/**
 * Script específico para a página de gerência
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de gerência
    const lucroTable = document.getElementById('lucroTable');
    if (!lucroTable) return;
    
    // Inicializar todos os collapses na tabela
    const collapseLinks = lucroTable.querySelectorAll('a[data-bs-toggle="collapse"]');
    
    collapseLinks.forEach(link => {
      // Obter o ID do elemento collapse alvo
      const targetId = link.getAttribute('href');
      if (!targetId) return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      // Garantir que o bootstrap está disponível
      if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
        try {
          // Criar instância do collapse sem toggling inicial
          new bootstrap.Collapse(targetElement, {
            toggle: false
          });
        } catch (error) {
          console.error('Erro ao inicializar collapse:', error);
        }
      }
      
      // Adicionar listener para o ícone
      link.addEventListener('click', function(e) {
        // Não prevenir evento padrão para permitir que o bootstrap faça o toggle
        
        // Atualizar o ícone
        const icon = this.querySelector('.bi');
        if (icon) {
          setTimeout(() => {
            const isExpanded = targetElement.classList.contains('show');
            icon.classList.remove('bi-chevron-down', 'bi-chevron-up');
            icon.classList.add(isExpanded ? 'bi-chevron-up' : 'bi-chevron-down');
          }, 50);
        }
      });
    });
  });
  