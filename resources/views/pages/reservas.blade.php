@extends('layouts.app')

@section('title', 'Reservas operativas')
@section('page_key', 'reservas')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Flujo de reservas</h2>
    <p class="erp-panel-subtitulo">Paso 1 crear reserva. Paso 2 confirmar o cancelar con trazabilidad y control de expiracion.</p>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Crear reserva</h3>
        <form id="form-create-reservation" class="erp-grid-campos mt-3">
            <select name="Maquina" id="reservation-machine-select" class="erp-select"></select>
            <input name="CodigoSeleccion" required placeholder="CodigoSeleccion" class="erp-input">
            <input name="Cantidad" type="number" required min="1" value="1" class="erp-input">
            <input name="ExpiraSegundos" type="number" required min="30" value="120" class="erp-input">
            <button id="btn-create-reservation" class="erp-btn erp-btn--primario">Crear reserva</button>
        </form>
        <div id="reservation-message" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Reserva actual</h3>
        <div id="reservation-current" class="mt-3 text-sm text-slate-700">Sin reserva activa en pantalla.</div>
        <div class="mt-4 grid gap-2 md:grid-cols-2">
            <button id="btn-confirm-reservation" class="erp-btn erp-btn--ok" disabled>Confirmar</button>
            <button id="btn-cancel-reservation" class="erp-btn erp-btn--peligro" disabled>Cancelar</button>
        </div>
        <input id="reservation-cancel-reason" placeholder="Motivo cancelacion" class="erp-input mt-2">
        <div id="reservation-action-message" class="mt-3"></div>
    </article>
</section>
@endsection

