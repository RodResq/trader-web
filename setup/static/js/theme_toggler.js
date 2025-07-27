export function initThemeToggler() {
  const themeToggler = document.getElementById('themeToggler');
  const themeIcon = document.getElementById('themeIcon');
  const html = document.documentElement;

  if (!themeToggler) return;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  themeToggler.addEventListener('click', function() {
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
    
    localStorage.setItem('theme', newTheme);
  });


  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    
    themeIcon.classList.remove('bi-sun', 'bi-moon');
    themeIcon.classList.add(theme === 'dark' ? 'bi-sun' : 'bi-moon');
    
    themeToggler.setAttribute('title', theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
  }


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