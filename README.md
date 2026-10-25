# AFA Manager · Presidencia 2026

Simulador de gestión del fútbol argentino. Agarrás la AFA después del retiro de
Messi y de la salida de Scaloni, con cuatro años por delante, 103 clubes
mirándote y una asamblea que votá tu continuidad cada diciembre.

**Jugar:** abrí `index.html` o entrá a la versión publicada en GitHub Pages.
No necesita instalación, build ni servidor: es HTML, CSS y JavaScript clásico.

---

## Qué se juega

- **Fecha a fecha**: se simulan las tres divisiones (Liga Profesional, Primera
  Nacional y Federal A), la Copa Argentina y la Selección. Cada fecha mueve la
  caja y el ánimo de los clubes.
- **Decisiones cada 6 fechas**: SAD, VAR, TV, descensos, cupos de extranjeros,
  reparto federal, derechos de formación, público visitante y más. Cada opción
  toca al menos dos ejes.
- **Consejo Directivo**: cinco consejeros (institucional, económico, deportivo,
  federal y mediático) con confianza propia. Si la confianza global cae por
  debajo de 30, te pueden pedir una asamblea anticipada.
- **Asamblea**: 103 clubes que pesan según su historia (3, 2 o 1 voto). En el
  cierre de cada año se vota tu continuidad y podés hacer campaña: gira federal,
  cena con los grandes, promesa de TV, spot o asado.
- **Objetivos anuales**: tres por año (económico, institucional y deportivo) con
  progreso, premio y castigo.
- **Finanzas 2.0**: libro diario por fecha, TV con renegociación cada dos años,
  sponsors con contrato, préstamos con interés y clubes al borde de la quiebra
  que podés rescatar.
- **Selección**: DT, ranking FIFA, amistosos y plantel de 23 jugadores.
- **Copas**: Copa Argentina (103 clubes), Libertadores, Sudamericana y Copa
  América.
- **Legado**: 24 logros, puntaje de legado y una pantalla final con tu historia.

## Reglas básicas

| Recurso | Qué mide | Cómo se mueve |
| --- | --- | --- |
| Apoyo | Los clubes te bancan | Decisiones, rescates, campaña. Se desgasta solo: cuanto más alto, más cuesta sostenerlo. |
| Prestigio | Tu imagen internacional | Amistosos, copas, prensa y decisiones. |
| Caja | La plata de la AFA | TV, sponsors y taquilla por un lado; estructura, DT, VAR, préstamos y rescates por el otro. |
| Consejo | Tu mesa chica | Cada decisión mueve al consejero del área. Si cae, hay moción de censura. |
| Asamblea | Tu continuidad | Proyección en vivo. Necesitás la mitad de los votos (o el umbral de la dificultad). |

## Dificultad

- **Gestión tranquila**: más caja, ingresos altos, asamblea benévola.
- **Presidencia real**: el equilibrio justo.
- **Modo crisis**: caja corta, clubes impacientes y umbral más alto.

Se elige en *Ajustes* y se puede cambiar en cualquier momento.

## Guardado

- Autoguardado en cada fecha (y cada 45 segundos).
- Tres ranuras manuales, exportar/importar partida en JSON.

## Estructura del proyecto

```
index.html            shell de la app
css/estilos.css       sistema de diseño completo
js/core.js            utilidades, formato, iconos
js/charts.js          gráficos SVG (sparkline, gauge, hemiciclo, barras)
js/vistas.js          render de escritorio, consejo y clubes
js/vistas2.js         render de copas, selección, árbitros, finanzas, prensa y legado
js/app.js             shell, navegación, modales y acciones
js/juego.js           motor del mandato (fechas, cierres, elecciones)
js/consejo.js         consejo directivo
js/asamblea.js        103 clubes, votos y campaña
js/objetivos.js       objetivos anuales
js/logros.js          logros y puntaje de legado
js/finanzas.js        libro diario, TV, sponsors y préstamos
js/plantel.js         plantel de la Selección
js/liga.js / ligas.js simulación de las tres divisiones
js/partido.js         simulación de partidos (Poisson)
js/arbitros.js        cuerpo arbitral, VAR y designaciones
js/copa_argentina.js  copa nacional
js/copa_america.js    copa de selecciones
js/continentales.js   Libertadores y Sudamericana
js/seleccion*.js      DT, amistosos y ranking FIFA
js/decisiones.js      contenido de decisiones
js/eventos.js         contenido de eventos
js/noticias.js        prensa y noticias
js/prensa.js          conferencias y relación con los medios
js/guardado.js        persistencia
```

## Cambios de la versión 3

- Rediseño visual completo, con navegación lateral en escritorio y barra
  inferior en mobile.
- Consejo Directivo, asamblea con elecciones, campaña y proyección de voto.
- Objetivos anuales, logros y legado.
- Finanzas con libro diario: se terminó el Año 1 sin ingresos.
- Se puede perder, pero ahora se sabe por qué: el umbral se ve todo el año.
- Tres dificultades, tres ranuras de guardado, exportar/importar.
- Selección con plantel, copas con más contexto, prensa con relación con los medios.
- Correcciones: overlay de "Simulando", formato de plata, tablas en mobile,
  escudos generados para los 73 clubes sin imagen, banderas sin emoji,
  clubes que ya no se multiplican temporada tras temporada.
- `simeone.png` pasó de 2,4 MB a una versión optimizada.

## Créditos

Idea y desarrollo: Bruno Y. Simulación y contenido: este repositorio.
Hecho para jugar en el celular, en el colectivo, camino a la cancha.
