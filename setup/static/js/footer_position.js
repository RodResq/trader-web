/**
 * Script para garantir posicionamento correto do footer
 */

document.addEventListener('DOMContentLoaded', function() {
    const adjustFooter = function() {
      const body = document.body;
      const html = document.documentElement;
      
      // Altura total do documento
      const documentHeight = Math.max(
        body.scrollHeight, 
        body.offsetHeight, 
        html.clientHeight, 
        html.scrollHeight, 
        html.offsetHeight
      );
      
      // Altura da janela do navegador
      const windowHeight = window.innerHeight;
      
      // Obter o footer
      const footer = document.querySelector('.footer');
      if (!footer) return;
      
      // Se o conteúdo for menor que a altura da janela, posicione o footer no fundo
      if (documentHeight <= windowHeight) {
        footer.style.position = 'fixed';
        footer.style.bottom = '0';
        footer.style.width = getFooterWidth();
      } else {
        footer.style.position = 'relative';
        footer.style.width = 'auto';
      }
    };
    
    // Função para calcular a largura apropriada do footer com base no estado da sidebar
    function getFooterWidth() {
      const sidebarWidth = 250; // Largura da sidebar em pixels
      const windowWidth = window.innerWidth;
      
      // Verificar se a sidebar está colapsada
      const isSidebarCollapsed = document.body.classList.contains('sidebar-collapsed');
      
      // Em modo móvel, a largura é sempre 100%
      if (windowWidth <= 768) {
        return '100%';
      }
      
      // Se a sidebar não estiver colapsada, a largura do footer é ajustada
      if (!isSidebarCollapsed) {
        return `calc(100% - ${sidebarWidth}px)`;
      }
      
      // Se a sidebar estiver colapsada, a largura é 100%
      return '100%';
    }
    
    // Executar ajuste no carregamento da página
    adjustFooter();
    
    // Executar ajuste quando a janela for redimensionada
    window.addEventListener('resize', adjustFooter);
    
    // Executar ajuste quando a página for carregada completamente (incluindo imagens)
    window.addEventListener('load', adjustFooter);
    
    // Ajustar quando a sidebar é recolhida ou expandida
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function() {
        // Dar tempo para a animação da sidebar terminar
        setTimeout(adjustFooter, 1);
      });
    }
  });
  