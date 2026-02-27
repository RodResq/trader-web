import { showNotification } from "../notifications.js";

export function setupIA() {
    const btnsIA = document.querySelectorAll('.btn-ia');

    if (!btnsIA || btnsIA.length === 0) return;

    btnsIA.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();

            const teamHome = this.getAttribute("data-home-name");
            const teamAway = this.getAttribute("data-away-name");
            const tournament = this.getAttribute("data-tournament-name");

            if (!teamHome || !teamAway || !tournament) return;

            const teamHomeFormated = _formatName(teamHome);
            const teamAwayFormated = _formatName(teamAway);
            const tournamentFormated = _formatName(tournament);

            console.log('Click em IA com teamHome: ', teamHomeFormated);
            console.log('Click em IA com teamAway: ', teamAwayFormated);
            console.log('Click em IA com tournament: ', tournamentFormated);

            try {
                const data = await fetch('api/v1/ia/analisar-partida', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        team_home: teamHomeFormated,
                        team_away: teamAwayFormated,
                        tournament_name: tournamentFormated,
                    })
                });
                console.log('Retorno Api IA: ', await data.json());
            } catch (error) {
                showNotification(error.message, 'danger');
            }
        });
    });
}

function _formatName(name) {
    return String(name).toLowerCase().replace("_", " ");
}

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}
