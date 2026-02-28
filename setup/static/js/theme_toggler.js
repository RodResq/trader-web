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
    html.setAttribute('data-bs-theme', theme);
    document.body.setAttribute('data-bs-theme', theme);
    
    document.body.classList.remove('theme-light', 'theme-dark');
    html.classList.remove('theme-light', 'theme-dark');
    
    html.classList.add('theme-' + theme);
    document.body.classList.add('theme-' + theme);
    
    updateThemeIcon(theme);
    
    void document.body.offsetHeight;

    // Notifica outros módulos sobre a mudança de tema
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
}