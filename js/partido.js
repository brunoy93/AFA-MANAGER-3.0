// ============================================
// PARTIDO: simulación de un partido individual
// ============================================
// Usa distribución de Poisson para generar goles realistas.
// El árbitro se aplica DESPUÉS, desde liga.js, para mantener
// este módulo puro (solo simula el resultado base).

function simularPartido(equipoLocal, equipoVisitante) {
    const dif = equipoLocal.fuerza - equipoVisitante.fuerza;

    // Goles esperados según diferencia de fuerzas
    const espLocal = Math.max(0.2, 1.3 + dif / 25);
    const espVisitante = Math.max(0.2, 1.3 - dif / 25);

    const golesLocal = poisson(espLocal);
    const golesVisitante = poisson(espVisitante);

    return {
        local: equipoLocal.nombre,
        visitante: equipoVisitante.nombre,
        localId: equipoLocal.id,
        visitanteId: equipoVisitante.id,
        golesLocal: golesLocal,
        golesVisitante: golesVisitante,
        incidencia: null
    };
}

// Distribución de Poisson (para goles realistas)
function poisson(lambda) {
    if (lambda <= 0) return 0;
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}