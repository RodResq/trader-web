
export function setupPredictions() {
    const btnPredictions = document.querySelectorAll('.predictions');

    if(!btnPredictions) return;

    btnPredictions.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const idHome = this.getAttribute("data-home-id")
            const nameHome = this.getAttribute("data-home-name");
            const idAWay = this.getAttribute("data-away-id");
            const nameWay = this.getAttribute("data-away-name");
            const eventDate = this.getAttribute("data-event-date");


            if (!idHome || !nameHome || !idAWay || !nameWay || !eventDate) return;

            console.log('Click em Predictions com idHome e nameHome na data: ', idHome, String(nameHome).toLowerCase(), eventDate);
            console.log('Click em Predictions com idAway e nameAway na data: ', idAWay, String(nameWay).toLowerCase().replace("_", " "), eventDate);

            try {
                //TODO Request para retornar dados da api
            } catch (error) {

            }
            
        });
    });

}