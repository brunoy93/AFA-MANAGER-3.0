// ============================================
// GUARDADO 3.0: autoguardado, 3 ranuras y export
// ============================================

const CLAVE_AUTO = "afa_manager_auto_v3";
const CLAVE_SLOT = "afa_manager_slot_v3_";
const VERSION_PARTIDA = 3;

const SLOTS = [1, 2, 3];

// -----------------------------
// SERIALIZACIÓN
// -----------------------------

function serializarPartida() {
    return {
        version: VERSION_PARTIDA,
        fechaGuardado: ahora(),
        dificultad: dificultadActual,
        presidente: {
            nombre: presidente.nombre,
            anioMandato: presidente.anioMandato,
            anioMaximo: presidente.anioMaximo,
            apoyoClubes: presidente.apoyoClubes,
            prestigioInternacional: presidente.prestigioInternacional,
            dineroEnCaja: presidente.dineroEnCaja,
            seleccionador: presidente.seleccionador,
            varActivo: presidente.varActivo,
            historialDecisiones: presidente.historialDecisiones,
            promesas: presidente.promesas,
            historial: presidente.historial,
            cambios: presidente.cambios,
            desgasteApoyo: presidente.desgasteApoyo,
            desgastePrestigio: presidente.desgastePrestigio
        },
        estadoLigas: {
            fechaActual: estadoLigas.fechaActual,
            totalFechas: estadoLigas.totalFechas,
            calendarios: estadoLigas.calendarios,
            resultados: estadoLigas.resultados,
            tablas: estadoLigas.tablas
        },
        equipos: EQUIPOS,
        proximoIdEquipo: typeof proximoIdEquipo !== "undefined" ? proximoIdEquipo : 104,
        ligasEstructura: {
            primera: LIGAS.primera.equipos.slice(),
            nacional: LIGAS.nacional.equipos.slice(),
            federalA: LIGAS.federalA.equipos.slice()
        },
        estadoFinanzas: estadoFinanzas,
        consejo: miembrosConsejo,
        asamblea: estadoAsamblea,
        objetivos: estadoObjetivos,
        logros: logrosDesbloqueados,
        copaActual: copaActual,
        historialCopas: historialCopas,
        historialContinentales: historialContinentales,
        ranking: ESTADO_RANKING,
        noticias: noticiasHistoricas,
        encuestas: encuestasHistoricas,
        eventos: eventosHistoricos,
        incidencias: incidenciasHistoricas,
        designaciones: designacionesPorFecha,
        arbitros: ARBITROS_PRIMERA,
        copaArgentina: estadoCopaArgentina,
        historialAmistosos: typeof historialAmistosos !== "undefined" ? historialAmistosos : [],
        seleccion: estadoSeleccion,
        sonido: typeof sonidoActivo !== "undefined" ? sonidoActivo : true
    };
}

function aplicarPartida(datos) {
    if (!datos || !datos.presidente) return false;

    dificultadActual = datos.dificultad || "real";

    Object.assign(presidente, datos.presidente);
    presidente.historialDecisiones = datos.presidente.historialDecisiones || [];
    presidente.promesas = datos.presidente.promesas || [];
    presidente.historial = datos.presidente.historial || [];
    presidente.cambios = datos.presidente.cambios || [];

    // Equipos
    Object.keys(EQUIPOS).forEach(function(id) { delete EQUIPOS[id]; });
    Object.keys(datos.equipos || {}).forEach(function(id) { EQUIPOS[id] = datos.equipos[id]; });
    if (typeof proximoIdEquipo !== "undefined" && datos.proximoIdEquipo) proximoIdEquipo = datos.proximoIdEquipo;

    if (datos.ligasEstructura) {
        ["primera", "nacional", "federalA"].forEach(function(k) {
            if (datos.ligasEstructura[k]) {
                LIGAS[k].equipos.length = 0;
                datos.ligasEstructura[k].forEach(function(id) { LIGAS[k].equipos.push(id); });
            }
        });
    }

    Object.assign(estadoLigas, datos.estadoLigas || {});

    Object.assign(estadoFinanzas, datos.estadoFinanzas || {});
    estadoFinanzas.libro = (datos.estadoFinanzas && datos.estadoFinanzas.libro) || [];
    estadoFinanzas.prestamos = (datos.estadoFinanzas && datos.estadoFinanzas.prestamos) || [];

    miembrosConsejo = datos.consejo || [];
    if (!miembrosConsejo.length) reiniciarConsejo();

    Object.assign(estadoAsamblea, datos.asamblea || {});
    Object.assign(estadoObjetivos, datos.objetivos || {});
    logrosDesbloqueados = datos.logros || {};

    copaActual = datos.copaActual || null;
    historialCopas.length = 0;
    (datos.historialCopas || []).forEach(function(c) { historialCopas.push(c); });
    historialContinentales.length = 0;
    (datos.historialContinentales || []).forEach(function(c) { historialContinentales.push(c); });

    Object.assign(ESTADO_RANKING, datos.ranking || { puesto: 1, historial: [] });

    noticiasHistoricas.length = 0;
    (datos.noticias || []).forEach(function(n) { noticiasHistoricas.push(n); });
    encuestasHistoricas.length = 0;
    (datos.encuestas || []).forEach(function(n) { encuestasHistoricas.push(n); });
    eventosHistoricos.length = 0;
    (datos.eventos || []).forEach(function(n) { eventosHistoricos.push(n); });
    incidenciasHistoricas.length = 0;
    (datos.incidencias || []).forEach(function(n) { incidenciasHistoricas.push(n); });

    Object.keys(designacionesPorFecha).forEach(function(k) { delete designacionesPorFecha[k]; });
    Object.keys(datos.designaciones || {}).forEach(function(k) { designacionesPorFecha[k] = datos.designaciones[k]; });

    if (datos.arbitros && datos.arbitros.length) {
        ARBITROS_PRIMERA.length = 0;
        datos.arbitros.forEach(function(a) { ARBITROS_PRIMERA.push(a); });
    }

    Object.assign(estadoCopaArgentina, datos.copaArgentina || {});

    if (typeof historialAmistosos !== "undefined") {
        historialAmistosos.length = 0;
        (datos.historialAmistosos || []).forEach(function(h) { historialAmistosos.push(h); });
    }

    if (datos.seleccion && datos.seleccion.plantel && datos.seleccion.plantel.length) {
        estadoSeleccion.plantel = datos.seleccion.plantel;
        estadoSeleccion.generado = true;
        estadoSeleccion.anioGenerado = datos.seleccion.anioGenerado || 1;
    }
    return true;
}

// -----------------------------
// GUARDAR / CARGAR
// -----------------------------

function guardarPartida() {
    try {
        const datos = serializarPartida();
        localStorage.setItem(CLAVE_AUTO, JSON.stringify(datos));
        return true;
    } catch (e) {
        console.warn("No se pudo guardar", e);
        return false;
    }
}

function hayPartidaGuardada() {
    return !!Almacen.leer(CLAVE_AUTO);
}

function infoPartidaGuardada() {
    const datos = Almacen.leer(CLAVE_AUTO);
    if (!datos) return null;
    return {
        anio: datos.presidente.anioMandato,
        fecha: datos.estadoLigas.fechaActual,
        dt: datos.presidente.seleccionador,
        fechaGuardado: datos.fechaGuardado,
        dificultad: datos.dificultad
    };
}

function cargarPartida() {
    const datos = Almacen.leer(CLAVE_AUTO);
    if (!datos) return false;
    return aplicarPartida(datos);
}

function borrarPartida() {
    Almacen.borrar(CLAVE_AUTO);
    SLOTS.forEach(function(s) { Almacen.borrar(CLAVE_SLOT + s); });
}

// -----------------------------
// RANURAS
// -----------------------------

function listarSlots() {
    return SLOTS.map(function(slot) {
        const datos = Almacen.leer(CLAVE_SLOT + slot);
        return {
            slot: slot,
            datos: datos ? {
                anio: datos.presidente.anioMandato,
                fecha: datos.estadoLigas.fechaActual,
                fechaGuardado: datos.fechaGuardado,
                dt: datos.presidente.seleccionador
            } : null
        };
    });
}

function guardarPartidaSlot(slot) {
    if (SLOTS.indexOf(Number(slot)) === -1) return false;
    Almacen.escribir(CLAVE_SLOT + slot, serializarPartida());
    return true;
}

function cargarPartidaSlot(slot) {
    const datos = Almacen.leer(CLAVE_SLOT + slot);
    if (!datos) return false;
    return aplicarPartida(datos);
}

function borrarPartidaSlot(slot) {
    Almacen.borrar(CLAVE_SLOT + slot);
}

// Autoguardado de seguridad
setInterval(function() {
    if (typeof partidaIniciada !== "undefined" && partidaIniciada) guardarPartida();
}, 45000);
