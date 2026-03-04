@extends('layouts.app')

@section('title', 'Ventas operativas')
@section('page_key', 'ventas')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Transacciones de ventas</h2>
    <p class="erp-panel-subtitulo">Consulta operativa de transacciones con filtros por fecha y maquina.</p>

    <form id="form-filtros-ventas" class="mt-3 grid gap-3 md:grid-cols-6">
        <select id="sales-machine-filter" name="Maquina" class="erp-select"></select>
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
        <div class="flex items-center gap-2">
            <button id="btn-load-sales-machine" type="button" class="erp-btn erp-btn--primario">Aplicar</button>
            <button id="btn-load-sales" type="button" class="erp-btn erp-btn--secundario">Actualizar</button>
        </div>
    </form>

    <div id="sale-message" class="mt-3"></div>
</section>

<section class="grid gap-4 md:grid-cols-3">
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Transacciones</p>
        <p id="ventas-kpi-transacciones" class="erp-kpi-valor erp-kpi-valor--azul">0</p>
        <p class="erp-kpi-nota">Registros del bloque cargado</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Monto total</p>
        <p id="ventas-kpi-monto" class="erp-kpi-valor erp-kpi-valor--naranja">Bs 0.00</p>
        <p class="erp-kpi-nota">Suma de montos visibles</p>
    </article>
    <article class="erp-panel erp-kpi-card">
        <p class="erp-kpi-etiqueta">Ticket promedio</p>
        <p id="ventas-kpi-ticket" class="erp-kpi-valor erp-kpi-valor--texto">Bs 0.00</p>
        <p class="erp-kpi-nota">Monto promedio por transaccion</p>
    </article>
</section>

<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Listado de transacciones</h3>
            <p class="erp-panel-subtitulo">Detalle de venta con monto, productos, estado, fecha y hora.</p>
        </div>
    </div>
    <div class="mt-3">
        <input id="sales-search-input" type="text" class="erp-input" placeholder="Buscar...">
    </div>
    <div class="erp-tabla-container mt-3">
        <table class="erp-tabla">
            <thead>
                <tr>
                    <th>N°</th>
                    <th>ID Venta</th>
                    <th>ID Maquina</th>
                    <th>Casilla</th>
                    <th>Cliente Emisor</th>
                    <th>Cliente Receptor</th>
                    <th>Metodo pago</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Producto</th>
                    <th>Monto Enviado</th>
                    <th>Monto Recibido</th>
                </tr>
            </thead>
            <tbody id="sales-transacciones-body">
                <tr>
                    <td colspan="13">No se encontraron transacciones.</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="mt-2 flex items-center justify-center gap-2">
        <button id="sales-page-first" type="button" class="erp-btn erp-btn--secundario">«</button>
        <button id="sales-page-prev" type="button" class="erp-btn erp-btn--secundario">‹</button>
        <span id="sales-page-info" class="text-xs text-slate-600">Pagina 1 de 1</span>
        <button id="sales-page-next" type="button" class="erp-btn erp-btn--secundario">›</button>
        <button id="sales-page-last" type="button" class="erp-btn erp-btn--secundario">»</button>
    </div>
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
@endsection
