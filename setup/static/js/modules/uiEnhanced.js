/**
 * Módulo UI - Gerencia interações da interface do usuário
 */

/**
 * Inicializa componentes e ouvintes de eventos da UI
 */
export function initUiEnhanced() {
    initSideBar();
    initToggleSuperFavoritoHomeMarketsEnhanced();
    initToggleFavoritoHomeMarketsEnhanced();
    initToggleUnder25MarketsEnhanced();
    initToggleMarketsEnhancedOwnerBallSuperFavoritoHome();
    initToggleMarketsEnhancedOwnerBallFavoritoHome();
    initToggleMarketsEnhancedOwnerBallUnder25();
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
function initToggleSuperFavoritoHomeMarketsEnhanced() {
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
 * Inicializa alternância de visibilidade do mercado com persistência de estado
 */
function initToggleFavoritoHomeMarketsEnhanced() {
    const toggleFavoritosHome = document.getElementById('toggleFavoritosHome');
    const marketsCard = document.getElementById('ownerBallFavoritoHomeMarketsCard');

    if (!toggleFavoritosHome || !marketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleFavoritosHome.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }



    // Configura o listener para o checkbox
    toggleFavoritosHome.addEventListener("change", function() {
        marketsCard.style.display = this.checked ? "block" : "none";
    
        // Salvar o estado atual no localStorage
        localStorage.setItem('toggleFavoritosHomeState', this.checked);
    });
    
}

/**
 * Inicializa alternância de visibilidade do mercado com persistência de estado
 */
function initToggleUnder25MarketsEnhanced() {
    const toggleUnder25 = document.getElementById('toggleUnder25');
    const marketsCard = document.getElementById('ownerBallUnder25MarketsCard');

    if (!toggleUnder25 || !marketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleUnder25State');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleUnder25.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }



    // Configura o listener para o checkbox
    toggleUnder25.addEventListener("change", function() {
        marketsCard.style.display = this.checked ? "block" : "none";
    
        // Salvar o estado atual no localStorage
        localStorage.setItem('toggleUnder25State', this.checked);
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


/**
 * Inicializa alternância de visibilidade do mercado com persistência de estado
 */
function initToggleMarketsEnhancedOwnerBallSuperFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallSuperFavoritoHome');
    const ownerBallSuperFavoritomarketsCard = document.getElementById('ownerBallSuperFavoritoMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallSuperFavoritomarketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleOwnerBallSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallSuperFavoritomarketsCard.style.display = isChecked ? "block": "none";
    }



    // Configura o listener para o checkbox
    toggleOwnerBallSuperFavoritosHome.addEventListener("change", function() {
        ownerBallSuperFavoritomarketsCard.style.display = this.checked ? "block" : "none";
    
        // Salvar o estado atual no localStorage
        localStorage.setItem('toggleOwnerBallSuperFavoritosHomeState', this.checked);
    });
    
}


/**
 * Função para ser chamada após carregamento de página via AJAX
 * para garantir que o estado do toggle seja mantido
 */
export function restoreToggleStateOwnerBallSuperFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallSuperFavoritosHomeState');
    const ownerBallMarketsCard = document.getElementById('ownerBallMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallMarketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleOwnerBallSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallMarketsCard.style.display = isChecked ? "block": "none";
    }
}


function initToggleMarketsEnhancedOwnerBallFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallFavoritoHome');
    const ownerBallSuperFavoritomarketsCard = document.getElementById('ownerBallFavoritoHomeMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallSuperFavoritomarketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleOwnerBallFavoritoHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallSuperFavoritomarketsCard.style.display = isChecked ? "block": "none";
    }



    // Configura o listener para o checkbox
    toggleOwnerBallSuperFavoritosHome.addEventListener("change", function() {
        ownerBallSuperFavoritomarketsCard.style.display = this.checked ? "block" : "none";
    
        // Salvar o estado atual no localStorage
        localStorage.setItem('toggleOwnerBallFavoritoHomeState', this.checked);
    });
    
}


export function restoreToggleStateOwnerBallFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallFavoritoHomeState');
    const ownerBallMarketsCard = document.getElementById('ownerBallFavoritoHomeMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallMarketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleOwnerBallFavoritoHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallMarketsCard.style.display = isChecked ? "block": "none";
    }
}


function initToggleMarketsEnhancedOwnerBallUnder25() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallUnder25');
    const ownerBallSuperFavoritomarketsCard = document.getElementById('ownerBallUnder25MarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallSuperFavoritomarketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleOwnerBallUnder25State');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallSuperFavoritomarketsCard.style.display = isChecked ? "block": "none";
    }



    // Configura o listener para o checkbox
    toggleOwnerBallSuperFavoritosHome.addEventListener("change", function() {
        ownerBallSuperFavoritomarketsCard.style.display = this.checked ? "block" : "none";
    
        // Salvar o estado atual no localStorage
        localStorage.setItem('toggleOwnerBallUnder25State', this.checked);
    });
    
}


export function restoreToggleStateOwnerBallUnder25() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallUnder25State');
    const ownerBallMarketsCard = document.getElementById('ownerBallUnder25MarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallMarketsCard) return;

    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('toggleOwnerBallUnder25State');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallMarketsCard.style.display = isChecked ? "block": "none";
    }
}