/**
 * Módulo Theme Toggler - Gerencia a alternância entre temas claro e escuro
 */

/**
 * Inicializa o alternador de temas
 */
export function initThemeToggler() {
    const themeToggler = document.getElementById('themeToggler');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;
  
    if (!themeToggler) return;
  
    // Verificar tema salvo no localStorage ou usar o tema padrão (dark)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  
    // Adicionar evento de clique para alternar o tema
    themeToggler.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      setTheme(newTheme);
      
      // Salvar a preferência do usuário
      localStorage.setItem('theme', newTheme);
    });
  
    /**
     * Define o tema atual e atualiza o ícone
     * @param {string} theme - O tema a ser aplicado ('dark' ou 'light')
     */
    function setTheme(theme) {
      html.setAttribute('data-bs-theme', theme);
      document.body.setAttribute('data-bs-theme', theme);
      
      // Atualizar o ícone do botão
      if (themeIcon) {
        themeIcon.classList.remove('bi-sun', 'bi-moon');
        themeIcon.classList.add(theme === 'dark' ? 'bi-sun' : 'bi-moon');
        
        // Atualizar texto do botão
        themeToggler.setAttribute('title', theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
      }
      
      // Adicionar ou remover a classe para estilização adicional
      if (theme === 'light') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
      } else {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
      }
    }
  }