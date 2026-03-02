@extends('layouts.app')

@section('title', 'Mermas operativas')
@section('page_key', 'mermas')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Gestion de mermas</h2>
    <p class="erp-panel-subtitulo">Registro con evidencia, aprobacion/rechazo y ajuste controlado de stock.</p>

    <form id="form-merma" class="mt-4 grid gap-3 md:grid-cols-4">
        <input name="IdMerma" type="number" min="1" class="erp-input" placeholder="ID Merma (actualizar/inactivar/aprobar)">
        <input name="Maquina" type="number" min="1" class="erp-input" placeholder="Maquina">
        <input name="Celda" type="number" min="1" class="erp-input" placeholder="Celda">
        <input name="Producto" type="number" min="1" class="erp-input" placeholder="Producto">
        <input name="Lote" type="number" min="1" class="erp-input" placeholder="Lote">
        <input name="Cantidad" type="number" min="1" class="erp-input" placeholder="Cantidad">
        <input name="TipoMerma" class="erp-input" placeholder="TipoMerma">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Motivo" class="erp-input" placeholder="Motivo">
        <input name="Version" class="erp-input" placeholder="Version">
        <input name="Evidencia" class="erp-input" placeholder="Evidencia URL (opcional)">
        <input name="EvidenciaArchivo" type="file" class="erp-input" accept="image/*,application/pdf">

        <div class="md:col-span-4 flex flex-wrap gap-2">
            <button type="button" id="btn-merma-crear" class="erp-btn erp-btn--primario">Crear merma</button>
            <button type="button" id="btn-merma-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
            <button type="button" id="btn-merma-eliminar" class="erp-btn erp-btn--peligro">Inactivar merma</button>
            <button type="button" id="btn-merma-aprobar" class="erp-btn erp-btn--ok">Aprobar</button>
            <button type="button" id="btn-merma-rechazar" class="erp-btn erp-btn--peligro">Rechazar</button>
            <button type="button" id="btn-merma-detalle" class="erp-btn erp-btn--secundario">Ver detalle</button>
            <button type="button" id="btn-merma-subir-evidencia" class="erp-btn erp-btn--secundario">Subir evidencia</button>
        </div>
    </form>

    <div id="merma-mensaje" class="mt-3"></div>
</section>

<section class="erp-panel">
    <div class="flex items-center justify-between gap-2">
        <h3 class="erp-panel-titulo">Listado de mermas</h3>
        <button id="btn-merma-cargar" class="erp-btn erp-btn--secundario">Actualizar</button>
    </div>

    <form id="form-merma-filtros" class="mt-3 grid gap-3 md:grid-cols-6">
        <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
        <input name="Maquina" type="number" min="1" class="erp-input" placeholder="Maquina">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
        <input name="Busqueda" class="erp-input" placeholder="Busqueda">
    </form>

    <div id="merma-tabla" class="mt-4"></div>
</section>
@endsection

