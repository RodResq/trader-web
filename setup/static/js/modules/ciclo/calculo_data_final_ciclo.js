export function calcularDataFinalCiclo() {
    const categoriaSelect = document.getElementById('id_categoria');
    const dataIniciaInput = document.getElementById('id_data_inicial');
    const dataFinalInput = document.getElementById('id_data_final');

    function calculoDataFinal() {
        const dataInicial = new Date(dataIniciaInput.value);
        if (!dataInicial || isNaN(dataInicial)) return;

        const categoria = categoriaSelect.value;
        let dias = 0;

        switch (categoria) {
            case 'S': dias = 7; break;
            case 'Q': dias = 15; break;
            case 'M': dias = 30; break;
        }

        const dataFinal = new Date(dataInicial);
        dataFinal.setDate(dataInicial.getDate() + dias);

        const ano = dataFinal.getFullYear();
        const mes = String(dataFinal.getMonth() + 1).padStart(2, '0');
        const dia = String(dataFinal.getDate()).padStart(2, '0');
        dataFinalInput.value = `${ano}-${mes}-${dia}`;

    }
    categoriaSelect.addEventListener('change', calculoDataFinal);
    dataIniciaInput.addEventListener('change', calculoDataFinal);

    if (dataIniciaInput.value) {
        calculoDataFinal();
    }
};
