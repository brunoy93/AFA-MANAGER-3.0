# AFA MANAGER 3.0 — Rediseño y expansión

Documento de diseño. Resume qué se cambió respecto de la v2.0 y por qué.

## 1. Diagnóstico de la v2.0

Lo que funcionaba: el escenario (post-Messi), el volumen de contenido (103 clubes,
decisiones, eventos, copas), la simulación de partidos y el guardado.

Lo que no:

- **Economía rota**: el Año 1 no cobraba ingresos (`cobrarIngresosAnuales()` sólo
  se llamaba al iniciar la temporada siguiente). Balance garantizado de −$7.250M.
- **Fin de partida invisible**: se seguía sólo con apoyo ≥ 55, y el jugador nunca
  veía ese umbral. Año 1, seis decisiones, game over.
- **Sin feedback**: elegías una decisión y lo único que veías era un toast. Los
  números subían y bajaban sin contexto.
- **UI de una sola columna**: 10.000 px de scroll en Clubes, tablas clipeadas en
  mobile, pestañas cortadas, banderas rotas en Windows.
- **Peso**: 5.5 MB / 250 requests, con un PNG de 2.4 MB para un avatar de 90 px.
- **Texto suelto**: `#overlay-simulando` sin CSS quedaba visible al pie de página.

## 2. Principios del rediseño

1. **Todo número tiene que poder explicarse.** Apoyo, prestigio, caja, confianza
   del consejo y proyección de voto se muestran con su tendencia y sus causas.
2. **Nunca perder sin saber por qué.** El umbral de continuidad es explícito y se
   ve durante todo el año (proyección de asamblea).
3. **Densidad con jerarquía.** Escritorio tipo *dashboard*; en mobile, una cosa
   por pantalla.
4. **Cada decisión deja huella.** Las decisiones mueven al menos dos ejes
   (apoyo, prestigio, caja, consejo, bloques de clubes) y muchas encadenan
   consecuencias a futuro.
5. **Cero dependencias, cero build.** Sigue siendo HTML + CSS + JS clásico para
   subir directo a GitHub Pages.

## 3. Sistemas nuevos

### 3.1 Consejo Directivo (confianza)
Cinco consejeros con área e intereses: Institucional, Económico, Deportivo,
Federal y Mediático. Cada uno tiene confianza 0–100 y pondera distinto.

- Las decisiones ajustan a los consejeros de su categoría (y salpican al resto).
- La confianza deriva con los resultados: la caja mueve al Tesorero, la campaña
  del Interior mueve al Federal, los resultados de la Selección al Deportivo.
- Confianza global < 30 → riesgo de **moción de censura** (elección anticipada).
- Confianza global ≥ 70 → bono en la asamblea y crédito más barato.

### 3.2 Asamblea y elecciones
Los 103 clubes votan con peso según su historia (grandes 3 votos, medios 2,
chicos 1). Cada club tiene inclinación según apoyo, rescates, decisiones y
campaña. En año electoral (todos) la asamblea se reúne al cierre:

- **Hemiciclo** con oficialistas / indecisos / opositores y proyección en vivo.
- **Campaña** (3 acciones por año): gira federal, cena con los grandes, promesa
  de TV (queda como promesa a cumplir).
- Ganar ≥ 50% + 1 de los votos → nuevo mandato. Perder → final de partida con
  balance y legado.

### 3.3 Objetivos anuales
Tres objetivos por año (económico, deportivo, institucional/federal) con
progreso medible, recompensa y castigo. Se eligen según el contexto (si perdiste
la final, el objetivo es volver; si estás fundido, sanear).

### 3.4 Finanzas 2.0
- **Libro diario**: cada fecha registra TV, sponsors, sueldos, VAR y eventos.
- **P&L** del año + presupuesto vs. real + historial con gráfico.
- **Préstamos** (hasta 2): plata ahora, cuota fija por fecha, interés.
- **TV**: contrato que se renegocia cada dos años (decisión con riesgo).
- **Sponsors** con contrato de 2 años y bonus por objetivo.

### 3.5 Legado y logros
24 logros (deportivos, económicos, institucionales) y un **puntaje de legado**
que combina títulos, apoyo, prestigio y caja. Pantalla final con la historia del
mandato fecha por fecha.

### 3.6 Dificultad
Tres niveles que ajustan ingresos, agresividad de eventos y umbral de asamblea.

### 3.7 Calidad de vida
- Guardado en **3 slots** + autoguardado + exportar/importar JSON.
- Bandeja de entrada unificada (decisiones, ofertas, prensa, resultados).
- Onboarding de 4 pasos la primera vez.
- Sonido, movimiento reducido y contraste respetados.

## 4. Referencias

- *Football Manager*: confianza del consejo por área, objetivos de temporada,
  bandeja de entrada, "visión del club".
- *Democracy 4*: grupos de interés con demandas contradictorias y efectos
  diferidos de las políticas.
- *Club Chairman / Football Chairman*: la asamblea de socios y la campaña.
- *Reigns*: decisiones de dos filos con consecuencias encadenadas.
- *Game Dev Tycoon*: revisión de fin de año con puntaje y desglose.

## 5. Arquitectura

```
js/core.js        utilidades, formato, iconos
js/charts.js      gráficos SVG (sparkline, gauge, hemiciclo, barras)
js/imagenes.js    escudos (PNG o SVG procedural), banderas, fotos
js/vistas.js      render de cada pantalla
js/app.js         shell, router, modales, eventos de UI
js/consejo.js     consejo directivo
js/asamblea.js    clubes, votos, elecciones, campaña
js/objetivos.js   objetivos anuales
js/logros.js      logros y legado
js/finanzas.js    libro diario, préstamos, TV, sponsors
js/juego.js       orquestador del loop
```

Los módulos de simulación existentes (liga, partido, arbitrajes, copas,
selección) se conservan con cambios menores.
