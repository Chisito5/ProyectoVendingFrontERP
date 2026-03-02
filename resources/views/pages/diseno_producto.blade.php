@extends('layouts.app')

@section('title', 'Diseno de producto')
@section('page_key', 'diseno_producto')

@section('content')
<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h2 class="erp-panel-titulo">Editor por capas 2D</h2>
            <p class="erp-panel-subtitulo">Compone fondo, oferta y elementos visuales por producto.</p>
        </div>
        <div class="flex gap-2">
            <button id="btn-diseno-cargar" class="erp-btn erp-btn--secundario">Cargar diseno</button>
            <button id="btn-diseno-guardar" class="erp-btn erp-btn--primario">Guardar diseno</button>
            <button id="btn-diseno-preview" class="erp-btn erp-btn--secundario">Render preview</button>
        </div>
    </div>

    <form id="form-diseno-producto" class="mt-3 grid gap-3 md:grid-cols-6">
        <input name="IdProducto" type="number" min="1" required class="erp-input" placeholder="ID Producto">
        <input name="AnchoLienzo" type="number" min="300" value="900" class="erp-input" placeholder="Ancho lienzo">
        <input name="AltoLienzo" type="number" min="200" value="500" class="erp-input" placeholder="Alto lienzo">
        <input name="Version" class="erp-input" placeholder="Version">
        <input name="Motivo" class="erp-input md:col-span-2" placeholder="Motivo">
    </form>

    <div id="diseno-mensaje" class="mt-3"></div>
</section>

<section class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Lienzo de composicion</h3>
        <div class="mt-3 overflow-auto rounded border border-slate-300 bg-slate-100 p-3">
            <canvas id="diseno-canvas" width="900" height="500" class="mx-auto block rounded border border-slate-300 bg-white"></canvas>
        </div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Capas</h3>
        <div class="mt-2 flex flex-wrap gap-2">
            <button id="btn-capa-fondo" class="erp-btn erp-btn--secundario">Agregar fondo</button>
            <button id="btn-capa-oferta" class="erp-btn erp-btn--secundario">Agregar oferta</button>
            <button id="btn-capa-texto" class="erp-btn erp-btn--secundario">Agregar texto</button>
            <button id="btn-capa-eliminar" class="erp-btn erp-btn--peligro">Eliminar capa</button>
        </div>

        <div id="diseno-lista-capas" class="mt-3"></div>

        <form id="form-capa-propiedades" class="erp-grid-campos mt-3">
            <input name="CapaId" class="erp-input" placeholder="ID capa">
            <input name="Recurso" class="erp-input" placeholder="URL recurso (imagen)">
            <input name="Texto" class="erp-input" placeholder="Texto">
            <input name="X" type="number" class="erp-input" placeholder="X">
            <input name="Y" type="number" class="erp-input" placeholder="Y">
            <input name="Ancho" type="number" class="erp-input" placeholder="Ancho">
            <input name="Alto" type="number" class="erp-input" placeholder="Alto">
            <input name="Opacidad" type="number" min="0" max="1" step="0.1" value="1" class="erp-input" placeholder="Opacidad">
            <input name="Rotacion" type="number" step="1" class="erp-input" placeholder="Rotacion">
            <input name="Color" class="erp-input" placeholder="Color texto (#ffffff)">
            <button type="button" id="btn-capa-aplicar" class="erp-btn erp-btn--primario">Aplicar propiedades</button>
        </form>
    </article>
</section>
@endsection
