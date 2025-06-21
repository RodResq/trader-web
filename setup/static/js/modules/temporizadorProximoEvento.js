const dataEvento = new Date();
dataEvento.setHours(dataEvento.getHours() + 2);

export function setupTemporizadorProximoEvento() {
    recuperarDataHoraProximoEvento()
    atualizarTemporizador();

    const intervaloTemporizador = setInterval(atualizarTemporizador, 1000);

}

function recuperarDataHoraProximoEvento() {
    // TODO Implementar
}


function atualizarTemporizador() {
    const agora = new Date().getTime();
    const tempoEvento = dataEvento.getTime();
    const diferenca = tempoEvento - agora;

    if (diferenca < 0) {
        document.getElementById('temporizador').innerHTML = "00:00:00";
        document.querySelector('.text-success').textContent = "Evento Finalizado";
        document.querySelector('.text-success').classList.remove('text-success');
        document.querySelector('.text-uppercase').classList.add('text-danger');
        clearInterval(intervaloTemporizador);
        return;
    }

    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    const horasFormatadas = horas.toString().padStart(2, '0');
    const minutosFormatados = minutos.toString().padStart(2, '0');
    const segundosFormatados = segundos.toString().padStart(2, '0');

    document.getElementById('temporizador').innerHTML = 
        `${horasFormatadas}:${minutosFormatados}:${segundosFormatados}`;

    const elementoTempo = document.getElementById('temporizador');
    const totalMinutos = Math.floor(diferenca / (1000 * 60));

    if (totalMinutos <= 5) {
        elementoTempo.className = 'fs-4 text-danger';
    } else if (totalMinutos <= 30) {
        elementoTempo.className = 'fs-4 text-warning';
    } else {
        elementoTempo.className = 'fs-4 text-gray-300';
    }
}