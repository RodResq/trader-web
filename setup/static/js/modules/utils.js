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