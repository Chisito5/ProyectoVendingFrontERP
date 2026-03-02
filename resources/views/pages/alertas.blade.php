@extends('layouts.app')

@section('title', 'Alertas operativas')
@section('page_key', 'alertas')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Reglas y ciclo de vida de alertas</h2>
    <p class="erp-panel-subtitulo">Gestion de umbrales operativos y atencion/escalamiento/cierre por criticidad.</p>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Regla de alerta</h3>
        <form id="form-alerta-regla" class="erp-grid-campos mt-3">
            <input name="IdRegla" type="number" min="1" class="erp-input" placeholder="ID Regla (actualizar)">
            <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
            <input name="Maquina" type="number" min="1" class="erp-input" placeholder="Maquina">
            <input name="Celda" type="number" min="1" class="erp-input" placeholder="Celda">
            <input name="Producto" type="number" min="1" class="erp-input" placeholder="Producto">
            <input name="TipoRegla" class="erp-input" placeholder="Tipo regla (ej: STOCK_MINIMO)">
            <input name="UmbralMinimo" type="number" min="0" class="erp-input" placeholder="Umbral minimo">
            <input name="Prioridad" type="number" min="1" max="10" class="erp-input" placeholder="Prioridad">
            <input name="MensajeRegla" class="erp-input" placeholder="Mensaje de regla">
            <input name="Estado" type="number" min="1" class="erp-input" placeholder="Estado (1 activo)">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex gap-2">
                <button type="button" id="btn-alerta-regla-crear" class="erp-btn erp-btn--primario">Crear regla</button>
                <button type="button" id="btn-alerta-regla-actualizar" class="erp-btn erp-btn--secundario">Actualizar regla</button>
                <button type="button" id="btn-alerta-regla-eliminar" class="erp-btn erp-btn--peligro">Inactivar regla</button>
            </div>
        </form>

        <div id="alerta-mensaje" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Accion sobre alerta</h3>
        <form id="form-alerta-accion" class="erp-grid-campos mt-3">
            <input name="IdAlerta" type="number" min="1" required class="erp-input" placeholder="ID Alerta">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex flex-wrap gap-2">
                <button type="button" id="btn-alerta-atender" class="erp-btn erp-btn--secundario">Atender</button>
                <button type="button" id="btn-alerta-escalar" class="erp-btn erp-btn--peligro">Escalar</button>
                <button type="button" id="btn-alerta-cerrar" class="erp-btn erp-btn--ok">Cerrar</button>
            </div>
        </form>
    </article>
</section>

<section class="erp-panel">
    <div class="flex items-center justify-between gap-2">
        <h3 class="erp-panel-titulo">Listado de alertas</h3>
        <button id="btn-alerta-cargar" class="erp-btn erp-btn--secundario">Actualizar</button>
    </div>

    <form id="form-alerta-filtros" class="mt-3 grid gap-3 md:grid-cols-6">
        <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
        <input name="Maquina" type="number" min="1" class="erp-input" placeholder="Maquina">
        <input name="Tipo" class="erp-input" placeholder="Tipo">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
    </form>

    <div id="alerta-tabla" class="mt-4"></div>
</section>
@endsection

