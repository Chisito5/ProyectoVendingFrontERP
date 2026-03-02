@extends('layouts.app')

@section('title', 'Reposicion operativa')
@section('page_key', 'reposiciones')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Registrar reposicion</h2>
    <p class="erp-panel-subtitulo">Prevalidacion de capacidad/lote antes de confirmar carga a celda.</p>

    <form id="form-create-restock" class="mt-4 grid gap-3 md:grid-cols-4">
        <div>
            <label class="text-xs font-semibold text-slate-600">Maquina</label>
            <select name="Maquina" id="restock-machine-select" class="erp-select"></select>
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Codigo seleccion</label>
            <input name="CodigoSeleccion" required class="erp-input" placeholder="A1">
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Cantidad</label>
            <input name="Cantidad" type="number" required min="1" value="1" class="erp-input">
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Usuario operador</label>
            <input name="UsuarioOperador" type="number" required min="1" value="1" class="erp-input">
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">ProductoEmpresa</label>
            <input name="ProductoEmpresa" type="number" required min="1" class="erp-input">
        </div>
        <div>
            <label class="text-xs font-semibold text-slate-600">Lote</label>
            <input name="Lote" type="number" required min="1" class="erp-input">
        </div>
        <div class="md:col-span-2">
            <label class="text-xs font-semibold text-slate-600">Observacion</label>
            <input name="Observacion" class="erp-input" placeholder="Carga inicial, ajuste, reposicion semanal...">
        </div>

        <div class="flex gap-2 md:col-span-4">
            <button id="btn-prevalidar-restock" type="button" class="erp-btn erp-btn--secundario">Prevalidar</button>
            <button id="btn-create-restock" class="erp-btn erp-btn--primario">Confirmar reposicion</button>
        </div>
    </form>

    <div id="restock-message" class="mt-3"></div>
</section>

<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Historial de reposiciones</h3>
            <p class="erp-panel-subtitulo">Listado paginado con detalle auditable.</p>
        </div>
        <button id="btn-load-restocks" class="erp-btn erp-btn--secundario">Actualizar listado</button>
    </div>

    <form id="form-filtros-reposicion" class="mt-3 grid gap-3 md:grid-cols-6">
        <select id="restock-machine-filter" name="Maquina" class="erp-select"></select>
        <input name="Lote" type="number" min="1" class="erp-input" placeholder="Lote">
        <input name="UsuarioOperador" type="number" min="1" class="erp-input" placeholder="Operador">
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
    </form>

    <div class="mt-3 flex flex-wrap gap-2">
        <button id="btn-load-restocks-machine" class="erp-btn erp-btn--secundario">Filtrar por maquina</button>
        <form id="form-restock-detail" class="flex gap-2">
            <input name="reposicionId" type="number" min="1" placeholder="Id reposicion" class="erp-input w-40">
            <button class="erp-btn erp-btn--secundario">Ver detalle</button>
        </form>
    </div>

    <div id="restock-query-message" class="mt-3"></div>
    <div id="restock-table" class="mt-4"></div>
</section>
@endsection

