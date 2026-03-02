@extends('layouts.app')

@section('title', 'Stock operativo')
@section('page_key', 'stock')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Stock por maquina</h2>
    <p class="erp-panel-subtitulo">Vista operativa por celda + seleccion + lote con soporte de paginacion y auditoria.</p>

    <form id="form-filtros-stock" class="mt-4 grid gap-3 md:grid-cols-5">
        <div>
            <label class="text-xs font-semibold text-slate-600">Maquina</label>
            <select id="stock-machine-select" name="Maquina" class="erp-select"></select>
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Busqueda</label>
            <input name="Busqueda" class="erp-input" placeholder="A1, producto, lote">
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Pagina</label>
            <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Tamano pagina</label>
            <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
        </div>
        <div class="flex items-end gap-2">
            <button id="btn-consultar-stock" class="erp-btn erp-btn--primario w-full">Consultar stock</button>
        </div>
    </form>

    <div id="stock-machine-message" class="mt-3"></div>
    <div id="stock-machine-table" class="mt-4"></div>
</section>

<section class="erp-panel">
    <h3 class="erp-panel-titulo">Consulta puntual por seleccion</h3>
    <form id="form-stock-selection" class="mt-3 grid gap-3 md:grid-cols-4">
        <input name="maquina" type="number" min="1" required class="erp-input" placeholder="ID Maquina">
        <input name="codigo" required class="erp-input" placeholder="CodigoSeleccion (A1)">
        <button class="erp-btn erp-btn--secundario">Consultar</button>
    </form>
    <div id="stock-selection-message" class="mt-3"></div>
    <div id="stock-selection-table" class="mt-4"></div>
</section>

<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Auditoria de movimientos de stock</h3>
            <p class="erp-panel-subtitulo">Trazabilidad de quien, cuando y que cambio.</p>
        </div>
        <button id="btn-cargar-movimientos-stock" class="erp-btn erp-btn--secundario">Cargar movimientos</button>
    </div>

    <form id="form-filtros-movimientos-stock" class="mt-3 grid gap-3 md:grid-cols-6">
        <input name="Maquina" type="number" min="1" class="erp-input" placeholder="Maquina">
        <input name="Celda" class="erp-input" placeholder="Celda">
        <input name="Lote" type="number" min="1" class="erp-input" placeholder="Lote">
        <input name="TipoMovimiento" class="erp-input" placeholder="VENTA, REPOSICION">
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
    </form>

    <div id="stock-movimientos-message" class="mt-3"></div>
    <div id="stock-movimientos-table" class="mt-4"></div>
</section>
@endsection

