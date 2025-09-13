
export function initCycleOwnerBall() {
    const modal = document.getElementById('modalCycleOwnerBall');
    const btnNewCycle = document.getElementById('btnNewCycleOwnerBall');
    const btnSaveCycle = document.getElementById('btnSaveCycleOwnerBall')

    if (!btnNewCycle) return;

    btnNewCycle.addEventListener('click', function(e) {
        e.preventDefault();
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    });

    btnSaveCycle.addEventListener('click', saveCycle);

    async function saveCycle() {
       const category = document.getElementById('categoryCycleOwnerBall');
       const valueSelectedCategory = category ? category.value: null;
       const period = document.getElementById('inputPeriodCycleOwnerBall');
       console.log('Periodo Selecionado OB: ', period.value)
       
       

    }
}