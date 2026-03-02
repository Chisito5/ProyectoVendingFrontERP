@extends('layouts.app')

@section('title', 'Anuncios comerciales')
@section('page_key', 'anuncios')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Anuncios comerciales</h2>
    <p class="erp-panel-subtitulo">CRUD, asignaciones y control de publicacion/detencion con trazabilidad.</p>

    <form id="form-anuncio" class="mt-4 grid gap-3 md:grid-cols-4">
        <input name="IdAnuncio" type="number" min="1" class="erp-input" placeholder="ID Anuncio (actualizar/inactivar)">
        <input name="Nombre" required class="erp-input" placeholder="Nombre">
        <input name="TextoPromo" class="erp-input" placeholder="TextoPromo">
        <input name="Prioridad" type="number" min="1" value="1" class="erp-input" placeholder="Prioridad">
        <input name="Fondo" class="erp-input" placeholder="Fondo">
        <input name="Sticker" class="erp-input" placeholder="Sticker">
        <input name="FechaDesde" type="date" class="erp-input">
        <input name="FechaHasta" type="date" class="erp-input">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Version" class="erp-input" placeholder="Version">
        <input name="Motivo" class="erp-input" placeholder="Motivo">
        <div class="md:col-span-4 flex flex-wrap gap-2">
            <button type="button" id="btn-anuncio-crear" class="erp-btn erp-btn--primario">Crear</button>
            <button type="button" id="btn-anuncio-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
            <button type="button" id="btn-anuncio-eliminar" class="erp-btn erp-btn--peligro">Inactivar anuncio</button>
            <button type="button" id="btn-anuncio-publicar" class="erp-btn erp-btn--ok">Publicar</button>
            <button type="button" id="btn-anuncio-detener" class="erp-btn erp-btn--peligro">Detener</button>
            <button type="button" id="btn-anuncio-detalle" class="erp-btn erp-btn--secundario">Ver detalle</button>
        </div>
    </form>

    <div id="anuncio-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Asignar productos</h3>
        <form id="form-anuncio-productos" class="erp-grid-campos mt-3">
            <input name="IdAnuncio" type="number" min="1" required class="erp-input" placeholder="ID Anuncio">
            <input name="Productos" class="erp-input" placeholder="Productos CSV: 10,11,12">
            <input name="IdProductoQuitar" type="number" min="1" class="erp-input" placeholder="ID Producto para quitar">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex gap-2">
                <button class="erp-btn erp-btn--secundario">Asignar productos</button>
                <button type="button" data-quitar-producto class="erp-btn erp-btn--peligro">Quitar producto</button>
            </div>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Asignar maquinas</h3>
        <form id="form-anuncio-maquinas" class="erp-grid-campos mt-3">
            <input name="IdAnuncio" type="number" min="1" required class="erp-input" placeholder="ID Anuncio">
            <input name="Maquinas" class="erp-input" placeholder="Maquinas CSV: 1,2,3">
            <input name="IdMaquinaQuitar" type="number" min="1" class="erp-input" placeholder="ID Maquina para quitar">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex gap-2">
                <button class="erp-btn erp-btn--secundario">Asignar maquinas</button>
                <button type="button" data-quitar-maquina class="erp-btn erp-btn--peligro">Quitar maquina</button>
            </div>
        </form>
    </article>
</section>

<section class="erp-panel">
    <div class="flex items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Listado de anuncios</h3>
            <p class="erp-panel-subtitulo">Consulta por empresa/estado y paginacion del servidor.</p>
        </div>
        <button id="btn-anuncio-cargar" class="erp-btn erp-btn--secundario">Actualizar</button>
    </div>

    <form id="form-anuncio-filtros" class="mt-3 grid gap-3 md:grid-cols-5">
        <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
        <input name="Busqueda" class="erp-input" placeholder="Busqueda">
    </form>

    <div id="anuncio-tabla" class="mt-4"></div>
</section>
@endsection

