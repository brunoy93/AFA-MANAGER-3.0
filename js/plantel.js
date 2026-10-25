// ============================================
// PLANTEL: los 23 de la Selección
// ============================================

const NOMBRES_PILA = [
    "Franco", "Lautaro", "Julián", "Nicolás", "Facundo", "Thiago", "Valentín", "Máximo",
    "Bautista", "Joaquín", "Santiago", "Tomás", "Ignacio", "Emiliano", "Gonzalo", "Ramiro",
    "Agustín", "Bruno", "Ciro", "Dante", "Ezequiel", "Federico", "Gaspar", "Hernán",
    "Iván", "Joaquín", "Kevin", "Lisandro", "Mauro", "Nahuel", "Octavio", "Pablo",
    "Ramiro", "Simón", "Tobías", "Ulises", "Vicente", "Wenceslao", "Yamil", "Zacarías"
];

const APELLIDOS = [
    "Álvarez", "Martínez", "Gómez", "Romero", "Sosa", "Torres", "Fernández", "Ruiz",
    "Benítez", "Acosta", "Medina", "Herrera", "Aguirre", "Pereyra", "Giménez", "Molina",
    "Silva", "Castro", "Rojas", "Ortiz", "Núñez", "Ledesma", "Cabrera", "Vega",
    "Quiroga", "Zárate", "Peralta", "Ojeda", "Barrios", "Cáceres", "Villalba", "Escobar",
    "Ibarra", "Maidana", "Sánchez", "Paz", "Godoy", "Correa", "Ferreyra", "Luna",
    "Carrizo", "Arias", "Duarte", "Navarro", "Cortés", "Ríos", "Valdez", "Suárez",
    "Domínguez", "Bustos", "Alvarado", "Miranda", "Orellana", "Palacios", "Ramírez", "Salas"
];

const POSICIONES = [
    { id: "ARQ", nombre: "Arquero", cantidad: 3 },
    { id: "DEF", nombre: "Defensor", cantidad: 8 },
    { id: "MED", nombre: "Mediocampista", cantidad: 7 },
    { id: "DEL", nombre: "Delantero", cantidad: 5 }
];

const CLUBES_EJEMPLO = [
    "River Plate", "Boca Juniors", "Racing Club", "Independiente", "San Lorenzo",
    "Estudiantes de La Plata", "Vélez Sarsfield", "Rosario Central", "Newell's Old Boys",
    "Talleres", "Lanús", "Argentinos Juniors", "Benfica", "Porto", "Atlético Madrid",
    "Manchester City", "Inter", "Milan", "Brighton", "Fiorentina", "Sevilla", "Villarreal",
    "Al Nassr", "Inter Miami", "Cruz Azul", "Flamengo", "Palmeiras", "Lazio"
];

const estadoSeleccion = {
    plantel: [],
    generado: false,
    anioGenerado: 0
};

function generarPlantelSeleccion() {
    const base = 68 + Math.round((presidente.prestigioInternacional - 50) * 0.25);
    const plantel = [];
    let n = 0;

    POSICIONES.forEach(function(pos) {
        for (let i = 0; i < pos.cantidad; i++) {
            const nombre = elegir(NOMBRES_PILA) + " " + elegir(APELLIDOS);
            const edad = entre(20, 34);
            let nivel = base + entre(-6, 12);
            if (edad >= 30) nivel += 2;
            if (edad <= 22) nivel -= 2;
            plantel.push({
                id: "p" + (++n),
                nombre: nombre,
                posicion: pos.id,
                posicionNombre: pos.nombre,
                edad: edad,
                club: elegir(CLUBES_EJEMPLO),
                nivel: limitar(Math.round(nivel), 55, 96),
                capitan: false
            });
        }
    });

    plantel.sort(function(a, b) { return b.nivel - a.nivel; });
    if (plantel.length) plantel[0].capitan = true;

    estadoSeleccion.plantel = plantel;
    estadoSeleccion.generado = true;
    estadoSeleccion.anioGenerado = presidente.anioMandato;
    return plantel;
}

function plantelSeleccion() {
    if (!estadoSeleccion.generado || !estadoSeleccion.plantel.length) generarPlantelSeleccion();
    return estadoSeleccion.plantel;
}

function promedioPlantel() {
    const plantel = plantelSeleccion();
    if (!plantel.length) return 0;
    return Math.round(plantel.reduce(function(a, j) { return a + j.nivel; }, 0) / plantel.length);
}

function nivelPromedioPosicion(pos) {
    const jugadores = plantelSeleccion().filter(function(j) { return j.posicion === pos; });
    if (!jugadores.length) return 0;
    return Math.round(jugadores.reduce(function(a, j) { return a + j.nivel; }, 0) / jugadores.length);
}
