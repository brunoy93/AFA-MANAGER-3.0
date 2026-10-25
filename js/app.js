// ============================================
// APP: shell, navegación, modales y acciones
// ============================================

window.__errores = [];
window.addEventListener("error", function(e) {
    window.__errores.push((e.message || "error") + " @ " + (e.filename || "").split("/").pop() + ":" + e.lineno);
});
window.addEventListener("unhandledrejection", function(e) {
    window.__errores.push("promesa: " + (e.reason && e.reason.message ? e.reason.message : e.reason));
});

const PANTALLAS = [
    { id: "escritorio", nombre: "Escritorio", icono: "casa" },
    { id: "consejo", nombre: "Consejo", icono: "consejo" },
    { id: "clubes", nombre: "Clubes", icono: "escudo" },
    { id: "copas", nombre: "Copas", icono: "trofeo" },
    { id: "seleccion", nombre: "Selección", icono: "bandera" },
    { id: "arbitros", nombre: "Árbitros", icono: "balanza" },
    { id: "finanzas", nombre: "Finanzas", icono: "dinero" },
    { id: "prensa", nombre: "Prensa", icono: "diario" },
    { id: "legado", nombre: "Legado", icono: "medalla" }
];

const estadoUI = {
    pantalla: "escritorio",
    liga: "primera",
    fechaVisor: null,
    filtroNoticias: "todas"
};

// -----------------------------
// MODALES
// -----------------------------

const UI = {
    contador: 0,
    ultimoFoco: null,

    modal: function(opciones) {
        const opt = opciones || {};
        const id = opt.id || ("m" + (++UI.contador));
        UI.cerrar(id, true);

        const capa = document.getElementById("capa-modales");
        if (!capa) return null;

        const wrapper = document.createElement("div");
        wrapper.className = "modal";
        wrapper.id = "modal-" + id;
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-modal", "true");

        const pie = (opt.pie || []).map(function(b) {
            const clase = b.tipo === "primario" ? "btn-primario" : b.tipo === "peligro" ? "btn-peligro" : b.tipo === "fantasma" ? "btn-fantasma" : "btn";
            const alto = b.tipo === "primario" ? "" : "";
            return "<button class='" + clase + "' data-accion='" + b.accion + "' " +
                (b.datos ? Object.keys(b.datos).map(function(k) { return "data-" + k + "='" + escapar(b.datos[k]) + "'"; }).join(" ") : "") +
                ">" + escapar(b.texto) + "</button>";
        }).join("");

        wrapper.innerHTML =
            "<div class='modal-fondo' data-accion='cerrar-modal' data-id='" + id + "'></div>" +
            "<div class='modal-caja' data-ancho='" + (opt.ancho || "") + "'>" +
            (opt.cerrable ? "<button class='modal-cerrar' data-accion='cerrar-modal' data-id='" + id + "' aria-label='Cerrar'>" + icono("cruz", "", 16) + "</button>" : "") +
            "<div class='modal-cab'>" +
            (opt.eyebrow ? "<span class='eyebrow'>" + opt.eyebrow + "</span>" : "") +
            "<h3 class='modal-titulo'>" + (opt.titulo || "") + "</h3>" +
            (opt.sub ? "<p class='modal-sub'>" + opt.sub + "</p>" : "") +
            "</div>" +
            "<div class='modal-cuerpo'>" + (opt.cuerpo || "") + "</div>" +
            (pie ? "<div class='modal-pie'>" + pie + "</div>" : "") +
            "</div>";

        document.body.classList.add("con-modal");
        capa.appendChild(wrapper);

        const foco = wrapper.querySelector("button, input, [tabindex]");
        if (foco) setTimeout(function() { try { foco.focus(); } catch (e) {} }, 60);

        return { id: id, el: wrapper };
    },

    cerrar: function(id, silencioso) {
        const el = document.getElementById("modal-" + id);
        if (!el) return;
        el.remove();
        if (!document.querySelector("#capa-modales .modal")) {
            document.body.classList.remove("con-modal");
        }
        if (!silencioso && typeof drenarModales === "function") {
            setTimeout(drenarModales, 220);
        }
    },

    cerrarTodo: function() {
        const capa = document.getElementById("capa-modales");
        if (capa) capa.innerHTML = "";
        document.body.classList.remove("con-modal");
    },

    hayModal: function() {
        return !!document.querySelector("#capa-modales .modal");
    },

    modalAbierto: function(id) {
        return !!document.getElementById("modal-" + id);
    }
};

// -----------------------------
// RENDER
// -----------------------------

function refrescar() {
    actualizarShell();
    renderizarPantalla();
}

function renderizarPantalla() {
    const vista = document.getElementById("vista");
    if (!vista) return;

    const nombre = estadoUI.pantalla;
    const render = window["vista" + nombre.charAt(0).toUpperCase() + nombre.slice(1)];
    const html = typeof render === "function" ? render() : "<div class='pantalla'><div class='vacio'>Pantalla no disponible</div></div>";
    vista.innerHTML = html;

    const pantalla = PANTALLAS.filter(function(p) { return p.id === nombre; })[0];
    const eyebrow = document.getElementById("topbar-eyebrow");
    const titulo = document.getElementById("topbar-titulo");
    if (eyebrow) eyebrow.textContent = pantalla ? pantalla.nombre : "AFA Manager";
    if (titulo) {
        titulo.textContent = estadoLigas.fechaActual >= estadoLigas.totalFechas
            ? "Temporada terminada"
            : "Fecha " + Math.min(estadoLigas.fechaActual + 1, estadoLigas.totalFechas) + " de " + estadoLigas.totalFechas;
    }

    window.scrollTo({ top: 0, behavior: reduceMovimiento ? "auto" : "smooth" });
}

function actualizarShell() {
    // Riel
    const nav = document.getElementById("riel-nav");
    if (nav) {
        nav.innerHTML = PANTALLAS.map(function(p) {
            const pendientes = p.id === "consejo" && ConfianzaConsejo() < 40 ? "<span class='nav-punto'></span>" : "";
            return "<button class='nav-item " + (estadoUI.pantalla === p.id ? "activo" : "") + "' data-accion='nav' data-pantalla='" + p.id + "'>" +
                icono(p.icono, "", 18) + "<span>" + p.nombre + "</span>" + pendientes + "</button>";
        }).join("");
    }

    const mandato = document.getElementById("riel-mandato");
    if (mandato) {
        const conf = ConfianzaConsejo();
        const estadoC = estadoConfianza(conf);
        const avance = Math.round(((estadoLigas.fechaActual) / Math.max(1, estadoLigas.totalFechas)) * 100);
        mandato.innerHTML =
            "<div class='rm-fila'><span class='rm-anio'>Año " + presidente.anioMandato + "<span> / " + presidente.anioMaximo + "</span></span>" +
            "<span class='rm-etapa'>Mandato</span></div>" +
            "<div class='progreso' style='margin-top:10px'><span style='width:" + avance + "%'></span></div>" +
            "<div class='rm-sub'><span>Fecha " + (estadoLigas.fechaActual + 1) + "/" + estadoLigas.totalFechas + "</span>" +
            "<span style='color:" + estadoC.color + "'>" + estadoC.etiqueta + "</span></div>";
    }

    // Logo
    const logoRiel = document.getElementById("riel-logo");
    if (logoRiel) logoRiel.innerHTML = logoAFA(34);
    const logoTop = document.getElementById("topbar-logo");
    if (logoTop) logoTop.innerHTML = logoAFA(28);

    // KPIs
    const kpis = document.getElementById("kpis");
    if (kpis) {
        const tonoApoyo = presidente.apoyoClubes >= 55 ? "verde" : presidente.apoyoClubes >= 40 ? "oro" : "rojo";
        const estadoC = estadoConfianza();
        kpis.innerHTML =
            kpi("consejo", "Apoyo", presidente.apoyoClubes, tonoApoyo) +
            kpi("estrella", "Prestigio", presidente.prestigioInternacional, presidente.prestigioInternacional >= 55 ? "azul" : "oro") +
            kpi("dinero", "Caja", fmt.plata(presidente.dineroEnCaja), presidente.dineroEnCaja >= 6000 ? "verde" : "rojo", true) +
            kpi("consejo", "Consejo", ConfianzaConsejo(), estadoC.nivel === "blindado" || estadoC.nivel === "fuerte" ? "verde" : estadoC.nivel === "estable" ? "oro" : "rojo");
    }

    // Fecha del botón
    const fechaBtn = document.getElementById("btn-avanzar-fecha");
    if (fechaBtn) fechaBtn.textContent = "Fecha " + (estadoLigas.fechaActual + 1);

    const btn = document.getElementById("btn-avanzar");
    if (btn) {
        const fin = estadoLigas.fechaActual >= estadoLigas.totalFechas;
        btn.disabled = fin || !partidaIniciada;
        btn.title = fin ? "La temporada terminó" : "Jugar la próxima fecha";
        btn.querySelector(".btn-primario-texto").textContent = fin ? "Temporada terminada" : "Avanzar fecha";
    }

    // Tabbar mobile
    const tabbar = document.getElementById("tabbar");
    if (tabbar) {
        const principales = ["escritorio", "clubes", "copas", "seleccion"];
        tabbar.innerHTML = "<div class='tabbar-fila'>" +
            principales.map(function(id) {
                const p = PANTALLAS.filter(function(x) { return x.id === id; })[0];
                return "<button class='tab " + (estadoUI.pantalla === id ? "activo" : "") + "' data-accion='nav' data-pantalla='" + id + "'>" +
                    icono(p.icono, "", 21) + "<span>" + p.nombre + "</span></button>";
            }).join("") +
            "<button class='tab " + (principales.indexOf(estadoUI.pantalla) === -1 ? "activo" : "") + "' data-accion='abrir-mas'>" +
            icono("cuadricula", "", 21) + "<span>Más</span></button>" +
            "</div>";
    }

    // Badge bandeja
    const badge = document.getElementById("badge-bandeja");
    const pendientes = (typeof colaModales !== "undefined" ? colaModales.length : 0);
    if (badge) {
        badge.hidden = pendientes === 0;
        badge.textContent = pendientes;
    }

    const btnBandeja = document.getElementById("btn-bandeja");
    if (btnBandeja) btnBandeja.innerHTML = icono("sobre", "", 19) + (pendientes ? "<span class='badge'>" + pendientes + "</span>" : "");

    const btnSonido = document.getElementById("btn-sonido");
    if (btnSonido) {
        const activo = typeof sonidoActivo !== "undefined" ? sonidoActivo : true;
        btnSonido.innerHTML = icono(activo ? "volumen" : "mudo", "", 19);
        btnSonido.classList.toggle("activo", !!activo);
    }

    const btnAjustes = document.getElementById("btn-ajustes");
    if (btnAjustes) btnAjustes.innerHTML = icono("ajustes", "", 19);
    const btnAyuda = document.getElementById("btn-ayuda");
    if (btnAyuda) btnAyuda.innerHTML = icono("info", "", 19);
}

function kpi(iconoNombre, etiqueta, valor, tono, esPlata) {
    const texto = esPlata ? valor : (typeof valor === "number" ? fmt.num(valor) : valor);
    return "<div class='kpi' data-tono='" + tono + "'>" +
        "<span class='kpi-ico'>" + icono(iconoNombre, "", 16) + "</span>" +
        "<span class='kpi-txt'><small>" + etiqueta + "</small><strong>" + texto + "</strong></span>" +
        "</div>";
}

// -----------------------------
// NAVEGACIÓN
// -----------------------------

function navegar(id) {
    if (!PANTALLAS.some(function(p) { return p.id === id; })) return;
    estadoUI.pantalla = id;
    if (id === "clubes" && estadoUI.fechaVisor == null) estadoUI.fechaVisor = Math.max(0, estadoLigas.fechaActual - 1);
    if (typeof sonidoPestania === "function") sonidoPestania();
    UI.cerrarTodo();
    refrescar();
}

function abrirMas() {
    const resto = PANTALLAS.filter(function(p) { return ["escritorio", "clubes", "copas", "seleccion"].indexOf(p.id) === -1; });
    UI.modal({
        id: "mas",
        titulo: "Más secciones",
        cerrable: true,
        cuerpo: "<div class='menu-mas'>" + resto.map(function(p) {
            return "<button class='menu-mas-item' data-accion='nav' data-pantalla='" + p.id + "'>" +
                icono(p.icono, "", 20) + "<span>" + p.nombre + "</span>" + icono("derecha", "tenue", 16) + "</button>";
        }).join("") +
            "<button class='menu-mas-item' data-accion='abrir-ajustes'>" + icono("ajustes", "", 20) + "<span>Ajustes y partidas</span>" + icono("derecha", "tenue", 16) + "</button>" +
            "<button class='menu-mas-item' data-accion='abrir-ayuda'>" + icono("info", "", 20) + "<span>Cómo se juega</span>" + icono("derecha", "tenue", 16) + "</button>" +
            "</div>"
    });
}

// -----------------------------
// ACCIONES
// -----------------------------

function manejarAccion(accion, datos, evento) {
    switch (accion) {
        case "nav": navegar(datos.pantalla); break;
        case "avanzar": avanzarFecha(); break;
        case "cerrar-modal": UI.cerrar(datos.id); break;
        case "intro-continuar": continuarIntro(); break;
        case "elegir-dt": elegirDTDeLista(datos.id); break;
        case "var-si": decidirVAR(true); break;
        case "var-no": decidirVAR(false); break;
        case "elegir-sponsor": elegirSponsor(Number(datos.idx)); break;
        case "decidir": decidirOpcion(Number(datos.idx)); break;
        case "resolver-evento": resolverEvento(Number(datos.idx)); break;
        case "cerrar-evento": cerrarEvento(); break;
        case "resolver-incidencia": resolverIncidencia(Number(datos.idx)); break;
        case "censura-votar": resolverCensura(); break;
        case "nueva-temporada": nuevaTemporada(); break;
        case "terminar-mandato": {
            const ultima = estadoAsamblea.ultima || {};
            const completo = ultima.gana && presidente.anioMandato >= presidente.anioMaximo;
            terminarMandato(ultima, completo ? "completo" : "asamblea");
            break;
        }
        case "renovar-tv": elegirRenovacionTV(datos.op); break;
        case "reiniciar-partida": confirmarNuevaPartida(); break;
        case "nueva-partida": confirmarNuevaPartida(); break;
        case "nueva-partida-ok": empezarPartidaNueva(); break;
        case "ir-legado": navegar("legado"); break;
        case "rescatar": accionRescatar(Number(datos.id)); break;
        case "prestamo": accionPedirPrestamo(Number(datos.monto)); break;
        case "campana": accionCampana(datos.id); break;
        case "renunciar": accionRenunciar(); break;
        case "confirmar-renuncia": confirmarRenuncia(); break;
        case "club": mostrarFichaClub(Number(datos.id)); break;
        case "arbitro": mostrarPerfilArbitro(datos.id); break;
        case "tab-liga": estadoUI.liga = datos.liga; estadoUI.fechaVisor = Math.max(0, estadoLigas.fechaActual - 1); refrescar(); break;
        case "tab-copa": estadoUI.copaTab = datos.tab; refrescar(); break;
        case "designar-arbitro": designarArbitro(Number(datos.id)); break;
        case "responder-prensa": responderPrensa(Number(datos.pregunta), Number(datos.idx)); break;
        case "fecha-mover": moverVisorFecha(Number(datos.delta)); break;
        case "fecha-hoy": estadoUI.fechaVisor = Math.max(0, estadoLigas.fechaActual - 1); refrescar(); break;
        case "abrir-mas": abrirMas(); break;
        case "abrir-ajustes": abrirAjustes(); break;
        case "abrir-ayuda": abrirAyuda(); break;
        case "abrir-bandeja": abrirBandeja(); break;
        case "continuar-partida": continuarPartida(); break;
        case "nueva-desde-cero": nuevaDesdeCero(); break;
        case "guardar-ahora": guardarPartida(); toastExito("Partida guardada", "guardar"); break;
        case "toggle-sonido": if (typeof toggleMute === "function") { toggleMute(); actualizarShell(); } break;
        case "slots": abrirSlots(); break;
        case "cargar-slot": cargarSlot(Number(datos.slot)); break;
        case "borrar-slot": borrarSlot(Number(datos.slot)); break;
        case "ir-pantalla": navegar(datos.pantalla); break;
        case "ver-historial": abrirHistorialDecisiones(); break;
        case "ver-plantel": abrirPlantel(); break;
        case "perfil-consejero": mostrarPerfilConsejero(datos.id); break;
        case "pedir-prestamo": abrirPrestamo(); break;
        case "conf-prestamo": accionPedirPrestamo(Number(datos.monto)); UI.cerrar("prestamo"); break;
        case "toggle-dificultad": cambiarDificultad(datos.id); refrescar(); break;
        case "exportar": exportarPartida(); break;
        case "importar": importarPartida(); break;
        default: console.warn("Acción desconocida", accion);
    }
}

document.addEventListener("click", function(e) {
    const objetivo = e.target.closest("[data-accion]");
    if (!objetivo) return;
    if (objetivo.tagName === "BUTTON" && objetivo.disabled) return;
    e.preventDefault();
    manejarAccion(objetivo.dataset.accion, objetivo.dataset, e);
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        const modales = document.querySelectorAll("#capa-modales .modal");
        if (modales.length) {
            const ultimo = modales[modales.length - 1];
            const id = ultimo.id.replace("modal-", "");
            const cerrable = !!ultimo.querySelector(".modal-cerrar") || !!ultimo.querySelector("[data-accion='cerrar-modal']");
            if (cerrable) UI.cerrar(id);
        }
    }
    if (e.key === "a" && !e.ctrlKey && !e.metaKey && !UI.hayModal()) avanzarFecha();
});

// -----------------------------
// BIENVENIDA / GUARDADO
// -----------------------------

function mostrarBienvenida(info) {
    if (!info) { iniciarPartidaNueva(); return; }
    UI.modal({
        id: "bienvenida",
        eyebrow: "Partida guardada",
        titulo: "AFA Manager",
        sub: "Hay una partida en curso.",
        cerrable: false,
        cuerpo:
            "<div class='bienvenida-datos'>" +
            "<div class='metrica-fila'><span>Año</span><strong>" + info.anio + " · Fecha " + (info.fecha + 1) + "</strong></div>" +
            "<div class='metrica-fila'><span>DT</span><strong>" + escapar(info.dt || "—") + "</strong></div>" +
            "<div class='metrica-fila'><span>Guardada</span><strong>" + fechaLegible(info.fechaGuardado) + "</strong></div>" +
            "</div>",
        pie: [
            { texto: "Nueva partida", accion: "nueva-desde-cero", tipo: "fantasma" },
            { texto: "Continuar", accion: "continuar-partida", tipo: "primario" }
        ]
    });
}

function continuarPartida() {
    UI.cerrar("bienvenida");
    const ok = cargarPartida();
    if (!ok) {
        toastError("No se pudo cargar la partida. Empezamos de cero.");
        iniciarPartidaNueva();
        return;
    }
    partidaIniciada = true;
    refrescar();
    toastExito("Partida retomada", "guardar");
}

function nuevaDesdeCero() {
    UI.cerrar("bienvenida");
    abrirAjustes();
}

function abrirAjustes() {
    UI.cerrar("mas");
    const dif = Dificultad();
    const contenido =
        "<h4 class='seccion-mini'>Dificultad</h4>" +
        Object.keys(DIFICULTADES).map(function(id) {
            const d = DIFICULTADES[id];
            return "<button class='opcion-dificultad " + (dificultadActual === id ? "activo" : "") + "' data-accion='toggle-dificultad' data-id='" + id + "'>" +
                "<strong>" + d.nombre + "</strong><span class='mini tenue'>" + d.desc + "</span></button>";
        }).join("") +
        "<h4 class='seccion-mini'>Partida</h4>" +
        "<div class='fila wrap' style='gap:8px;margin-bottom:14px'>" +
        "<button class='btn' data-accion='guardar-ahora'>" + icono("guardar", "", 16) + " Guardar ahora</button>" +
        "<button class='btn' data-accion='slots'>" + icono("lista", "", 16) + " Mis partidas</button>" +
        "<button class='btn' data-accion='exportar'>" + icono("salir", "", 16) + " Exportar</button>" +
        "<button class='btn' data-accion='importar'>" + icono("recargar", "", 16) + " Importar</button>" +
        "</div>" +
        "<h4 class='seccion-mini'>Zona de riesgo</h4>" +
        "<div class='fila wrap' style='gap:8px'>" +
        "<button class='btn-peligro' data-accion='nueva-partida'>Empezar de cero</button>" +
        "<button class='btn-peligro' data-accion='renunciar'>Renunciar al mandato</button>" +
        "</div>" +
        "<p class='mini tenue' style='margin-top:10px'>La dificultad se puede cambiar en cualquier momento, pero no altera lo jugado.</p>";

    UI.modal({ id: "ajustes", titulo: "Ajustes", ancho: "ancho", cerrable: true, cuerpo: contenido });
}

function confirmarNuevaPartida() {
    UI.modal({
        id: "nueva",
        eyebrow: "Confirmación",
        titulo: "¿Empezar una partida nueva?",
        sub: "Se pierde el progreso actual (el autoguardado y las ranuras quedan hasta que guardes otra cosa).",
        cuerpo: "<p class='modal-parrafo'>Vas a elegir dificultad y DT de nuevo.</p>",
        pie: [
            { texto: "Cancelar", accion: "cerrar-modal", datos: { id: "nueva" }, tipo: "fantasma" },
            { texto: "Empezar de cero", accion: "nueva-partida-ok", tipo: "primario" }
        ]
    });
}

function empezarPartidaNueva() {
    UI.cerrarTodo();
    colaModales = [];
    iniciarPartidaNueva(dificultadActual);
}

function abrirAyuda() {
    UI.cerrar("mas");
    UI.modal({
        id: "ayuda",
        titulo: "Cómo se juega",
        ancho: "ancho",
        cerrable: true,
        cuerpo:
            "<div class='ayuda-grid'>" +
            "<div><h4>Sos el presidente</h4><p>Cada fecha se juegan las tres divisiones y la Copa Argentina. Vos tomás las decisiones: " +
            "plata, árbitros, prensa, clubes chicos y Selección.</p></div>" +
            "<div><h4>Cuatro años</h4><p>Al final de cada año la asamblea de clubes vota tu continuidad. Necesitás la mitad de los votos " +
            "(o el umbral que fije la dificultad). Los clubes grandes pesan más.</p></div>" +
            "<div><h4>Los números</h4><p><strong>Apoyo</strong>: clubes. <strong>Prestigio</strong>: imagen internacional. " +
            "<strong>Caja</strong>: plata. <strong>Consejo</strong>: tu mesa chica; si cae por debajo de 30, te pueden pedir una asamblea anticipada.</p></div>" +
            "<div><h4>Atajos</h4><p><strong>A</strong> avanza la fecha. <strong>Esc</strong> cierra el modal.</p></div>" +
            "</div>"
    });
}

function abrirBandeja() {
    const items = [];
    colaModales.forEach(function(m) {
        const titulo = m.tipo === "decision" ? (m.datos.titulo || "Decisión pendiente") :
            m.tipo === "evento" ? (m.datos.titulo || "Evento") :
            m.tipo === "conferencia" ? "Conferencia de prensa" : m.tipo === "censura" ? "Moción de censura" : "Incidencia arbitral";
        items.push("<div class='lista-item'><span class='lista-avatar'>" + icono("sobre", "tenue", 18) + "</span>" +
            "<span class='lista-cuerpo'><span class='lista-titulo'>" + escapar(titulo) + "</span>" +
            "<span class='lista-sub'>Pendiente de resolver</span></span></div>");
    });

    const noticias = noticiasHistoricas.slice(-4).reverse().map(function(n) {
        return "<div class='lista-item'><span class='lista-avatar'>" + icono("diario", "tenue", 18) + "</span>" +
            "<span class='lista-cuerpo'><span class='lista-titulo'>" + escapar(n.titulo) + "</span>" +
            "<span class='lista-sub'>" + escapar(n.medio || "Prensa") + "</span></span></div>";
    });

    UI.modal({
        id: "bandeja",
        eyebrow: "Bandeja de entrada",
        titulo: items.length ? items.length + " asunto" + (items.length > 1 ? "s" : "") + " pendiente" + (items.length > 1 ? "s" : "") : "Todo al día",
        ancho: "ancho",
        cerrable: true,
        cuerpo:
            (items.length ? "<div class='lista'>" + items.join("") + "</div>" : "<div class='vacio'>" + icono("check", "", 28) + "<strong>No hay nada pendiente</strong><p>Avanzá la fecha para que lleguen decisiones.</p></div>") +
            (noticias.length ? "<h4 class='seccion-mini' style='margin-top:16px'>Últimas noticias</h4><div class='lista'>" + noticias.join("") + "</div>" : ""),
        pie: items.length ? [{ texto: "Resolver pendientes", accion: "cerrar-modal", datos: { id: "bandeja" }, tipo: "primario" }] : []
    });
}

function abrirPlantel() {
    const plantel = plantelSeleccion();
    const grupos = ["ARQ", "DEF", "MED", "DEL"];
    const nombres = { ARQ: "Arqueros", DEF: "Defensores", MED: "Mediocampistas", DEL: "Delanteros" };

    const cuerpo = grupos.map(function(g) {
        const jugadores = plantel.filter(function(j) { return j.posicion === g; });
        return "<h4 class='seccion-mini'>" + nombres[g] + " <span class='tenue'>(" + nivelPromedioPosicion(g) + " prom.)</span></h4>" +
            jugadores.map(function(j) {
                return "<div class='lista-item'>" +
                    "<span class='lista-avatar'><span class='pos-badge pos-" + j.posicion.toLowerCase() + "'>" + j.posicion + "</span></span>" +
                    "<span class='lista-cuerpo'><span class='lista-titulo'>" + escapar(j.nombre) +
                    (j.capitan ? " <span class='tag oro'>capitán</span>" : "") + "</span>" +
                    "<span class='lista-sub'>" + escapar(j.club) + " · " + j.edad + " años</span></span>" +
                    "<span class='lista-meta num' style='font-size:17px'>" + j.nivel + "</span></div>";
            }).join("");
    }).join("");

    UI.modal({
        id: "plantel",
        eyebrow: "Selección argentina",
        titulo: "Los 23 de " + (presidente.seleccionador || "la Selección"),
        sub: "Nivel promedio del plantel: " + promedioPlantel(),
        ancho: "ancho",
        cerrable: true,
        cuerpo: cuerpo
    });
}

function abrirHistorialDecisiones() {
    const filas = presidente.historialDecisiones.slice().reverse().map(function(d) {
        return "<div class='lista-item'><span class='lista-avatar'>" + icono("check", "tenue", 16) + "</span>" +
            "<span class='lista-cuerpo'><span class='lista-titulo'>" + escapar(d.decision) + "</span>" +
            "<span class='lista-sub'>" + escapar(d.eleccion) + "</span></span>" +
            "<span class='lista-meta'>Año " + d.anio + " · F" + (d.fecha + 1) + "</span></div>";
    }).join("");

    UI.modal({
        id: "historial",
        titulo: "Decisiones tomadas",
        ancho: "ancho",
        cerrable: true,
        cuerpo: filas ? "<div class='lista'>" + filas + "</div>" : "<div class='vacio'><strong>Todavía no decidiste nada</strong></div>"
    });
}

// -----------------------------
// SIMULANDO
// -----------------------------

function mostrarSimulando() {
    let overlay = document.getElementById("overlay-simulando");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "overlay-simulando";
        overlay.innerHTML = "<div class='simulando-caja'><div class='simulando-spinner'></div><span>Simulando la fecha…</span></div>";
        document.body.appendChild(overlay);
    }
    overlay.classList.remove("oculto");
}

function ocultarSimulando() {
    const overlay = document.getElementById("overlay-simulando");
    if (overlay) overlay.classList.add("oculto");
}

// -----------------------------
// MODALES DE JUEGO (llamados por el motor)
// -----------------------------

function mostrarModalDesignacion(clasico) {
    const arbitros = obtenerArbitrosParaClasico(clasico.ligaId);
    const opciones = arbitros.map(function(a) {
        return "<button class='opcion' data-accion='designar-arbitro' data-id='" + a.id + "'>" +
            "<span class='opcion-marca'>" + icono("balanza", "", 14) + "</span>" +
            "<span class='opcion-cuerpo'><span class='opcion-titulo'>" + escapar(a.nombre) + "</span>" +
            "<span class='opcion-resumen'>Nivel " + a.nivel + " · " + a.estilo + " · confiabilidad " + (a.nivel - (a.incidencias || 0) * 3) + "</span></span></button>";
    }).join("");

    window._clasicoActivo = clasico;

    UI.modal({
        id: "designacion",
        eyebrow: "Designación arbitral",
        titulo: clasico.local.nombre + " vs " + clasico.visitante.nombre,
        sub: "Fecha " + (clasico.numeroFecha + 1) + " · Elegí el árbitro. Un mal juez puede definir el partido y la tapa del diario.",
        ancho: "ancho",
        cerrable: false,
        cuerpo: "<div class='opciones'>" + opciones + "</div>"
    });
}

function designarArbitro(idArbitro) {
    const clasico = window._clasicoActivo;
    if (!clasico) return;
    designarArbitroManual(clasico.ligaId, clasico.numeroFecha, clasico.indicePartido, idArbitro);
    window._clasicoActivo = null;
    UI.cerrar("designacion");
    toastInfo("Árbitro designado para el clásico", "balanza");
    setTimeout(ejecutarFecha, 220);
}

function mostrarConferenciaPrensa(conferencia) {
    if (!conferencia) return;
    const datos = PERSONALIDADES[conferencia.personalidad];
    const preguntas = conferencia.preguntas || [];

    window._conferenciaActiva = { conferencia: conferencia, respondidas: 0, total: preguntas.length };

    const cuerpo =
        "<div class='conf-periodista' style='border-color:" + datos.color + "'>" +
        "<span class='conf-icono' style='color:" + datos.color + "'>" + icono("mensaje", "", 20) + "</span>" +
        "<div><strong>" + datos.nombre + "</strong><div class='mini tenue'>" + datos.estilo + "</div></div>" +
        "</div>" +
        preguntas.map(function(p, idx) {
            return "<div class='conf-pregunta' data-pregunta='" + idx + "'>" +
                "<div class='conf-pregunta-texto'>" + escapar(p.texto) + "</div>" +
                "<div class='conf-opciones'>" +
                p.opciones.map(function(op, i) {
                    return "<button class='conf-opcion' data-accion='responder-prensa' data-pregunta='" + idx + "' data-idx='" + i + "'>" +
                        escapar(op.texto) + "<span class='mini tenue'>" + escapar(op.resumen || "") + "</span></button>";
                }).join("") +
                "</div></div>";
        }).join("");

    UI.modal({
        id: "conferencia",
        eyebrow: "Conferencia de prensa",
        titulo: "Preguntas de " + datos.nombre,
        sub: "Respondé las " + preguntas.length + " preguntas. Cada respuesta deja consecuencias.",
        ancho: "ancho",
        cerrable: false,
        cuerpo: cuerpo
    });
}

function responderPrensa(idxPregunta, idxOpcion) {
    const estado = window._conferenciaActiva;
    if (!estado) return;
    const preguntas = estado.conferencia.preguntas;
    const pregunta = preguntas[idxPregunta];
    if (!pregunta) return;

    const cont = document.querySelector("[data-pregunta='" + idxPregunta + "']");
    if (cont && cont.dataset.respondida === "1") return;

    const op = pregunta.opciones[idxOpcion];
    if (!op) return;
    try { op.efecto(); } catch (e) { console.error(e); }
    if (cont) {
        cont.dataset.respondida = "1";
        cont.querySelectorAll(".conf-opcion").forEach(function(b) {
            b.disabled = true;
            b.style.opacity = ".45";
        });
        const elegido = cont.querySelectorAll(".conf-opcion")[idxOpcion];
        if (elegido) { elegido.style.opacity = "1"; elegido.classList.add("elegida"); }
    }

    estado.respondidas++;
    if (estado.respondidas >= estado.total) {
        registrarConferencia(estado.conferencia.personalidad, estado.respondidas);
        agregarNoticia(PERSONALIDADES[estado.conferencia.personalidad].nombre, "El presidente habló con la prensa",
            "Conferencia de prensa en la AFA. El presidente respondió " + estado.respondidas + " preguntas.", "rumor");
        window._conferenciaActiva = null;
        setTimeout(function() {
            UI.cerrar("conferencia");
            refrescar();
        }, 420);
    }
    refrescar();
}

function mostrarPerfilArbitro(id) {
    const arbitro = ARBITROS_PRIMERA.filter(function(a) { return String(a.id) === String(id); })[0];
    if (!arbitro) return;
    const incidencias = incidenciasHistoricas.filter(function(i) { return i.arbitroId === arbitro.id; });
    const clubes = {};
    incidencias.forEach(function(i) { clubes[i.clubFavorecido] = (clubes[i.clubFavorecido] || 0) + 1; });
    const top = Object.keys(clubes).sort(function(a, b) { return clubes[b] - clubes[a]; }).slice(0, 3);

    UI.modal({
        id: "arbitro-perfil",
        eyebrow: "Legajo arbitral",
        titulo: arbitro.nombre,
        cerrable: true,
        cuerpo:
            "<div class='metrica-fila'><span>Nivel</span><strong>" + arbitro.nivel + " / 100</strong></div>" +
            "<div class='metrica-fila'><span>Estilo</span><strong>" + arbitro.estilo + "</strong></div>" +
            "<div class='metrica-fila'><span>Incidencias</span><strong>" + incidencias.length + "</strong></div>" +
            "<div class='metrica-fila'><span>Sanción</span><strong>" + (arbitro.sancionado ? "Sancionado (" + arbitro.fechasSancion + " fechas)" : "Sin sanción") + "</strong></div>" +
            (top.length ? "<h4 class='seccion-mini'>Clubes con más polémicas</h4>" +
                top.map(function(c) { return "<div class='metrica-fila'><span>" + escapar(c) + "</span><strong>" + clubes[c] + "</strong></div>"; }).join("") : "")
    });
}

function mostrarFichaClub(id) {
    const eq = EQUIPOS[id];
    if (!eq) return;
    const tabla = estadoLigas.tablas[eq.ligaId] ? estadoLigas.tablas[eq.ligaId][id] : null;
    const posicion = estadoLigas.tablas[eq.ligaId]
        ? obtenerTablaOrdenada(eq.ligaId).map(function(e) { return e.id; }).indexOf(Number(id)) + 1
        : null;
    const deuda = estadoFinanzas.nivelDeuda[id];
    const costo = COSTOS_RESCATE[deuda];

    UI.modal({
        id: "club",
        eyebrow: (LIGAS[eq.ligaId] || {}).nombre || "Club",
        titulo: eq.nombre,
        cerrable: true,
        cuerpo:
            "<div class='club-ficha' style='margin-bottom:16px'>" +
            htmlEscudo(eq.id, eq.nombre, 72) +
            "<div><div class='mini tenue'>Peso histórico</div><div class='num' style='font-size:26px'>" + eq.pesoHistorico + "</div></div>" +
            "<div><div class='mini tenue'>Fuerza actual</div><div class='num' style='font-size:26px'>" + Math.round(eq.fuerza || 0) + "</div></div>" +
            "</div>" +
            (tabla ? "<div class='metrica-fila'><span>Posición</span><strong>" + posicion + "° · " + tabla.Pts + " pts</strong></div>" +
                "<div class='metrica-fila'><span>Partidos</span><strong>" + tabla.PJ + " (G" + tabla.G + " E" + tabla.E + " P" + tabla.P + ")</strong></div>" +
                "<div class='metrica-fila'><span>Goles</span><strong>" + tabla.GF + " a favor · " + tabla.GC + " en contra</strong></div>" : "") +
            "<div class='metrica-fila'><span>Situación económica</span><strong class='" + (deuda === "fundido" ? "neg" : deuda ? "oro" : "pos") + "'>" +
            (deuda || "sano") + "</strong></div>" +
            (deuda ? "<button class='btn-suave btn-bloque' style='margin-top:14px' data-accion='rescatar' data-id='" + eq.id + "'>Rescatar al club · " + fmt.plata(costo) + "</button>" : "")
    });
}

function mostrarPerfilConsejero(id) {
    const m = miembrosConsejo.filter(function(x) { return x.id === id; })[0];
    if (!m) return;
    const cambios = m.ultimoCambio ? m.ultimoCambio : null;
    UI.modal({
        id: "consejero",
        eyebrow: m.rol,
        titulo: m.nombre,
        cerrable: true,
        cuerpo:
            "<div class='fila' style='gap:14px;margin-bottom:14px'>" +
            "<span class='consejero-avatar' style='width:56px;height:56px'>" + m.avatar + "</span>" +
            "<div><div class='mini tenue'>Confianza</div><div class='num' style='font-size:30px'>" + Math.round(m.confianza) + "</div></div>" +
            "</div>" +
            "<p class='modal-parrafo'>" + fraseDelConsejero(m) + "</p>" +
            "<div class='metrica-fila'><span>Área</span><strong>" + AREAS_CONSEJO[m.area].nombre + "</strong></div>" +
            "<div class='metrica-fila'><span>Peso en el consejo</span><strong>" + Math.round(m.peso * 100) + "%</strong></div>" +
            (cambios ? "<div class='metrica-fila'><span>Último movimiento</span><strong class='" + (cambios.delta >= 0 ? "pos" : "neg") + "'>" + fmt.delta(cambios.delta) + "</strong></div>" : "")
    });
}

function abrirPrestamo() {
    const max = montoMaximoPrestamo();
    const tasa = Math.round(tasaPrestamo() * 1000) / 10;
    UI.modal({
        id: "prestamo",
        eyebrow: "Crédito del consejo",
        titulo: "Pedir un préstamo",
        sub: "Se devuelve en 12 cuotas por fecha. Tasa actual: " + tasa + "%.",
        cerrable: true,
        cuerpo:
            "<p class='modal-parrafo'>Máximo que te habilitan hoy: <strong>" + fmt.plata(max) + "</strong>. Cada préstamo baja la confianza del tesorero.</p>" +
            "<div class='opciones'>" +
            [1000, 2000, Math.round(max / 500) * 500].filter(function(m, i, arr) { return m <= max && arr.indexOf(m) === i && m > 0; })
                .map(function(m) {
                    return "<button class='opcion' data-accion='conf-prestamo' data-monto='" + m + "'>" +
                        "<span class='opcion-marca'>" + icono("dinero", "", 14) + "</span>" +
                        "<span class='opcion-cuerpo'><span class='opcion-titulo'>" + fmt.plata(m) + "</span>" +
                        "<span class='opcion-resumen'>Cuota estimada " + fmt.plata(m * (1 + tasaPrestamo()) / 12) + " por fecha</span></span></button>";
                }).join("") +
            "</div>"
    });
}

// -----------------------------
// SLOTS / EXPORT
// -----------------------------

function abrirSlots() {
    const slots = listarSlots();
    UI.modal({
        id: "slots",
        titulo: "Mis partidas",
        ancho: "ancho",
        cerrable: true,
        cuerpo: slots.map(function(s) {
            return "<div class='slot'>" +
                "<div class='crecer'><strong>Ranura " + s.slot + "</strong>" +
                "<div class='mini tenue'>" + (s.datos ? "Año " + s.datos.anio + " · Fecha " + (s.datos.fecha + 1) + " · " + fechaLegible(s.datos.fechaGuardado) : "Vacía") + "</div></div>" +
                (s.datos ? "<button class='btn' data-accion='cargar-slot' data-slot='" + s.slot + "'>Cargar</button>" +
                    "<button class='btn-peligro' data-accion='borrar-slot' data-slot='" + s.slot + "'>Borrar</button>" : "") +
                "</div>";
        }).join("")
    });
}

function cargarSlot(slot) {
    if (!cargarPartidaSlot(slot)) { toastError("No se pudo cargar la ranura."); return; }
    UI.cerrarTodo();
    partidaIniciada = true;
    refrescar();
    toastExito("Partida de la ranura " + slot + " cargada", "guardar");
}

function borrarSlot(slot) {
    borrarPartidaSlot(slot);
    abrirSlots();
    toastInfo("Ranura " + slot + " borrada");
}

function exportarPartida() {
    try {
        const datos = serializarPartida();
        const blob = new Blob([JSON.stringify(datos)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "afa-manager-ano" + presidente.anioMandato + ".json";
        a.click();
        setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
        toastExito("Partida exportada", "salir");
    } catch (e) { toastError("No se pudo exportar"); }
}

function importarPartida() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = function() {
        const archivo = input.files[0];
        if (!archivo) return;
        const lector = new FileReader();
        lector.onload = function() {
            try {
                const datos = JSON.parse(lector.result);
                if (!datos || !datos.presidente) throw new Error("Formato inválido");
                aplicarPartida(datos);
                UI.cerrarTodo();
                partidaIniciada = true;
                refrescar();
                toastExito("Partida importada", "recargar");
            } catch (e) { toastError("Archivo inválido"); }
        };
        lector.readAsText(archivo);
    };
    input.click();
}

// -----------------------------
// BOOT
// -----------------------------

function iniciarApp() {
    conectarBotonesHeader();
    reiniciarConsejo();
    arrancarJuego();
    if (typeof actualizarBotonMute === "function") actualizarBotonMute();
    refrescar();
}

function conectarBotonesHeader() {
    const btnAvanzar = document.getElementById("btn-avanzar");
    if (btnAvanzar) {
        btnAvanzar.addEventListener("click", function() {
            if (typeof sonidoClick === "function") sonidoClick();
            avanzarFecha();
        });
    }
    const btnBandeja = document.getElementById("btn-bandeja");
    if (btnBandeja) btnBandeja.addEventListener("click", abrirBandeja);
    const btnSonido = document.getElementById("btn-sonido");
    if (btnSonido) btnSonido.addEventListener("click", function() {
        if (typeof toggleMute === "function") toggleMute();
        actualizarShell();
    });
    const btnAjustes = document.getElementById("btn-ajustes");
    if (btnAjustes) btnAjustes.addEventListener("click", abrirAjustes);
    const btnAyuda = document.getElementById("btn-ayuda");
    if (btnAyuda) btnAyuda.addEventListener("click", abrirAyuda);
}

document.addEventListener("DOMContentLoaded", iniciarApp);
