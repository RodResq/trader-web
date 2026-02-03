
export function setupPredictions() {
    const btnPredictions = document.querySelectorAll('.predictions');

    if(!btnPredictions) return;

    btnPredictions.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const idEvent = this.getAttribute("data-event-id");
            const idHome = this.getAttribute("data-home-id")
            const nameHome = this.getAttribute("data-home-name");
            const idAWay = this.getAttribute("data-away-id");
            const nameAWay = this.getAttribute("data-away-name");
            const eventDate = this.getAttribute("data-event-date");
            const country = this.getAttribute("data-event-country");

            if (!idEvent || !idHome || !nameHome || !idAWay || !nameAWay || !eventDate) return;

            console.log('Click em Predictions com event ID: ', idEvent);
            console.log('Click em Predictions com country: ', String(country).toLowerCase());
            console.log('Click em Predictions com idHome e nameHome na data: ', idHome, String(nameHome).toLowerCase(), eventDate);
            console.log('Click em Predictions com idAway e nameAway na data: ', idAWay, String(nameAWay).toLowerCase().replace("_", " "), eventDate);

            try {
                
            } catch (error) {

            }
            
        });
    });

}