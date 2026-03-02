@extends('layouts.app')

@section('title', 'Reportes ejecutivos')
@section('page_key', 'reportes')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Generador de reportes</h2>
    <p class="erp-panel-subtitulo">Exportaciones async en CSV/XLSX/PDF con seguimiento de estado y descarga.</p>

    <form id="form-reporte-generar" class="mt-4 grid gap-3 md:grid-cols-5">
        <select name="Plantilla" id="reporte-plantilla" class="erp-select"></select>
        <select name="TipoReporte" id="reporte-tipo" class="erp-select hidden">
            <option value="">Tipo de reporte...</option>
            <option value="VENTAS">Ventas</option>
            <option value="ROTACION">Rotacion</option>
            <option value="STOCKOUT">Stockout</option>
            <option value="RENTABILIDAD">Rentabilidad</option>
            <option value="MERMAS">Mermas</option>
        </select>
        <select name="Formato" class="erp-select">
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
            <option value="pdf">PDF</option>
        </select>
        <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <button class="erp-btn erp-btn--primario md:col-span-5">Generar reporte</button>
    </form>

    <div id="reporte-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Consultar estado</h3>
        <form id="form-reporte-estado" class="mt-3 flex flex-wrap gap-2">
            <input name="IdReporte" type="number" min="1" required class="erp-input max-w-44" placeholder="ID Reporte">
            <button class="erp-btn erp-btn--secundario">Ver estado</button>
        </form>
        <div id="reporte-estado-detalle" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Descargar reporte</h3>
        <form id="form-reporte-descargar" class="mt-3 flex flex-wrap gap-2">
            <input name="IdReporte" type="number" min="1" required class="erp-input max-w-44" placeholder="ID Reporte">
            <button class="erp-btn erp-btn--ok">Obtener descarga</button>
        </form>
        <div id="reporte-descarga-detalle" class="mt-3"></div>
    </article>
</section>

<section class="erp-panel">
    <div class="flex items-center justify-between gap-2">
        <h3 class="erp-panel-titulo">Listado de reportes</h3>
        <p id="reporte-listado-meta" class="text-xs text-slate-500"></p>
    </div>
    <form id="form-reporte-listado" class="mt-3 grid gap-3 md:grid-cols-4">
        <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
        <button class="erp-btn erp-btn--secundario md:col-span-4">Actualizar listado</button>
    </form>
    <div id="reporte-listado-tabla" class="mt-3"></div>
</section>
@endsection

