export function formatDate(date, locale = 'pt-BR') {
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}