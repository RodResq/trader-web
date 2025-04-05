/**
 * Script para controle do Dashboard
 * Este arquivo gerencia as interações do usuário na página do dashboard
 */
document.addEventListener("DOMContentLoaded", function () {
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-collapsed");
    
        // Para dispositivos móveis
        if (window.innerWidth < 768) {
          document.body.classList.toggle("sidebar-active");
        }
      });
  }

  // Inicialização para dispositivos móveis
  if (window.innerWidth < 768) {
    document.body.classList.add("sidebar-collapsed");
  }

  const toggleSuperFavoritosHome = document.getElementById('toggleSuperFavoritosHome')
  const marketsCard = document.getElementById('marketsCard');

  if (toggleSuperFavoritosHome && marketsCard) {
      toggleSuperFavoritosHome.addEventListener("change", function () {
        if (this.checked) {
          marketsCard.style.display = "block";
        } else {
          marketsCard.style.display = "none";
        }
      });
    
    }

    if (!toggleSuperFavoritosHome.checked) {
      marketsCard.style.display = "none";
    }

});
