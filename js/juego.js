// ============================================
// JUEGO: el motor del mandato
// ============================================

let partidaIniciada = false;
let colaModales = [];

// -----------------------------
// RESET
// -----------------------------

function reiniciarEstadoCompleto() {
    presidente.nombre = "Presidente";
    presidente.anioMandato = 1;
    presidente.anioMaximo = 4;
    presidente.apoyoClubes = 50;
    presidente.prestigioInternacional = 50;
    presidente.dineroEnCaja = Dificultad().cajaInicial;
    presidente.seleccionador = null;
    presidente.varActivo = false;
    presidente.historialDecisiones.length = 0;
    presidente.promesas.length = 0;
    presidente.historial.length = 0;
    presidente.cambios.length = 0;
    presidente.desgasteApoyo = 0;
    presidente.desgastePrestigio = 0;

    estadoLigas.fechaActual = 0;
    estadoLigas.totalFechas = 0;
    estadoLigas.calendarios = {};
    estadoLigas.resultados = {};
    estadoLigas.tablas = {};

    estadoFinanzas.sponsorActual = null;
    estadoFinanzas.ingresosDelAnio = 0;
    estadoFinanzas.egresosDelAnio = 0;
    estadoFinanzas.historial.length = 0;
    estadoFinanzas.eventosDelAnio.length = 0;
    estadoFinanzas.rescates = {};
    estadoFinanzas.rescatesDelAnio = 0;
    estadoFinanzas.nivelDeuda = {};
    estadoFinanzas.libro.length = 0;
    estadoFinanzas.tv = { montoAnual: 5200, venceAnio: 2 };
    estadoFinanzas.prestamos.length = 0;
    estadoFinanzas.presupuesto = { ingresos: 0, egresos: 0 };

    estadoCopaArgentina.anio = 1;
    estadoCopaArgentina.activa = false;
    estadoCopaArgentina.rondaActual = 0;
    estadoCopaArgentina.equiposVivos = [];
    estadoCopaArgentina.bracket = [];

    estadoAsamblea.campana = { usadas: [], efectos: {}, anio: 0 };
    estadoAsamblea.ultima = null;
    estadoAsamblea.historial.length = 0;

    estadoObjetivos.anio = 0;
    estadoObjetivos.lista = [];
    estadoObjetivos.historial.length = 0;

    estadoSeleccion.plantel = [];
    estadoSeleccion.generado = false;
    estadoSeleccion.anioGenerado = 0;

    logrosDesbloqueados = {};

    noticiasHistoricas.length = 0;
    encuestasHistoricas.length = 0;
    eventosHistoricos.length = 0;
    colaEventos.length = 0;
    Object.keys(marcasEventos).forEach(function(k) { delete marcasEventos[k]; });
    incidenciasHistoricas.length = 0;
    historialCopas.length = 0;
    historialContinentales.length = 0;
    ESTADO_RANKING.puesto = 1;
    ESTADO_RANKING.historial.length = 0;
    copaActual = null;

    if (typeof historialAmistosos !== "undefined") historialAmistosos.length = 0;

    Object.keys(designacionesPorFecha).forEach(function(k) { delete designacionesPorFecha[k]; });
    ARBITROS_PRIMERA.forEach(function(a) {
        a.incidencias = 0;
        a.sancionado = false;
        a.fechasSancion = 0;
    });

    colaModales = [];
}

// -----------------------------
// NUEVA PARTIDA
// -----------------------------

function iniciarPartidaNueva(idDificultad) {
    dificultadActual = idDificultad || dificultadActual || "real";
    reiniciarEstadoCompleto();
    reiniciarEstructuraLigas();

    inicializarEquipos();
    inicializarTablas();
    generarTodosLosCalendarios();
    asignarDeudasIniciales();
    reiniciarConsejo();
    reiniciarCampana();
    generarObjetivosAnio();
    generarPlantelSeleccion();
    inicializarHistorialArbitros();

    partidaIniciada = true;
    guardarSnapshot();
    guardarPartida();
    refrescar();
    mostrarIntro();
}

function mostrarIntro() {
    UI.modal({
        id: "intro",
        eyebrow: "Buenos Aires · julio de 2026",
        titulo: "Te toca a vos",
        sub: "La AFA busca rumbo después de Messi.",
        ancho: "ancho",
        cerrable: false,
        cuerpo:
            "<div class='intro-escena'>" +
            "<p><em>Estados Unidos, julio de 2026.</em> La Selección cayó 1-0 en la final del Mundial. Dos días después, " +
            "<strong>Lionel Messi anunció su retiro</strong>: <em>«Me vacié, ya no tengo más para dar»</em>.</p>" +
            "<p><strong>Scaloni</strong> comunicó que no renueva. El ciclo más exitoso de la historia reciente se cierra y la AFA " +
            "entra en crisis: los clubes desconfían, la prensa especula y la caja no sobra.</p>" +
            "<p>Asumís como presidente con un mandato de cuatro años, una asamblea que te mira de reojo y una decisión " +
            "que va a definir tu era.</p>" +
            "<label class='campo'><span>¿Cómo te llamás, presidente?</span>" +
            "<input id='input-nombre' type='text' maxlength='22' placeholder='Tu nombre' autocomplete='off'></label>" +
            "</div>",
        pie: [{ texto: "Ver candidatos", accion: "intro-continuar", tipo: "primario" }]
    });
    setTimeout(function() {
        const input = document.getElementById("input-nombre");
        if (input) input.focus();
    }, 140);
}

function continuarIntro() {
    const input = document.getElementById("input-nombre");
    if (input && input.value.trim()) presidente.nombre = input.value.trim();
    UI.cerrar("intro");
    if (typeof sonidoClick === "function") sonidoClick();
    mostrarEleccionDT();
}

// -----------------------------
// ELECCIÓN DE DT
// -----------------------------

function mostrarEleccionDT() {
    const candidatos = CANDIDATOS_DT.map(function(c) {
        return "<button class='candidato' data-accion='elegir-dt' data-id='" + c.id + "'>" +
            "<span class='candidato-foto'>" + htmlFotoDT(c.id, c.nombre, 64) + "</span>" +
            "<span class='candidato-cuerpo'>" +
            "<span class='candidato-perfil'>" + escapar(c.perfil) + "</span>" +
            "<strong class='candidato-nombre'>" + escapar(c.nombre) + "</strong>" +
            "<span class='candidato-desc'>" + escapar(c.descripcion) + "</span>" +
            "<span class='candidato-pie'>" + escapar(c.resumen) + "</span>" +
            "</span></button>";
    }).join("");

    UI.modal({
        id: "dt",
        eyebrow: "Decisión fundacional",
        titulo: "Elegí al DT de la Selección",
        sub: "No se puede deshacer. Cada perfil cambia el prestigio, el apoyo y la fuerza de la Selección.",
        ancho: "ancho",
        cerrable: false,
        cuerpo: "<div class='candidatos'>" + candidatos + "</div>"
    });
}

function elegirDTDeLista(id) {
    const c = CANDIDATOS_DT.filter(function(x) { return x.id === id; })[0];
    if (!c) return;

    if (presidente.dineroEnCaja < c.costo) {
        toastError("No hay caja para pagar ese contrato.");
        return;
    }

    elegirDT(c);
    if (typeof noticiaDeEleccionDT === "function") noticiaDeEleccionDT(c);

    UI.cerrar("dt");
    if (typeof sonidoLogro === "function") sonidoLogro();
    toastExito("<strong>" + escapar(c.nombre) + "</strong> es el nuevo DT", "usuario");
    guardarPartida();
    refrescar();

    setTimeout(mostrarDecisionVAR, 320);
}

function mostrarDecisionVAR() {
    UI.modal({
        id: "var",
        eyebrow: "Primera medida",
        titulo: "¿Activás el VAR?",
        sub: "Reduce a la mitad los errores arbitrales, pero cuesta caro.",
        cuerpo:
            "<p class='modal-parrafo'>Los clubes grandes lo piden. Los chicos temen que el gasto salga de su parte.</p>" +
            "<div class='cifras'>" +
            "<div class='cifra'><span>Activación</span><strong class='neg'>-$2.000M</strong></div>" +
            "<div class='cifra'><span>Mantenimiento</span><strong class='neg'>-$500M / año</strong></div>" +
            "<div class='cifra'><span>Efecto</span><strong class='pos'>−50% errores</strong></div>" +
            "</div>",
        pie: [
            { texto: "Sin VAR por ahora", accion: "var-no", tipo: "fantasma" },
            { texto: "Activar el VAR", accion: "var-si", tipo: "primario" }
        ]
    });
}

function decidirVAR(activar) {
    if (activar) {
        if (!activarVAR()) {
            toastError("No hay caja suficiente para activar el VAR.");
            return;
        }
        noticiaDeVAR(true);
    } else {
        noticiaDeVAR(false);
    }
    UI.cerrar("var");
    guardarPartida();
    refrescar();
    setTimeout(mostrarEleccionSponsor, 300);
}

// -----------------------------
// SPONSOR
// -----------------------------

function mostrarEleccionSponsor() {
    const ofertas = generarOfertasSponsors();
    const cards = ofertas.map(function(s, i) {
        return "<button class='sponsor-card' data-accion='elegir-sponsor' data-idx='" + i + "'>" +
            "<span class='sponsor-logo'>" + htmlLogoSponsor(s.id, s.nombre, 60) + "</span>" +
            "<strong>" + escapar(s.nombre) + "</strong>" +
            "<span class='sponsor-rubro'>" + escapar(s.rubro) + " · " + escapar(s.popularidad) + "</span>" +
            "<span class='sponsor-monto'>" + fmt.plata(s.montoBase) + " por año</span>" +
            "<span class='sponsor-bonus'>+" + fmt.plata(s.bonusPrestigio) + " si el prestigio llega a 60</span>" +
            "</button>";
    }).join("");

    window._ofertasSponsor = ofertas;

    UI.modal({
        id: "sponsors",
        eyebrow: "Año " + presidente.anioMandato,
        titulo: "Sponsor principal",
        sub: "Contrato por dos años. El bonus se cobra por fecha si el prestigio acompaña.",
        ancho: "ancho",
        cerrable: false,
        cuerpo: "<div class='sponsors'>" + cards + "</div>"
    });
}

function elegirSponsor(idx) {
    const ofertas = window._ofertasSponsor || [];
    const s = ofertas[idx];
    if (!s) return;
    firmarSponsor(s);
    UI.cerrar("sponsors");
    window._ofertasSponsor = null;
    guardarPartida();
    refrescar();
    setTimeout(drenarModales, 260);
}

// -----------------------------
// AVANZAR FECHA
// -----------------------------

function avanzarFecha() {
    if (!partidaIniciada) return;
    if (UI.hayModal()) return;
    if (estadoLigas.fechaActual >= estadoLigas.totalFechas) return;

    const clasico = buscarClasicoSinArbitro();
    if (clasico) {
        mostrarModalDesignacion(clasico);
        return;
    }
    ejecutarFecha();
}

function buscarClasicoSinArbitro() {
    const ligaId = "primera";
    const numeroFecha = estadoLigas.fechaActual;
    const calendario = estadoLigas.calendarios[ligaId];
    if (!calendario || numeroFecha >= calendario.length) return null;
    const fecha = calendario[numeroFecha];
    for (let i = 0; i < fecha.length; i++) {
        const partido = fecha[i];
        if (esClasico(partido.local, partido.visitante)) {
            const clave = clavePartido(ligaId, numeroFecha, i);
            if (!designacionesPorFecha[clave]) {
                return {
                    ligaId: ligaId,
                    numeroFecha: numeroFecha,
                    indicePartido: i,
                    local: EQUIPOS[partido.local],
                    visitante: EQUIPOS[partido.visitante]
                };
            }
        }
    }
    return null;
}

function ejecutarFecha() {
    if (typeof sonidoAvanzar === "function") sonidoAvanzar();

    let incidencia = null;
    try {
        jugarFechaTodasLasLigas();
        procesarFechaFinanciera();
        incidencia = detectarIncidencia();
    } catch (e) {
        console.error("Error simulando la fecha", e);
    }

    actualizarConsejoFecha();
    desgasteNatural();
    guardarSnapshot();
    revisarLogros();

    const total = estadoLigas.totalFechas;
    const fechasAmistoso = [Math.round(total * 0.2), Math.round(total * 0.4), Math.round(total * 0.6), Math.round(total * 0.8)];
    if (fechasAmistoso.indexOf(estadoLigas.fechaActual) !== -1 && presidente.seleccionador) {
        try { simularAmistoso(); } catch (e) { console.error(e); }
        actualizarConsejoFecha();
    }

    if (estadoLigas.fechaActual > 0 && estadoLigas.fechaActual % 12 === 0) {
        generarEncuesta();
        toastInfo("Nueva encuesta de opinión publicada", "grafico");
    }

    if (estadoLigas.fechaActual > 0 && estadoLigas.fechaActual % 18 === 0) {
        colaModales.push({ tipo: "conferencia", datos: generarConferencia() });
    }

    if (estadoLigas.fechaActual > 0 && estadoLigas.fechaActual % 10 === 0 && probabilidad(0.8 * Dificultad().agresividad)) {
        colaModales.push({ tipo: "evento", datos: generarEvento() });
    }

    if (estadoLigas.fechaActual > 0 && estadoLigas.fechaActual % 6 === 0) {
        const decision = proximaDecision();
        if (decision) colaModales.push({ tipo: "decision", datos: decision });
    }

    if (incidencia) colaModales.unshift({ tipo: "incidencia", datos: incidencia });

    if (puedeCensura()) colaModales.push({ tipo: "censura", datos: null });

    guardarPartida();
    refrescar();

    if (estadoLigas.fechaActual >= estadoLigas.totalFechas) {
        setTimeout(finDeAnio, 420);
        return;
    }

    setTimeout(drenarModales, 300);
}

function detectarIncidencia() {
    const resultados = estadoLigas.resultados.primera;
    if (!resultados || !resultados.length) return null;
    const ultima = resultados[resultados.length - 1];
    const calendario = estadoLigas.calendarios.primera;
    const numero = estadoLigas.fechaActual - 1;
    const fecha = calendario[numero];
    if (!fecha) return null;
    for (let i = 0; i < ultima.length; i++) {
        const r = ultima[i];
        if (!r.incidencia) continue;
        const partido = fecha[i];
        if (partido && esClasico(partido.local, partido.visitante)) {
            return { incidencia: r.incidencia, partido: { local: r.local, visitante: r.visitante } };
        }
    }
    return null;
}

// -----------------------------
// COLA DE MODALES
// -----------------------------

function drenarModales() {
    if (!colaModales.length) return;
    if (UI.hayModal()) return;
    const item = colaModales.shift();
    if (item.tipo === "decision") mostrarDecision(item.datos);
    else if (item.tipo === "evento") mostrarEvento(item.datos);
    else if (item.tipo === "conferencia") mostrarConferenciaPrensa(item.datos);
    else if (item.tipo === "incidencia") mostrarIncidencia(item.datos);
    else if (item.tipo === "censura") mostrarCensura();
}

// -----------------------------
// DECISIONES
// -----------------------------

function proximaDecision() {
    const usadas = presidente.historialDecisiones.map(function(d) { return d.id; });
    return obtenerDecisionDisponible(usadas);
}

function mostrarDecision(decision) {
    const opciones = decision.opciones.map(function(op, i) {
        return "<button class='opcion' data-accion='decidir' data-idx='" + i + "'>" +
            "<span class='opcion-marca'>" + String.fromCharCode(65 + i) + "</span>" +
            "<span class='opcion-cuerpo'>" +
            "<span class='opcion-titulo'>" + escapar(op.texto) + "</span>" +
            (op.resumen ? "<span class='opcion-resumen'>" + parsearResumen(op.resumen) + "</span>" : "") +
            "</span></button>";
    }).join("");

    window._decisionActiva = decision;

    UI.modal({
        id: "decision",
        eyebrow: categoriaLegible(decision.categoria),
        titulo: decision.titulo,
        sub: decision.descripcion,
        cuerpo: "<div class='opciones'>" + opciones + "</div>",
        cerrable: false
    });
}

function parsearResumen(resumen) {
    const seguro = escapar(resumen);
    return seguro
        .replace(/\+\$?(\d[\d.]*)\s?M/g, "<span class='tag verde'>+$$1M</span>")
        .replace(/-\$?(\d[\d.]*)\s?M/g, "<span class='tag rojo'>−$$1M</span>")
        .replace(/\+(\d+)\s*(apoyo|prestigio)/gi, "<span class='tag verde'>+$1 $2</span>")
        .replace(/(^|\s)-(\d+)\s*(apoyo|prestigio)/gi, "$1<span class='tag rojo'>−$2 $3</span>");
}

function categoriaLegible(cat) {
    const mapa = {
        institucional: "Decisión institucional",
        deportiva: "Decisión deportiva",
        deportivo: "Decisión deportiva",
        economica: "Decisión económica",
        economico: "Decisión económica",
        federal: "Decisión federal",
        mediatica: "Decisión mediática",
        seleccion: "Selección"
    };
    return mapa[cat] || "Decisión de gestión";
}

function decidirOpcion(idx) {
    const decision = window._decisionActiva;
    if (!decision) return;
    const op = decision.opciones[idx];
    if (!op) return;

    const antes = {
        apoyo: presidente.apoyoClubes,
        prestigio: presidente.prestigioInternacional,
        dinero: presidente.dineroEnCaja
    };

    try { op.efecto(); } catch (e) { console.error("Error aplicando decisión", e); }

    const deltas = {
        apoyo: presidente.apoyoClubes - antes.apoyo,
        prestigio: presidente.prestigioInternacional - antes.prestigio,
        dinero: presidente.dineroEnCaja - antes.dinero,
        categoria: decision.categoria === "institucional" ? 3 : 1
    };

    registrarDecision(decision, op);
    reaccionConsejo(decision, deltas);
    if (typeof noticiaDeDecision === "function") noticiaDeDecision(decision.titulo, op.texto);

    UI.cerrar("decision");
    window._decisionActiva = null;
    if (typeof sonidoDecision === "function") sonidoDecision();

    revisarLogros();
    guardarPartida();
    refrescar();
    setTimeout(drenarModales, 260);
}

// -----------------------------
// EVENTOS
// -----------------------------

function mostrarEvento(evento) {
    window._eventoActivo = evento;

    if (evento.automatico) {
        try { evento.efecto(); } catch (e) {}
        registrarEvento(evento, "Automático");
        UI.modal({
            id: "evento",
            eyebrow: "Noticia de último momento",
            titulo: evento.titulo,
            sub: evento.descripcion || "",
            cuerpo: evento.resultado ? "<p class='modal-parrafo'>" + escapar(evento.resultado) + "</p>" : "",
            pie: [{ texto: "Continuar", accion: "cerrar-evento", tipo: "primario" }]
        });
        return;
    }

    const opciones = (evento.opciones || []).map(function(op, i) {
        return "<button class='opcion' data-accion='resolver-evento' data-idx='" + i + "'>" +
            "<span class='opcion-marca'>" + String.fromCharCode(65 + i) + "</span>" +
            "<span class='opcion-cuerpo'>" +
            "<span class='opcion-titulo'>" + escapar(op.texto) + "</span>" +
            (op.resumen ? "<span class='opcion-resumen'>" + parsearResumen(op.resumen) + "</span>" : "") +
            "</span></button>";
    }).join("");

    UI.modal({
        id: "evento",
        eyebrow: "Te toca decidir",
        titulo: evento.titulo,
        sub: evento.descripcion || "",
        cuerpo: "<div class='opciones'>" + opciones + "</div>",
        cerrable: false
    });
}

function resolverEvento(idx) {
    const evento = window._eventoActivo;
    if (!evento) return;
    const op = evento.opciones[idx];
    if (!op) return;
    try { op.efecto(); } catch (e) { console.error(e); }
    registrarEvento(evento, op.texto);
    
    window._eventoActivo = null;
    UI.cerrar("evento");
    guardarPartida();
    refrescar();
    revisarLogros();
    setTimeout(drenarModales, 240);
}

function cerrarEvento() {
    window._eventoActivo = null;
    UI.cerrar("evento");
    refrescar();
    setTimeout(drenarModales, 200);
}

// -----------------------------
// INCIDENCIA ARBITRAL
// -----------------------------

function mostrarIncidencia(datos) {
    const inc = datos.incidencia;
    window._incidenciaActiva = datos;
    const opciones = [
        { texto: "Sancionar al árbitro", resumen: "+3 apoyo, +2 prestigio, -$200M" },
        { texto: "Defenderlo públicamente", resumen: "-4 apoyo, -3 prestigio" },
        { texto: "Pedir disculpas institucionales", resumen: "+2 prestigio, -1 apoyo" }
    ].map(function(op, i) {
        return "<button class='opcion' data-accion='resolver-incidencia' data-idx='" + i + "'>" +
            "<span class='opcion-marca'>" + String.fromCharCode(65 + i) + "</span>" +
            "<span class='opcion-cuerpo'><span class='opcion-titulo'>" + op.texto + "</span>" +
            "<span class='opcion-resumen'>" + parsearResumen(op.resumen) + "</span></span></button>";
    }).join("");

    UI.modal({
        id: "incidencia",
        eyebrow: "Escándalo arbitral",
        titulo: "Polémica en el clásico",
        sub: (inc.titulo || "El árbitro quedó en el ojo de la tormenta.") + " · " + datos.partido.local + " vs " + datos.partido.visitante,
        cuerpo: "<div class='opciones'>" + opciones + "</div>",
        cerrable: false
    });
}

function resolverIncidencia(idx) {
    const datos = window._incidenciaActiva;
    if (!datos) return;
    if (idx === 0) {
        ajustarApoyo(3, "Sanción al árbitro");
        ajustarPrestigio(2, "Sanción al árbitro");
        ajustarDinero(-200, "Investigación arbitral");
    } else if (idx === 1) {
        ajustarApoyo(-4, "Defender al árbitro");
        ajustarPrestigio(-3, "Defender al árbitro");
    } else {
        ajustarPrestigio(2, "Disculpas institucionales");
        ajustarApoyo(-1, "Disculpas institucionales");
    }
    window._incidenciaActiva = null;
    UI.cerrar("incidencia");
    refrescar();
    setTimeout(drenarModales, 240);
}

// -----------------------------
// CENSURA
// -----------------------------

function mostrarCensura() {
    UI.modal({
        id: "censura",
        eyebrow: "Moción de censura",
        titulo: "El consejo pide una asamblea anticipada",
        sub: "La confianza cayó demasiado. Se vota tu continuidad ahora mismo.",
        cerrable: false,
        cuerpo: "<p class='modal-parrafo'>Si perdés la votación, tu mandato termina hoy. Si ganás, el consejo te da una " +
            "segunda oportunidad y recuperás algo de confianza.</p>",
        pie: [{ texto: "Enfrentar la asamblea", accion: "censura-votar", tipo: "primario" }]
    });
}

function resolverCensura() {
    UI.cerrar("censura");
    const resultado = resolverEleccion();
    if (resultado.gana) {
        ajustarConfianzaTodos(14, "Sobreviviste a la censura");
        toastExito("Ganaste la moción con " + Math.round(resultado.pct * 100) + "% de los votos", "consejo");
        guardarPartida();
        refrescar();
    } else {
        terminarMandato(resultado, "censura");
    }
}

// -----------------------------
// FIN DE AÑO
// -----------------------------

function finDeAnio() {
    if (presidente.anioMandato === 1 || presidente.anioMandato === 3) {
        try { simularCopa(); } catch (e) { console.error(e); }
        if (copaActual && copaActual.posicionArgentina === "campeon" && typeof sonidoLogro === "function") sonidoLogro();
    }
    try { simularContinentales(); } catch (e) { console.error(e); }

    empeorarDeudasAlCierre();
    cobrarIngresosAnuales();
    cobrarEgresosAnuales();
    cerrarAnioFinanciero();

    const resultadosObjetivos = evaluarObjetivos();
    const eleccion = resolverEleccion();

    revisarLogros();
    guardarPartida();
    refrescar();

    mostrarCierreDeAnio(resultadosObjetivos, eleccion);
}

function mostrarCierreDeAnio(objetivos, eleccion) {
    const balance = estadoFinanzas.historial[estadoFinanzas.historial.length - 1] || { ingresos: 0, egresos: 0, balance: 0 };
    const conf = ConfianzaConsejo();
    const gana = eleccion.gana;
    const ultimoAnio = presidente.anioMandato >= presidente.anioMaximo;

    const objetivosHTML = objetivos.map(function(r) {
        return "<div class='objetivo-fila " + (r.cumplido ? "ok" : "fallo") + "'>" +
            "<span class='objetivo-marca'>" + (r.cumplido ? icono("check", "", 14) : icono("cruz", "", 14)) + "</span>" +
            "<span class='crecer'>" + escapar(r.obj.titulo) + "</span>" +
            "<span class='mini tenue'>" + Math.round(r.progreso * 100) + "%</span></div>";
    }).join("");

    const cuerpo =
        "<div class='cierre-grid'>" +
        "<div class='cierre-bloque'>" +
        "<h4>Balance del año</h4>" +
        "<div class='metrica-fila'><span>Ingresos</span><strong class='pos'>" + fmt.plata(balance.ingresos) + "</strong></div>" +
        "<div class='metrica-fila'><span>Egresos</span><strong class='neg'>" + fmt.plata(-balance.egresos) + "</strong></div>" +
        "<div class='metrica-fila'><span>Resultado</span><strong class='" + (balance.balance >= 0 ? "pos" : "neg") + "'>" + fmt.plata(balance.balance) + "</strong></div>" +
        "<div class='metrica-fila'><span>Caja final</span><strong>" + fmt.plata(presidente.dineroEnCaja) + "</strong></div>" +
        "</div>" +
        "<div class='cierre-bloque'>" +
        "<h4>Objetivos del consejo</h4>" + objetivosHTML +
        "<div class='metrica-fila'><span>Confianza del consejo</span><strong>" + conf + " / 100</strong></div>" +
        "</div>" +
        "</div>" +
        "<div class='asamblea-resultado " + (gana ? "gana" : "pierde") + "'>" +
        "<div class='asamblea-resultado-num'>" + Math.round(eleccion.pct * 100) + "%</div>" +
        "<div class='crecer'>" +
        "<strong>" + (gana ? "La asamblea te ratifica" : "La asamblea te dio la espalda") + "</strong>" +
        "<div class='mini tenue'>" + eleccion.si + " votos a favor · " + eleccion.no + " en contra · " + eleccion.abstencion + " abstenciones</div>" +
        "</div></div>";

    UI.modal({
        id: "cierre",
        eyebrow: "Fin del año " + presidente.anioMandato,
        titulo: gana ? (ultimoAnio ? "Mandato completo" : "Reelegido") : "Mandato terminado",
        sub: gana
            ? (ultimoAnio ? "Terminaste los " + presidente.anioMaximo + " años de gestión. Es hora del balance final." : "El consejo y los clubes te dan otro año.")
            : "Los clubes perdieron la confianza en tu gestión.",
        ancho: "ancho",
        cerrable: false,
        cuerpo: cuerpo,
        pie: gana
            ? (ultimoAnio
                ? [{ texto: "Ver mi legado", accion: "terminar-mandato", tipo: "primario" }]
                : [{ texto: "Comenzar el año " + (presidente.anioMandato + 1), accion: "nueva-temporada", tipo: "primario" }])
            : [{ texto: "Ver mi legado", accion: "terminar-mandato", tipo: "primario" }]
    });
}

function nuevaTemporada() {
    UI.cerrar("cierre");
    aplicarAscensosYDescensos();

    estadoLigas.fechaActual = 0;
    estadoLigas.resultados = {};
    estadoLigas.calendarios = {};
    estadoLigas.tablas = {};
    estadoCopaArgentina.anio = presidente.anioMandato + 1;
    estadoCopaArgentina.activa = false;
    estadoCopaArgentina.rondaActual = 0;
    estadoCopaArgentina.equiposVivos = [];
    estadoCopaArgentina.bracket = [];
    if (typeof historialAmistosos !== "undefined") historialAmistosos.length = 0;

    resetearLigasParaNuevaTemporada();
    inicializarTablas();
    generarTodosLosCalendarios();

    presidente.anioMandato++;
    reiniciarCampana();
    generarObjetivosAnio();
    estadoFinanzas.rescatesDelAnio = 0;

    guardarSnapshot();
    guardarPartida();
    refrescar();

    toastExito("Año " + presidente.anioMandato + " en marcha", "calendario");

    if (sponsorVencido()) setTimeout(mostrarEleccionSponsor, 600);
    else if (tvVencida()) setTimeout(mostrarRenovacionTV, 600);
}

function mostrarRenovacionTV() {
    UI.modal({
        id: "tv",
        eyebrow: "Contrato de televisión",
        titulo: "Se vence el contrato de TV",
        sub: "Actual: " + fmt.plata(estadoFinanzas.tv.montoAnual) + " por año. Elegí cómo renegociar.",
        cuerpo:
            "<p class='modal-parrafo'>La TV es el 60% de los ingresos de la AFA. Una mala decisión te condiciona dos años.</p>" +
            "<div class='opciones'>" +
            "<button class='opcion' data-accion='renovar-tv' data-op='seguro'><span class='opcion-marca'>A</span><span class='opcion-cuerpo'>" +
            "<span class='opcion-titulo'>Renovar con la misma empresa</span><span class='opcion-resumen'>+6% asegurado. Sin riesgo, sin gloria.</span></span></button>" +
            "<button class='opcion' data-accion='renovar-tv' data-op='abierto'><span class='opcion-marca'>B</span><span class='opcion-cuerpo'>" +
            "<span class='opcion-titulo'>Licitación abierta</span><span class='opcion-resumen'>55% de chances de +32%; si sale mal, −12%.</span></span></button>" +
            "<button class='opcion' data-accion='renovar-tv' data-op='plataforma'><span class='opcion-marca'>C</span><span class='opcion-cuerpo'>" +
            "<span class='opcion-titulo'>Plataforma de streaming</span><span class='opcion-resumen'>+18% y modernidad, pero −4 de apoyo.</span></span></button>" +
            "</div>",
        cerrable: false
    });
}

function elegirRenovacionTV(opcion) {
    const mensaje = renovarTV(opcion);
    UI.cerrar("tv");
    toastInfo(mensaje, "dinero");
    guardarPartida();
    refrescar();
}

function terminarMandato(eleccion, motivo) {
    const puntos = puntajeLegado();
    const rango = rangoLegado(puntos);
    UI.cerrarTodo();

    UI.modal({
        id: "legado",
        eyebrow: "Fin de la partida",
        titulo: "Tu mandato terminó",
        sub: motivo === "censura" ? "Una moción de censura puso fin a tu gestión." :
            motivo === "completo" ? "Cumpliste los " + presidente.anioMaximo + " años de mandato." :
            "La asamblea no te renovó el mandato.",
        ancho: "ancho",
        cerrable: false,
        cuerpo:
            "<div class='legado-final'>" +
            "<div class='legado-puntos'><span>" + puntos + "</span><small>puntos de legado</small></div>" +
            "<div class='legado-rango' style='color:" + rango.color + "'>" + rango.nombre + "</div>" +
            "<p class='tenue centro'>" + rango.desc + "</p>" +
            "<div class='legado-datos'>" +
            "<div><span>Años</span><strong>" + presidente.anioMandato + "</strong></div>" +
            "<div><span>Apoyo final</span><strong>" + presidente.apoyoClubes + "</strong></div>" +
            "<div><span>Prestigio</span><strong>" + presidente.prestigioInternacional + "</strong></div>" +
            "<div><span>Logros</span><strong>" + cantidadLogros() + " / " + LOGROS.length + "</strong></div>" +
            "</div></div>",
        pie: [
            { texto: "Ver logros", accion: "ir-legado", tipo: "fantasma" },
            { texto: "Nueva partida", accion: "reiniciar-partida", tipo: "primario" }
        ]
    });
    partidaIniciada = false;
    // El mandato terminó: que recargar no reviva la partida en el cierre.
    if (typeof CLAVE_AUTO !== "undefined") Almacen.borrar(CLAVE_AUTO);
}

// -----------------------------
// ACCIONES DEL JUGADOR
// -----------------------------

function accionRescatar(id) {
    if (UI.hayModal()) return;
    const r = rescatarClub(id);
    if (!r.exito) { toastError(r.motivo); return; }
    toastExito(r.mensajePolitico, "escudo");
    refrescar();
    guardarPartida();
}

function accionPedirPrestamo(monto) {
    const r = pedirPrestamo(monto);
    if (!r.ok) { toastError(r.motivo); return; }
    toastExito("Préstamo acreditado: " + fmt.plata(monto), "dinero");
    refrescar();
    guardarPartida();
}

function accionCampana(id) {
    const r = aplicarAccionCampana(id);
    if (!r.ok) { toastError(r.motivo); return; }
    toastExito("Campaña: <strong>" + escapar(r.accion.nombre) + "</strong>", "consejo");
    refrescar();
    guardarPartida();
}

function accionRenunciar() {
    UI.modal({
        id: "renuncia",
        eyebrow: "Confirmación",
        titulo: "¿Renunciar al mandato?",
        sub: "Se termina la partida y se calcula tu legado.",
        cuerpo: "<p class='modal-parrafo'>No se puede deshacer.</p>",
        pie: [
            { texto: "Seguir jugando", accion: "cerrar-modal", tipo: "fantasma" },
            { texto: "Renunciar", accion: "confirmar-renuncia", tipo: "peligro" }
        ]
    });
}

function confirmarRenuncia() {
    UI.cerrar("renuncia");
    terminarMandato({ pct: 0, si: 0, no: 0, abstencion: 0 }, "censura");
}

// -----------------------------
// ARRANQUE
// -----------------------------

function arrancarJuego() {
    if (hayPartidaGuardada()) {
        mostrarBienvenida(infoPartidaGuardada());
    } else {
        iniciarPartidaNueva();
    }
}

