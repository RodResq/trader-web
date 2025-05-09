/**
 * Módulo UI - Gerencia interações da interface do usuário
 */

/**
 * Inicializa componentes e ouvintes de eventos da UI
 */
export function initUiEnhanced() {
    initSideBar();
    initToggleMarketsEnhanced();
}

/**
 * Inicializa funcionalidade de alternância da barra lateral
 */
function initSideBar() {
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", function() {
            document.body.classList.toggle("sidebar-collapsed");

            // Para dispositivos móveis
            if (window.innerWidth < 768) {
                document.body.classList.toggle("sidebar-active");
            }
        });
    }

    // Incialização para dispositivos móveis
    if (window.innerWidth < 768) {
        document.body.classList.add("sidebar-collapsed");
    }
}

/**
 * Inicializa alternância de visibilidade do mercado com persistência de estado
 */
function initToggleMarketsEnhanced() {
    const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome');
    const marketsCard = document.getElementById('marketsCard');

    if (!toggleSuperFavoritosHome || !marketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleSuperFavoritosHome.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }



    // Configura o listener para o checkbox
    toggleSuperFavoritosHome.addEventListener("change", function() {
        marketsCard.style.display = this.checked ? "block" : "none";
    
        // Salvar o estado atual no localStorage
        localStorage.setItem('toggleSuperFavoritosHomeState', this.checked);
    });
    
}


/**
 * Função para ser chamada após carregamento de página via AJAX
 * para garantir que o estado do toggle seja mantido
 */
export function restoreToggleState() {
    const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome');
    const marketsCard = document.getElementById('marketsCard');

    if (!toggleSuperFavoritosHome || !marketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleSuperFavoritosHome.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }
}