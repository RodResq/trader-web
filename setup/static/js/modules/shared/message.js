

export function showMensagem(message, type) {

    if (!message || !type) return;

    const iconMessage = (type) => {
        if (type == 'success') {
            return `
                <i class="bi bi-check-circle-fill me-2"></i>
            `;
        } else if (type == 'warnning' || type == 'error') {
            return `
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
            `;
        } else {
            return `<i class="bi bi-info-circle-fill me-2"></i>`;
        }
    }

    const span = document.createElement('span');
    span.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${iconMessage(type)}
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    const cycleTitle = document.querySelector('.alert-message');
    cycleTitle.appendChild(span);
    
    setTimeout(() => {
        span.classList.remove('show');
        setTimeout(() => span.remove(), 300);
    }, 3000);

}
