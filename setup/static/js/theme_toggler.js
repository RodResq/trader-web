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
  
  // O HTML e o BODY já devem ter o tema aplicado pelo script inline
  // Apenas garante que o ícone está correto
  updateThemeIcon(savedTheme);

  // Adicionar evento de clique para alternar o tema
  themeToggler.addEventListener('click', function() {
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
    
    // Salvar a preferência do usuário
    localStorage.setItem('theme', newTheme);
  });

  /**
   * Atualiza apenas o ícone do botão de tema
   * @param {string} theme - O tema a ser representado ('dark' ou 'light')
   */
  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    
    themeIcon.classList.remove('bi-sun', 'bi-moon');
    themeIcon.classList.add(theme === 'dark' ? 'bi-sun' : 'bi-moon');
    
    // Atualizar texto do botão
    themeToggler.setAttribute('title', theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
  }

  /**
   * Define o tema atual e atualiza o ícone
   * @param {string} theme - O tema a ser aplicado ('dark' ou 'light')
   */
  function setTheme(theme) {
    // Atualizar atributos de tema do documento
    html.setAttribute('data-bs-theme', theme);
    document.body.setAttribute('data-bs-theme', theme);
    
    // Limpar classes de tema existentes
    document.body.classList.remove('theme-light', 'theme-dark');
    html.classList.remove('theme-light', 'theme-dark');
    
    // Adicionar classe apropriada ao body e html
    html.classList.add('theme-' + theme);
    document.body.classList.add('theme-' + theme);
    
    // Atualizar o ícone
    updateThemeIcon(theme);
    
    // Forçar reflow para garantir que todas as mudanças de estilo sejam aplicadas
    void document.body.offsetHeight;
  }
}