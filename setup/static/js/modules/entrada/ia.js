import { showNotification } from "../notifications.js";

export function setupIA() {
    const btnsIA = document.querySelectorAll('.btn-ia');

    if (!btnsIA || btnsIA.length === 0) return;

    btnsIA.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();

            const idEvent = this.getAttribute("data-event-id");
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
                        id_event: idEvent,
                        team_home: teamHomeFormated,
                        team_away: teamAwayFormated,
                        tournament_name: tournamentFormated,
                    })
                });
                const response = await data.json();
                atualizarProbabilidadesIA(idEvent, response, teamHomeFormated, teamAwayFormated);
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

function atualizarProbabilidadesIA(idEvent, response, teamHomeFormated, teamAwayFormated) {
    const entradaCell = document.querySelector(`.cell-ia-${idEvent}`);
    if (!entradaCell) return;
    entradaCell.querySelector('.ia-probabilities-home').innerHTML = converterParaPorcentagem(response['probabilidades_vitoria'][teamHomeFormated]);
    entradaCell.querySelector('.ia-probabilities-draw').innerHTML = converterParaPorcentagem(response['probabilidades_vitoria']['empate']);
    entradaCell.querySelector('.ia-probabilities-away').innerHTML = converterParaPorcentagem(response['probabilidades_vitoria'][teamAwayFormated]);
}

function converterParaPorcentagem(numero) {
    if (!numero) return '0%';   
    if (numero.length > 1) 
        numero = numero / 100;
    return (numero * 100).toFixed(2) + '%';
}
