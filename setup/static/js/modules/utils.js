/**
 * Módulo de Utilidades - Funções utilitárias usadas em vários módulos
 */

/**
 * Verifica se uma string está em formato válido de data (DD/MM/AAAA)
 * @param {string} dateString - A string de data a ser verificada
 * @returns {boolean} Verdadeiro se válido, falso caso contrário
 */
export function isValidDateFormat(dateString) {
    // Verifica o formato DD/MM/AAAA
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateString);
}

/**
 * Formata e normaliza datas para comparação
 * @param {string} dateString - A string de data a ser formatada
 * @returns {string} String de data formatada
 */
export function formatDateForComparison(dateString) {
    if (!dateString) return '';

    // Remove espaços extras
    dateString = dateString.trim();

    // Verifica se já está no formato esperado DD/MM/AAAA
    if (isValidDateFormat(dateString)) {
        return dateString;
    }

    return dateString;
}

/**
 * Aplica máscara de data no formato DD/MM/AAAA
 * @param {HTMLInputElement} input - O elemento de entrada
 * @returns {string} Valor mascarado
 */
export function applyDateMask(input) {
    let v = input.value;
    v = v.replace(/\D/g, ''); // Remove não-dígitos

    // Aplica a máscara
    if (v.length > 4) {
        // Formata como DD/MM/AAAA
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
    const btnRecusar = btnsAcao.querySelector('#recusar-aposta');
    btnRecusar.disabled = false;    
}
