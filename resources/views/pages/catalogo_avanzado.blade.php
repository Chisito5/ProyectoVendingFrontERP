@extends('layouts.app')

@section('title', 'Catalogo avanzado')
@section('page_key', 'catalogo_avanzado')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">ProductoFamilia, ProductoGrupo, ProductoSubgrupo y multimedia</h2>
    <p class="erp-panel-subtitulo">Estructura comercial avanzada para clasificacion y presentacion de producto.</p>
</section>

<section class="grid gap-4 xl:grid-cols-3">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Familia</h3>
        <form id="form-familia" class="erp-grid-campos mt-3">
            <input name="Id" type="number" min="1" class="erp-input" placeholder="Id (actualizar/inactivar)">
            <input name="Nombre" required class="erp-input" placeholder="Nombre">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex gap-2">
                <button type="button" id="btn-familia-crear" class="erp-btn erp-btn--primario">Crear</button>
                <button type="button" id="btn-familia-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-familia-eliminar" class="erp-btn erp-btn--peligro">Eliminar logico</button>
            </div>
        </form>
        <div id="catalogo-avanzado-mensaje" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Grupo</h3>
        <form id="form-grupo" class="erp-grid-campos mt-3">
            <input name="Id" type="number" min="1" class="erp-input" placeholder="Id (actualizar/inactivar)">
            <input name="Familia" type="number" min="1" class="erp-input" placeholder="Familia">
            <input name="Nombre" required class="erp-input" placeholder="Nombre">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex gap-2">
                <button type="button" id="btn-grupo-crear" class="erp-btn erp-btn--primario">Crear</button>
                <button type="button" id="btn-grupo-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-grupo-eliminar" class="erp-btn erp-btn--peligro">Eliminar logico</button>
            </div>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Subgrupo</h3>
        <form id="form-subgrupo" class="erp-grid-campos mt-3">
            <input name="Id" type="number" min="1" class="erp-input" placeholder="Id (actualizar/inactivar)">
            <input name="Grupo" type="number" min="1" class="erp-input" placeholder="Grupo">
            <input name="Nombre" required class="erp-input" placeholder="Nombre">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex gap-2">
                <button type="button" id="btn-subgrupo-crear" class="erp-btn erp-btn--primario">Crear</button>
                <button type="button" id="btn-subgrupo-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-subgrupo-eliminar" class="erp-btn erp-btn--peligro">Eliminar logico</button>
            </div>
        </form>
    </article>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <div class="flex items-center justify-between gap-2">
            <h3 class="erp-panel-titulo">Listados de taxonomia</h3>
            <button id="btn-cargar-taxonomia" class="erp-btn erp-btn--secundario">Actualizar</button>
        </div>
        <h4 class="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Familias</h4>
        <div id="tabla-familia" class="mt-2"></div>
        <h4 class="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Grupos</h4>
        <div id="tabla-grupo" class="mt-2"></div>
        <h4 class="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Subgrupos</h4>
        <div id="tabla-subgrupo" class="mt-2"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Imagenes de producto</h3>
        <form id="form-imagen-producto" class="erp-grid-campos mt-3">
            <input name="IdProducto" type="number" min="1" required class="erp-input" placeholder="ID Producto">
            <input name="IdImagen" type="number" min="1" class="erp-input" placeholder="ID Imagen (actualizar/inactivar)">
            <select name="Tipo" class="erp-select">
                <option value="frente">frente</option>
                <option value="reverso">reverso</option>
                <option value="anverso">anverso</option>
                <option value="detalle">detalle</option>
            </select>
            <input name="Url" class="erp-input" placeholder="URL imagen o referencia">
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex flex-wrap gap-2">
                <button type="button" id="btn-imagen-listar" class="erp-btn erp-btn--secundario">Listar</button>
                <button type="button" id="btn-imagen-crear" class="erp-btn erp-btn--primario">Crear</button>
                <button type="button" id="btn-imagen-subir" class="erp-btn erp-btn--secundario">Subir a producto</button>
                <button type="button" id="btn-imagen-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-imagen-eliminar" class="erp-btn erp-btn--peligro">Eliminar logico</button>
            </div>
        </form>

        <div id="tabla-imagenes" class="mt-3"></div>
    </article>
</section>
@endsection

