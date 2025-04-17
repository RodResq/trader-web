/**
 * Módulo UI - Gerencia interações da interface do usuário
 */

/**
 * Inicializa componentes e ouvintes de eventos da UI
 */
export function initUi() {
    initSideBar();
    initToggleMarkets();
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
 * Inicializa alternância de visibilidade do mercado
 */
function initToggleMarkets() {
    const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome');
    const marketsCard = document.getElementById('marketsCard');

    // Configura o listener para o checkbox
    if (toggleSuperFavoritosHome && marketsCard) {
        toggleSuperFavoritosHome.addEventListener("change", function() {
            marketsCard.style.display = this.checked ? "block" : "none";
        });
    
        // Define o estado inicial baseado no checkbox
        if (!toggleSuperFavoritosHome.checked) {
            marketsCard.style.display = "none";
        }
    }
}