@extends('layouts.app')

@section('title', 'Ubicaciones de maquina')
@section('page_key', 'ubicaciones')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Ubicacion y estado operativo</h2>
    <p class="erp-panel-subtitulo">Gestion completa de contexto de instalacion, online/offline y alertas tecnicas.</p>

    <form id="form-ubicacion-consulta" class="mt-4 grid gap-3 md:grid-cols-4">
        <select id="ubicacion-maquina" name="IdMaquina" class="erp-select"></select>
        <button id="btn-consultar-ubicacion" class="erp-btn erp-btn--secundario">Consultar ubicacion</button>
        <button id="btn-consultar-estado-operativo" type="button" class="erp-btn erp-btn--secundario">Consultar estado operativo</button>
        <button id="btn-consultar-historial-operativo" type="button" class="erp-btn erp-btn--secundario">Historial operativo</button>
    </form>

    <div id="ubicacion-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Editar ubicacion</h3>
        <form id="form-ubicacion-actualizar" class="erp-grid-campos mt-3">
            <input name="Latitud" class="erp-input" placeholder="Latitud">
            <input name="Longitud" class="erp-input" placeholder="Longitud">
            <input name="Direccion" class="erp-input" placeholder="Direccion">
            <input name="TipoLugarInstalacion" class="erp-input" placeholder="TipoLugarInstalacion">
            <select name="TieneEnergiaPropia" class="erp-select">
                <option value="">TieneEnergiaPropia</option>
                <option value="true">Si</option>
                <option value="false">No</option>
            </select>
            <input name="Convenio" class="erp-input" placeholder="Convenio">
            <input name="PlanActual" class="erp-input" placeholder="PlanActual">
            <input name="EstadoInstalacion" class="erp-input" placeholder="EstadoInstalacion">
            <input name="Version" required class="erp-input" placeholder="Version">
            <input name="Motivo" required class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--primario">Actualizar ubicacion</button>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Estado tecnico actual</h3>
        <form id="form-estado-operativo-actualizar" class="erp-grid-campos mt-3">
            <input name="EstadoOperativo" class="erp-input" placeholder="EstadoOperativo">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--primario">Actualizar estado operativo</button>
        </form>
        <div id="ubicacion-estado-detalle" class="mt-3"></div>
        <h4 class="mt-5 text-sm font-bold text-slate-700">Detalle de ubicacion</h4>
        <div id="ubicacion-detalle" class="mt-3"></div>
        <h4 class="mt-5 text-sm font-bold text-slate-700">Historial operativo</h4>
        <div id="ubicacion-historial" class="mt-3"></div>
    </article>
</section>
@endsection

