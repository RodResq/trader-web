import { showNotification } from "../notifications.js";
import { apiClient } from "../shared/apiClient.js";

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
            console.log('Click em Predictions com idHome e nameHome na data: ', _formatTeamName(nameHome), eventDate);
            console.log('Click em Predictions com idAway e nameAway na data: ', idAWay, _formatTeamName(nameAWay), eventDate);

            const nameHomeFormated = _formatTeamName(nameHome);
            const nameAwayFormated = _formatTeamName(nameAWay);

            const url = `/predictions?idHome=${idHome}&nameHome=${nameHomeFormated}&idAway=${idAWay}&nameAway=${nameAwayFormated}&country=${country}&date=${eventDate}`;
            try {
               const data = await apiClient.get(url);
               console.log('Retorno Api Predictions: ', data);
                
            } catch (error) {
                showNotification(error.message, 'danger');
            }
            
        });
    });

}

function _formatTeamName(teamName) {
    return String(teamName).toLowerCase().replace("_", " ");
}