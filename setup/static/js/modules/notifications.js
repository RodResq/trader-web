/**
 * Módulo de Notificações - Gerencia notificações toast
 */

/**
 * Exibe uma mensagem de notificação
 * @param {string} message - A mensagem a ser exibida
 * @param {string} type - O tipo de notificação (success, danger, warning, etc.)
 */
export function showNotification(message, type) {
    // Verifica se o container de notificação já existe
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1050';
        document.body.appendChild(notificationContainer);
    }
    
    // Cria notificação
    const notification = document.createElement('div');
    notification.classList.add('toast', 'show', `bg-${type}`, 'text-white');
    notification.role = 'alert';
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    
    // Conteúdo da notificação
    notification.innerHTML = `
    <div class="toast-header bg-${type} text-white">
        <strong class="me-auto">Notificação</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
        ${message}
    </div>
    `;
    
    // Adiciona ao container
    notificationContainer.appendChild(notification);
    
    // Remove após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 5000);
    
    // Configura o botão de fechar
    const closeButton = notification.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    });
}