@extends('layouts.app')

@section('title', 'Productos')
@section('page_key', 'productos')

@section('content')
<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h2 class="erp-panel-titulo">Gestion de productos</h2>
            <p class="erp-panel-subtitulo">Alta de producto con dimensiones fisicas, orientacion y galeria multimedia.</p>
        </div>
        <div class="flex gap-2">
            <button id="btn-productos-listar" class="erp-btn erp-btn--secundario">Actualizar listado</button>
        </div>
    </div>

    <form id="form-producto" class="mt-3 grid gap-3 md:grid-cols-4">
        <input name="IdProducto" type="number" min="1" class="erp-input" placeholder="ID Producto (actualizar/inactivar)">
        <input name="NombreProducto" class="erp-input" placeholder="Nombre del producto" required>
        <input name="CodigoProducto" class="erp-input" placeholder="Codigo interno">
        <input name="Precio" type="number" step="0.01" min="0" class="erp-input" placeholder="Precio">
        <input name="AnchoMm" type="number" min="1" class="erp-input" placeholder="Ancho (mm)">
        <input name="AltoMm" type="number" min="1" class="erp-input" placeholder="Alto (mm)">
        <input name="ProfundidadMm" type="number" min="1" class="erp-input" placeholder="Profundidad (mm)">
        <input name="PesoGr" type="number" min="1" class="erp-input" placeholder="Peso (gr)">
        <select name="Orientacion" class="erp-select">
            <option value="">Orientacion</option>
            <option value="VERTICAL">Vertical</option>
            <option value="HORIZONTAL">Horizontal</option>
        </select>
        <select name="PermiteGiro" class="erp-select">
            <option value="">Permite giro</option>
            <option value="true">Si</option>
            <option value="false">No</option>
        </select>
        <input name="UnidadEmpaque" class="erp-input" placeholder="Unidad de empaque">
        <input name="Version" class="erp-input" placeholder="Version">
        <input name="Motivo" class="erp-input md:col-span-2" placeholder="Motivo">
        <div class="md:col-span-2 flex flex-wrap gap-2">
            <button type="button" id="btn-producto-crear" class="erp-btn erp-btn--primario">Crear producto</button>
            <button type="button" id="btn-producto-actualizar" class="erp-btn erp-btn--secundario">Actualizar producto</button>
            <button type="button" id="btn-producto-inactivar" class="erp-btn erp-btn--peligro">Inactivar producto</button>
        </div>
    </form>

    <div id="productos-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Galeria de imagenes</h3>
        <form id="form-producto-galeria" class="erp-grid-campos mt-3">
            <input name="IdProducto" type="number" min="1" required class="erp-input" placeholder="ID Producto">
            <select name="TipoImagen" class="erp-select">
                <option value="">Tipo de imagen</option>
                <option value="FRENTE">Frente</option>
                <option value="REVERSO">Reverso</option>
                <option value="ANVERSO">Anverso</option>
                <option value="DETALLE">Detalle</option>
                <option value="FONDO">Fondo</option>
                <option value="OFERTA">Oferta</option>
            </select>
            <textarea name="ImagenesUrl" rows="4" class="erp-textarea" placeholder="URLs de imagen (una por linea)"></textarea>
            <input name="ImagenesArchivo" type="file" class="erp-input" accept="image/*" multiple>
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <div class="flex flex-wrap gap-2">
                <button type="button" id="btn-galeria-cargar" class="erp-btn erp-btn--secundario">Cargar galeria</button>
                <button type="button" id="btn-galeria-subir" class="erp-btn erp-btn--primario">Subir imagenes</button>
            </div>
        </form>
        <div id="productos-galeria" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Listado de productos</h3>
        <form id="form-productos-filtros" class="mt-3 grid gap-3 md:grid-cols-2">
            <input name="Busqueda" class="erp-input" placeholder="Busqueda">
            <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
            <input name="Pagina" type="number" min="1" value="1" class="erp-input">
            <input name="TamanoPagina" type="number" min="10" value="20" class="erp-input">
        </form>
        <div id="productos-tabla" class="mt-3"></div>
    </article>
</section>
@endsection
