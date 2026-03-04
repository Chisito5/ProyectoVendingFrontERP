@extends('layouts.app')

@section('title', 'Tablero operativo')
@section('page_key', 'tablero')

@section('content')
<div class="space-y-5 erp-tablero-compacto">
<section class="erp-panel erp-tablero-filtros-panel">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="erp-tablero-titular">
            <h2 class="erp-panel-titulo">Tablero ejecutivo</h2>
            <p class="erp-panel-subtitulo">Vista gerencial con rendimiento comercial y operativo por maquina.</p>
        </div>
        <div class="flex gap-2">
            <button id="btn-tablero-aplicar" class="erp-btn erp-btn--primario">Aplicar filtros</button>
            <button id="btn-tablero-limpiar" class="erp-btn erp-btn--secundario">Limpiar</button>
        </div>
    </div>

    <form id="form-tablero-filtros" class="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <select id="filtro-estado-tablero" name="Estado" class="erp-select">
            <option value="">Todos los estados</option>
        </select>
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Busqueda" type="text" class="erp-input" placeholder="Buscar por codigo o nombre">
        <select name="Orden" class="erp-select">
            <option value="ingresos">Orden por ingresos</option>
            <option value="ventas">Orden por ventas</option>
            <option value="alertas">Orden por alertas</option>
        </select>
        <select name="Por" class="erp-select">
            <option value="ingresos">Ranking por ingresos</option>
            <option value="ventas">Ranking por ventas</option>
            <option value="alertas">Ranking por alertas</option>
            <option value="margen">Ranking por margen</option>
        </select>
        <input name="Top" type="number" min="1" max="50" value="10" class="erp-input" placeholder="Top">
        <input name="Pagina" type="hidden" value="1">
        <input name="TamanoPagina" type="hidden" value="20">
    </form>

    <div id="tablero-mensaje-api" class="mt-3"></div>
</section>

<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Total de maquinas</p>
        <p id="kpi-total-maquinas" class="erp-kpi-valor erp-kpi-valor--azul">--</p>
        <p class="erp-kpi-nota">Base instalada en contexto filtrado</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Maquinas activas</p>
        <p id="kpi-maquinas-activas" class="erp-kpi-valor erp-kpi-valor--azul">--</p>
        <p class="erp-kpi-nota">En operacion regular</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Maquinas con alertas</p>
        <p id="kpi-maquinas-alerta" class="erp-kpi-valor erp-kpi-valor--naranja">--</p>
        <p class="erp-kpi-nota">Con incidencias abiertas</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Ventas del periodo</p>
        <p id="kpi-ventas-periodo" class="erp-kpi-valor erp-kpi-valor--azul">--</p>
        <p class="erp-kpi-nota">Transacciones consolidadas</p>
    </article>
    <article class="erp-panel erp-kpi-card md:col-span-2 xl:col-span-2">
        <p class="erp-kpi-etiqueta">Ingresos del periodo</p>
        <p id="kpi-ingresos-periodo" class="erp-kpi-valor erp-kpi-valor--naranja">--</p>
        <p class="erp-kpi-nota">Facturacion estimada en moneda local</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Maquina top ventas</p>
        <p id="kpi-maquina-top" class="erp-kpi-valor erp-kpi-valor--texto">--</p>
        <p class="erp-kpi-nota">Mejor rendimiento comercial</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Producto estrella global</p>
        <p id="kpi-producto-top" class="erp-kpi-valor erp-kpi-valor--texto">--</p>
        <p class="erp-kpi-nota">Mayor rotacion en el periodo</p>
    </article>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel erp-panel--grafico">
        <div class="erp-panel-cabecera-grafico">
            <div>
                <h2 class="erp-panel-titulo">Tendencia de reposiciones</h2>
                <p class="erp-panel-subtitulo">Evolucion por fecha de la recarga en casillas.</p>
            </div>
            <span class="erp-chip">Linea</span>
        </div>
        <div class="erp-chart-wrap">
            <canvas id="chart-tablero-tendencia"></canvas>
        </div>
    </article>
    <article class="erp-panel erp-panel--grafico">
        <div class="erp-panel-cabecera-grafico">
            <div>
                <h2 class="erp-panel-titulo">Top maquinas por ranking</h2>
                <p class="erp-panel-subtitulo">Comparativo segun criterio seleccionado.</p>
            </div>
            <span class="erp-chip">Barras</span>
        </div>
        <div class="erp-chart-wrap">
            <canvas id="chart-tablero-ranking"></canvas>
        </div>
    </article>
    <article class="erp-panel erp-panel--grafico">
        <div class="erp-panel-cabecera-grafico">
            <div>
                <h2 class="erp-panel-titulo">Estado de casillas</h2>
                <p class="erp-panel-subtitulo">Relacion entre casillas normales, stock bajo y fugaz.</p>
            </div>
            <span class="erp-chip">Dona</span>
        </div>
        <div class="erp-chart-wrap">
            <canvas id="chart-tablero-alertas"></canvas>
        </div>
    </article>
    <article class="erp-panel erp-panel--grafico">
        <div class="erp-panel-cabecera-grafico">
            <div>
                <h2 class="erp-panel-titulo">Ingresos por maquina</h2>
                <p class="erp-panel-subtitulo">Top de ingreso estimado por maquina.</p>
            </div>
            <span class="erp-chip">Horizontal</span>
        </div>
        <div class="erp-chart-wrap">
            <canvas id="chart-tablero-ingresos"></canvas>
        </div>
    </article>
</section>

<section class="erp-panel erp-panel--separado">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h2 class="erp-panel-titulo">Ranking ejecutivo</h2>
            <p class="erp-panel-subtitulo">Top de maquinas segun criterio seleccionado.</p>
        </div>
    </div>
    <div id="tablero-ranking" class="mt-4"></div>
</section>

<section class="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
    <article class="erp-panel erp-panel--separado">
        <div>
            <h2 class="erp-panel-titulo">Operacion por maquina</h2>
            <p class="erp-panel-subtitulo">Incluye responsables, tipo, estado operativo y producto estrella.</p>
        </div>
        <div id="tablero-tabla-maquinas" class="mt-4"></div>
        <div class="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span id="tablero-resumen-listado">Registros: 0</span>
            <div class="flex gap-2">
                <button id="btn-tablero-anterior" class="erp-btn erp-btn--secundario">Anterior</button>
                <button id="btn-tablero-siguiente" class="erp-btn erp-btn--secundario">Siguiente</button>
            </div>
        </div>
    </article>

    <article class="erp-panel erp-panel--separado">
        <div class="flex items-center justify-between gap-2">
            <div>
                <h2 class="erp-panel-titulo">Mapa GPS de maquinas</h2>
                <p class="erp-panel-subtitulo">Pines por nivel de alerta y estado operativo.</p>
            </div>
            <span class="erp-chip">Leaflet</span>
        </div>
        <div id="tablero-mapa-estado" class="mt-3 text-xs text-slate-500"></div>
        <div id="tablero-mapa" class="erp-mapa mt-3"></div>
    </article>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel erp-panel--separado">
        <div>
            <h2 class="erp-panel-titulo">Casillas operativas</h2>
            <p class="erp-panel-subtitulo">Stock por casilla, lote, caducidad y alerta operativa.</p>
        </div>
        <div id="tablero-casillas" class="mt-4"></div>
        <p id="tablero-casillas-resumen" class="mt-3 text-xs text-slate-600">Registros: 0</p>
    </article>

    <article class="erp-panel erp-panel--separado">
        <div>
            <h2 class="erp-panel-titulo">Historial de reponedores</h2>
            <p class="erp-panel-subtitulo">Trazabilidad de reposiciones por maquina y casilla.</p>
        </div>
        <div id="tablero-historial-reposicion" class="mt-4"></div>
        <p id="tablero-historial-resumen" class="mt-3 text-xs text-slate-600">Registros: 0</p>
    </article>
</section>
</div>
@endsection
