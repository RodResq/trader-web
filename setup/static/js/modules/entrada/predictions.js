
export function setupPredictions() {
    const btnPredictions = document.querySelectorAll('.predictions');

    if(!btnPredictions) return;

    btnPredictions.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Click em Predictions...');
            
        });
    });

}