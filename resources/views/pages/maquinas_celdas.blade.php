@extends('layouts.app')

@section('title', 'Maquinas y celdas inteligentes')
@section('page_key', 'maquinas_celdas')

@php
    $tcVista = request('vista', 'maquinas');
@endphp

@section('content')
<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h2 class="erp-panel-titulo">Operacion de maquinas y celdas</h2>
            <p class="erp-panel-subtitulo">La maquina activa se controla desde el header superior y administra sus 54 celdas de forma visual.</p>
        </div>
    </div>

    <form id="form-celdas-filtros" class="mt-3 grid gap-3 md:grid-cols-6">
        <input id="celdas-maquina-label" class="erp-input" value="Maquina: todas (header)" readonly>
        <input type="hidden" name="Maquina" id="celdas-maquina">
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="10" value="54" class="erp-input">
        <input name="Busqueda" class="erp-input" placeholder="Buscar celda o producto">
    </form>
    <div id="celdas-mensaje" class="mt-3"></div>
</section>

<section id="vista-maquinas" class="{{ $tcVista === 'maquinas' ? '' : 'hidden' }}">
    <article class="erp-panel">
        <div class="flex items-center justify-between gap-2">
            <h3 class="erp-panel-titulo">Detalle de maquina</h3>
            <button id="btn-maquina-editar" type="button" class="erp-btn erp-btn--primario">Editar maquina</button>
        </div>
        <div class="mt-3 grid gap-4 xl:grid-cols-3">
            <div class="xl:col-span-2">
                <h4 class="erp-panel-subtitulo font-semibold text-slate-700">Resumen operativo</h4>
                <div id="maquina-detalle" class="mt-2"></div>
            </div>
            <div>
                <h4 class="erp-panel-subtitulo font-semibold text-slate-700">Ubicacion de maquina</h4>
                <div id="maquina-ubicacion" class="mt-2"></div>
            </div>
        </div>
        <div class="mt-4 border-t border-slate-200 pt-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="erp-panel-subtitulo font-semibold text-slate-700">Fotos de maquina</h4>
                <span class="erp-chip">Minimo 3 fotos activas</span>
            </div>
            <form id="form-maquina-fotos" class="mt-3 grid gap-3 lg:grid-cols-4">
                <textarea
                    name="Urls"
                    class="erp-textarea lg:col-span-2"
                    rows="3"
                    placeholder="Pegue URLs (una por linea). Ej: https://.../foto1.jpg"
                ></textarea>
                <input name="FotosArchivo" type="file" class="erp-input lg:col-span-2" accept="image/*" multiple>
                <select name="TipoFoto" class="erp-select">
                    <option value="FRENTE">FRENTE</option>
                    <option value="LATERAL">LATERAL</option>
                    <option value="INSTALACION">INSTALACION</option>
                    <option value="DETALLE">DETALLE</option>
                </select>
                <input name="Motivo" class="erp-input" placeholder="Motivo de carga de fotos">
                <button id="btn-maquina-fotos-subir" type="button" class="erp-btn erp-btn--primario lg:col-span-4">
                    Subir fotos
                </button>
            </form>
            <div id="maquina-fotos-preview" class="mt-2"></div>
            <div id="maquina-fotos-mensaje" class="mt-3"></div>
            <div id="maquina-fotos-lista" class="mt-3 erp-fotos-grid"></div>
        </div>
    </article>
</section>

<section id="vista-celdas" class="{{ $tcVista === 'celdas' ? '' : 'hidden' }}">
    <article class="erp-panel">
        <div class="flex items-center justify-between gap-2">
            <div>
                <h3 class="erp-panel-titulo">Vista matriz 6x9</h3>
                <p class="erp-panel-subtitulo">Haz click en una celda para abrir su modal operativo.</p>
            </div>
            <div class="flex gap-2">
                <button id="btn-celdas-conflictos" type="button" class="erp-btn erp-btn--secundario">Ver conflictos</button>
            </div>
        </div>
        <div id="celdas-matriz" class="mt-3 erp-matriz-celdas"></div>
    </article>

    <article class="erp-panel mt-4">
        <h3 class="erp-panel-titulo">Conflictos y bloqueos</h3>
        <div id="celdas-conflictos" class="mt-3"></div>
    </article>
</section>

<div id="modal-maquina" class="erp-dialogo-capa hidden">
    <div class="erp-dialogo">
        <div class="mb-3 flex items-center justify-between">
            <h4 class="text-base font-bold">Editar maquina</h4>
            <button id="btn-maquina-modal-cerrar" type="button" class="erp-btn erp-btn--secundario">Cerrar</button>
        </div>
        <form id="form-maquina-editar" class="erp-grid-campos md:grid-cols-2">
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Id maquina
                <input name="IdMaquina" type="number" min="1" class="erp-input" readonly>
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Codigo maquina
                <input name="CodigoMaquina" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Numero de serie
                <input name="NumeroSerie" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Marca
                <input name="Marca" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Modelo
                <input name="Modelo" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Identificador de conexion
                <input name="IdentificadorConexion" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Tipo internet
                <select name="TipoInternet" id="maquina-tipo-internet" class="erp-select">
                    <option value="">Seleccione tipo internet...</option>
                </select>
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Consumo kWh mensual
                <input name="ConsumoKwhMensual" type="number" min="0" step="0.01" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Tipo lugar instalacion
                <select name="TipoLugarInstalacion" id="maquina-tipo-lugar" class="erp-select">
                    <option value="">Seleccione tipo lugar...</option>
                </select>
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Ubicacion actual
                <input name="UbicacionActual" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Filas matriz
                <input name="FilasMatriz" type="number" min="1" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Columnas matriz
                <input name="ColumnasMatriz" type="number" min="1" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Estado
                <input name="Estado" class="erp-input">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600">
                Version
                <input name="Version" class="erp-input" placeholder="Obligatorio para actualizar">
            </label>
            <label class="grid gap-1 text-xs font-semibold text-slate-600 md:col-span-2">
                Motivo
                <input name="Motivo" class="erp-input" placeholder="Describa el cambio realizado">
            </label>
            <button id="btn-maquina-guardar" type="button" class="erp-btn erp-btn--primario md:col-span-2">Guardar cambios</button>
        </form>
    </div>
</div>

<div id="modal-celda" class="erp-dialogo-capa hidden">
    <div class="erp-dialogo">
        <div class="mb-3 flex items-center justify-between">
            <h4 class="text-base font-bold">Operacion de celda</h4>
            <button id="btn-celda-modal-cerrar" type="button" class="erp-btn erp-btn--secundario">Cerrar</button>
        </div>
        <form id="form-celdas-asignacion" class="erp-grid-campos">
            <input name="CeldaAncla" type="number" min="1" class="erp-input" placeholder="Celda ancla" readonly>
            <select name="Producto" id="celdas-producto" class="erp-select"></select>
            <select name="Lote" id="celdas-lote" class="erp-select"></select>
            <input name="Cantidad" type="number" min="1" class="erp-input" placeholder="Cantidad">
            <input name="SpanColumnas" type="number" min="1" max="9" value="1" class="erp-input" placeholder="Span columnas">
            <input name="SpanFilas" type="number" min="1" max="6" value="1" class="erp-input" placeholder="Span filas">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex flex-wrap gap-2">
                <button type="button" id="btn-celdas-simular" class="erp-btn erp-btn--secundario">Simular ocupacion</button>
                <button type="button" id="btn-celdas-asignar" class="erp-btn erp-btn--primario">Asignar producto</button>
                <button type="button" id="btn-celdas-liberar" class="erp-btn erp-btn--peligro">Liberar celda</button>
            </div>
        </form>
        <div class="mt-3">
            <h4 class="text-xs font-bold uppercase tracking-wide text-slate-500">Resultado de simulacion</h4>
            <div id="celdas-simulacion" class="mt-2"></div>
        </div>
    </div>
</div>
@endsection
