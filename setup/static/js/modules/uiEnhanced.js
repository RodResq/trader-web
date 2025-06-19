export function initUiEnhanced() {
    initSideBar();
    initToggleSuperFavoritoHomeMarketsEnhanced();
    initToggleMarketsEnhancedFavoritoHome();
    initToggleUnder25MarketsEnhanced();
    initToggleMarketsEnhancedOwnerBallSuperFavoritoHome();
    initToggleMarketsEnhancedOwnerBallFavoritoHome();
    initToggleMarketsEnhancedOwnerBallUnder25();
}


function initSideBar() {
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", function() {
            document.body.classList.toggle("sidebar-collapsed");

            if (window.innerWidth < 768) {
                document.body.classList.toggle("sidebar-active");
            }
        });
    }

    if (window.innerWidth < 768) {
        document.body.classList.add("sidebar-collapsed");
    }
}


function initToggleSuperFavoritoHomeMarketsEnhanced() {
    const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome');
    const marketsCard = document.getElementById('marketsCard');

    if (!toggleSuperFavoritosHome || !marketsCard) return;

    const savedState = localStorage.getItem('toggleSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleSuperFavoritosHome.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }

    toggleSuperFavoritosHome.addEventListener("change", function() {
        marketsCard.style.display = this.checked ? "block" : "none";
    
        localStorage.setItem('toggleSuperFavoritosHomeState', this.checked);
    });
    
}


function initToggleUnder25MarketsEnhanced() {
    const toggleUnder25 = document.getElementById('toggleUnder25');
    const marketsCard = document.getElementById('ownerBallUnder25MarketsCard');

    if (!toggleUnder25 || !marketsCard) return;

    const savedState = localStorage.getItem('toggleUnder25State');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleUnder25.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }

    toggleUnder25.addEventListener("change", function() {
        marketsCard.style.display = this.checked ? "block" : "none";
    
        localStorage.setItem('toggleUnder25State', this.checked);
    });
    
}


export function restoreToggleState() {
    const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome');
    const marketsCard = document.getElementById('marketsCard');

    if (!toggleSuperFavoritosHome || !marketsCard) return;

    const savedState = localStorage.getItem('toggleSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleSuperFavoritosHome.checked = isChecked;
        marketsCard.style.display = isChecked ? "block": "none";
    }
}


function initToggleMarketsEnhancedOwnerBallSuperFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallSuperFavoritoHome');
    const ownerBallSuperFavoritomarketsCard = document.getElementById('ownerBallSuperFavoritoMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallSuperFavoritomarketsCard) return;

    const savedState = localStorage.getItem('toggleOwnerBallSuperFavoritosHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallSuperFavoritomarketsCard.style.display = isChecked ? "block": "none";
    }


    toggleOwnerBallSuperFavoritosHome.addEventListener("change", function() {
        ownerBallSuperFavoritomarketsCard.style.display = this.checked ? "block" : "none";
    
        localStorage.setItem('toggleOwnerBallSuperFavoritosHomeState', this.checked);
    });    
}


export function restoreToggleStateOwnerBallSuperFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallSuperFavoritosHomeState');
    const ownerBallMarketsCard = document.getElementById('ownerBallMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallMarketsCard) return;

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

    const savedState = localStorage.getItem('toggleOwnerBallFavoritoHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallSuperFavoritomarketsCard.style.display = isChecked ? "block": "none";
    }

    toggleOwnerBallSuperFavoritosHome.addEventListener("change", function() {
        ownerBallSuperFavoritomarketsCard.style.display = this.checked ? "block" : "none";
    
        localStorage.setItem('toggleOwnerBallFavoritoHomeState', this.checked);
    });
    
}


export function restoreToggleStateOwnerBallFavoritoHome() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallFavoritoHomeState');
    const ownerBallMarketsCard = document.getElementById('ownerBallFavoritoHomeMarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallMarketsCard) return;

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

    const savedState = localStorage.getItem('toggleOwnerBallUnder25State');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallSuperFavoritomarketsCard.style.display = isChecked ? "block": "none";
    }

    toggleOwnerBallSuperFavoritosHome.addEventListener("change", function() {
        ownerBallSuperFavoritomarketsCard.style.display = this.checked ? "block" : "none";
    
        localStorage.setItem('toggleOwnerBallUnder25State', this.checked);
    });
    
}


export function restoreToggleStateOwnerBallUnder25() {
    const toggleOwnerBallSuperFavoritosHome = document.getElementById('toggleOwnerBallUnder25State');
    const ownerBallMarketsCard = document.getElementById('ownerBallUnder25MarketsCard');

    if (!toggleOwnerBallSuperFavoritosHome || !ownerBallMarketsCard) return;

    const savedState = localStorage.getItem('toggleOwnerBallUnder25State');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleOwnerBallSuperFavoritosHome.checked = isChecked;
        ownerBallMarketsCard.style.display = isChecked ? "block": "none";
    }
}


function initToggleMarketsEnhancedFavoritoHome() {
    const toggleFavoritosHome = document.getElementById('toggleFavoritosHome');
    const favoritoHomemarketsCard = document.getElementById('favoritoHomeMarketsCard');

    if (!toggleFavoritosHome || !favoritoHomemarketsCard) return;

    const savedState = localStorage.getItem('toggleFavoritoHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleFavoritosHome.checked = isChecked;
        favoritoHomemarketsCard.style.display = isChecked ? "block": "none";
    }

    toggleFavoritosHome.addEventListener("change", function() {
        favoritoHomemarketsCard.style.display = this.checked ? "block" : "none";
    
        localStorage.setItem('toggleFavoritoHomeState', this.checked);
    });
    
}


export function restoreToggleStateFavoritoHome() {
    const toggleFavoritosHome = document.getElementById('toggleFavoritoHomeState');
    const favoritoHomeMarketsCard = document.getElementById('favoritoHomeMarketsCard');

    if (!toggleFavoritosHome || !favoritoHomeMarketsCard) return;

    const savedState = localStorage.getItem('toggleFavoritoHomeState');

    if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleFavoritosHome.checked = isChecked;
        favoritoHomeMarketsCard.style.display = isChecked ? "block": "none";
    }
}
