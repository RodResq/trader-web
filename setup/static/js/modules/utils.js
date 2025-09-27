
export function isValidDateFormat(dateString) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateString);
}

export function formatDateForComparison(dateString) {
    if (!dateString) return '';

    dateString = dateString.trim();
    if (isValidDateFormat(dateString)) {
        return dateString;
    }
    return dateString;
}

export function applyDateMask(input) {
    let v = input.value;
    v = v.replace(/\D/g, ''); 

    if (v.length > 4) {
        v = v.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
    }

    input.value = v;

    return v;
}

export function desabilitarBtnAceitar(row) {
    const btnAceitar = row.querySelector('.apostar-btn');
    if (btnAceitar) {
        btnAceitar.classList.remove('btn-success');
        btnAceitar.classList.add('btn-secondary');
        btnAceitar.disabled = true;
    }

    abilitarBtnRecusar(row);
    abilitarBtnDesfazer(row);
}

export function desabilitarBtnRecusar(row) {
    const btnRecusar = row.querySelector('.recusar-btn');
    if (btnRecusar) {
        btnRecusar.classList.remove('btn-danger');
        btnRecusar.classList.add('btn-secondary');
        btnRecusar.disabled = true;
    }

    abilitarBtnAceitar(row);
    abilitarBtnDesfazer(row);
}

export function desabilitarBtnDesfazer(row) {
    const btnDesfazer = row.querySelector('.desfazer-acao-btn');
    if (btnDesfazer) {
        btnDesfazer.classList.remove('btn-warning');
        btnDesfazer.classList.add('btn-secondary');
        btnDesfazer.disabled = true;
    }

    abilitarBtnAceitar(row);
    abilitarBtnRecusar(row);
}

export function abilitarBtnAceitar(row) {
    const btnsAcao = row.querySelector('td:nth-child(7)');
    if (btnsAcao) {
        const btnAceitar = btnsAcao.querySelector('#aceitar-aposta');
        if (btnAceitar) {
            btnAceitar.classList.remove('btn-secondary')
            btnAceitar.classList.add('btn-success');
            btnAceitar.disabled = false;
        }
    }
}

export function abilitarBtnDesfazer(row) {
    const btnsAcao = row.querySelector('td:nth-child(7)');
    const btnDesfazer = btnsAcao.querySelector('#desfazer-acao');
    btnDesfazer.classList.remove('btn-secondary')
    btnDesfazer.classList.add('btn-warning');
    btnDesfazer.disabled = false;    
}


export function abilitarBtnRecusar(row) {
    const btnsAcao = row.querySelector('td:nth-child(7)');
    if (btnsAcao) {
        const btnRecusar = btnsAcao.querySelector('.recusar-btn');
        if (btnRecusar) {
            btnRecusar.classList.remove('btn-secondary');
            btnRecusar.classList.add('btn-danger')
            btnRecusar.disabled = false;    
        }
    }
}

export function showSpinner(container) {
    if (container) {
        const overlay = _createSpinnerOverlay();
        container.style.position = 'relative';
        container.appendChild(overlay);

        function  _createSpinnerOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'spinner-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: transparent;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                border-radius: 0.375rem;
            `;
            
            overlay.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-secondary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <div class="mt-2 text-muted">
                        <small>Atualizando dados...</small>
                    </div>
                </div>
            `;
            
            return overlay;
        }
    }
}

export function hideSpinner(container) {
    if (container) {
        const overlay = container.querySelector('.spinner-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}
