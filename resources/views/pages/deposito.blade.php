@extends('layouts.app')

@section('title', 'Deposito operacional')
@section('page_key', 'deposito')

@section('content')
<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h2 class="erp-panel-titulo">Deposito de respaldo</h2>
            <p class="erp-panel-subtitulo">Controla entradas, salidas y transferencias del deposito hacia las maquinas.</p>
        </div>
        <button id="btn-deposito-cargar" class="erp-btn erp-btn--secundario">Actualizar</button>
    </div>

    <form id="form-deposito-filtros" class="mt-3 grid gap-3 md:grid-cols-5">
        <select id="deposito-select" name="Deposito" class="erp-select"></select>
        <input name="Busqueda" class="erp-input" placeholder="Busqueda">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="10" value="20" class="erp-input">
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
    </form>
    <div id="deposito-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Stock en deposito</h3>
        <div id="deposito-stock-tabla" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Movimientos de deposito</h3>
        <div id="deposito-movimientos-tabla" class="mt-3"></div>
    </article>
</section>

<section class="grid gap-4 xl:grid-cols-3">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Entrada a deposito</h3>
        <form id="form-deposito-entrada" class="erp-grid-campos mt-3">
            <select name="Deposito" class="erp-select"></select>
            <select name="Producto" class="erp-select deposito-producto"></select>
            <select name="Lote" class="erp-select deposito-lote"></select>
            <input name="Cantidad" type="number" min="1" class="erp-input" placeholder="Cantidad">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--primario">Registrar entrada</button>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Salida de deposito</h3>
        <form id="form-deposito-salida" class="erp-grid-campos mt-3">
            <select name="Deposito" class="erp-select"></select>
            <select name="Producto" class="erp-select deposito-producto"></select>
            <select name="Lote" class="erp-select deposito-lote"></select>
            <input name="Cantidad" type="number" min="1" class="erp-input" placeholder="Cantidad">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--secundario">Registrar salida</button>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Transferir a maquina</h3>
        <form id="form-deposito-transferencia" class="erp-grid-campos mt-3">
            <select name="Deposito" class="erp-select"></select>
            <select name="Maquina" id="transferencia-maquina" class="erp-select"></select>
            <input name="Celda" type="number" min="1" class="erp-input" placeholder="Celda">
            <select name="Producto" class="erp-select deposito-producto"></select>
            <select name="Lote" class="erp-select deposito-lote"></select>
            <input name="Cantidad" type="number" min="1" class="erp-input" placeholder="Cantidad">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--primario">Transferir</button>
        </form>
    </article>
</section>
@endsection
