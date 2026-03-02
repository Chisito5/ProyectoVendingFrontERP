@extends('layouts.app')

@section('title', 'Ventas operativas')
@section('page_key', 'ventas')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Ventas y reversa</h2>
    <p class="erp-panel-subtitulo">Operacion transaccional con idempotencia, control de conflicto y auditoria visual.</p>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Crear venta</h3>
        <form id="form-create-sale" class="erp-grid-campos mt-3">
            <select name="Maquina" id="sale-machine-select" class="erp-select"></select>
            <input name="CodigoSeleccion" required placeholder="CodigoSeleccion" class="erp-input">
            <input name="Cantidad" type="number" required min="1" value="1" class="erp-input">
            <button id="btn-create-sale" class="erp-btn erp-btn--primario">Procesar venta</button>
        </form>
        <div id="sale-message" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Reversa de venta</h3>
        <form id="form-reverse-sale" class="erp-grid-campos mt-3">
            <input name="Venta" type="number" required min="1" placeholder="Id de venta" class="erp-input">
            <input name="Motivo" required placeholder="Motivo" class="erp-input">
            <button id="btn-reverse-sale" class="erp-btn erp-btn--peligro">Reversar venta</button>
        </form>
        <div id="sale-reverse-message" class="mt-3"></div>
    </article>
</section>

<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Listado de ventas</h3>
            <p class="erp-panel-subtitulo">Consulta paginada por maquina y detalle en panel lateral.</p>
        </div>
        <div class="flex gap-2">
            <button id="btn-load-sales" class="erp-btn erp-btn--secundario">Actualizar</button>
            <button id="btn-open-sales-detail" class="erp-btn erp-btn--secundario">Ver seleccionada</button>
        </div>
    </div>

    <form id="form-filtros-ventas" class="mt-3 grid gap-3 md:grid-cols-5">
        <select id="sales-machine-filter" name="Maquina" class="erp-select"></select>
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
    </form>

    <div class="mt-3 flex gap-2">
        <button id="btn-load-sales-machine" class="erp-btn erp-btn--secundario">Filtrar por maquina</button>
    </div>

    <div id="sales-table" class="mt-4"></div>
</section>
@endsection

