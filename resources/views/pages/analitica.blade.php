@extends('layouts.app')

@section('title', 'Analitica ejecutiva')
@section('page_key', 'analitica')

@section('content')
<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h2 class="erp-panel-titulo">Analitica operativa</h2>
            <p class="erp-panel-subtitulo">Consulta ejecutiva por empresa, maquina y producto con paginacion del servidor.</p>
        </div>
        <div class="flex gap-2">
            <button id="btn-analitica-consultar" class="erp-btn erp-btn--primario">Consultar</button>
            <button id="btn-analitica-limpiar" class="erp-btn erp-btn--secundario">Limpiar</button>
        </div>
    </div>

    <form id="form-analitica" class="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <select name="Tipo" class="erp-select">
            <option value="resumen">Resumen</option>
            <option value="ventas">Ventas</option>
            <option value="rotacion">Rotacion</option>
            <option value="stockout">Quiebre de stock</option>
            <option value="rentabilidad">Rentabilidad</option>
            <option value="mermas">Mermas</option>
        </select>
        <select id="filtro-empresa-analitica" name="Empresa" class="erp-select">
            <option value="">Todas las empresas</option>
        </select>
        <select id="filtro-maquina-analitica" name="Maquina" class="erp-select">
            <option value="">Todas las maquinas</option>
        </select>
        <select id="filtro-producto-analitica" name="Producto" class="erp-select">
            <option value="">Todos los productos</option>
        </select>
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Pagina" type="hidden" value="1">
        <input name="TamanoPagina" type="hidden" value="20">
    </form>

    <div id="analitica-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Conjunto actual</h3>
        <p id="analitica-kpi-dataset" class="mt-3 text-xl font-black text-[#355D93]">--</p>
    </article>
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Registros visibles</h3>
        <p id="analitica-kpi-registros" class="mt-3 text-xl font-black text-[#355D93]">--</p>
    </article>
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Pagina</h3>
        <p id="analitica-kpi-pagina" class="mt-3 text-xl font-black text-[#355D93]">--</p>
    </article>
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Total registros</h3>
        <p id="analitica-kpi-total" class="mt-3 text-xl font-black text-[#F28E1B]">--</p>
    </article>
</section>

<section class="erp-panel">
    <div class="flex items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Resumen del conjunto</h3>
            <p class="erp-panel-subtitulo">Indicadores agregados retornados por la API de analitica.</p>
        </div>
    </div>
    <div id="analitica-resumen" class="mt-3"></div>
    <div id="analitica-tabla" class="mt-4"></div>
    <div class="mt-3 flex items-center justify-between text-xs text-slate-600">
        <span id="analitica-resumen-listado">Registros: 0</span>
        <div class="flex gap-2">
            <button id="btn-analitica-anterior" class="erp-btn erp-btn--secundario">Anterior</button>
            <button id="btn-analitica-siguiente" class="erp-btn erp-btn--secundario">Siguiente</button>
        </div>
    </div>
</section>
@endsection

