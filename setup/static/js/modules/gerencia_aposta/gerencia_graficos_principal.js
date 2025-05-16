/**
 * Script principal para gráficos na tela de gerência
 */
import { initGerenciaGraficos } from './gerencia_graficos.js';

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos de desempenho se estivermos na página de gerência
    if (document.getElementById('graficoDesempenhoSemanal') || document.getElementById('graficoDesempenhoMensal')) {
        initGerenciaGraficos();
    }
});
