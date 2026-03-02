@extends('layouts.app')

@section('title', 'Integracion IoT')
@section('page_key', 'integracion_iot')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Monitor IoT (webhook + cola)</h2>
    <p class="erp-panel-subtitulo">Consulta de eventos procesados y prueba manual de webhook firmado.</p>

    <form id="form-iot-evento" class="mt-4 grid gap-3 md:grid-cols-4">
        <input name="IdEvento" type="number" min="1" required class="erp-input" placeholder="ID Evento">
        <button class="erp-btn erp-btn--secundario">Consultar evento</button>
    </form>

    <div id="iot-mensaje" class="mt-3"></div>
    <div id="iot-detalle" class="mt-3"></div>
</section>

<section class="erp-panel">
    <div class="flex items-center justify-between gap-2">
        <h3 class="erp-panel-titulo">Eventos IoT</h3>
        <button id="btn-iot-cargar-eventos" class="erp-btn erp-btn--secundario">Actualizar</button>
    </div>

    <form id="form-iot-filtros" class="mt-3 grid gap-3 md:grid-cols-4">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Origen" class="erp-input" placeholder="Origen">
    </form>

    <div id="iot-eventos-tabla" class="mt-4"></div>
</section>

<section class="erp-panel">
    <h3 class="erp-panel-titulo">Prueba manual webhook</h3>
    <p class="erp-panel-subtitulo">Solo para pruebas internas. Si no envias headers, backend devolvera error de firma.</p>
    <form id="form-iot-webhook" class="mt-3 grid gap-3 md:grid-cols-2">
        <input name="EventId" class="erp-input" placeholder="X-IoT-EventId">
        <input name="Timestamp" class="erp-input" placeholder="X-IoT-Timestamp (unix)">
        <input name="Firma" class="erp-input" placeholder="X-IoT-Firma">
        <input name="Origen" class="erp-input" placeholder="X-IoT-Origen">
        <textarea name="Payload" class="erp-textarea md:col-span-2" rows="5" placeholder='{"MachineId":1,"Tipo":"stock.actualizado"}'></textarea>
        <button class="erp-btn erp-btn--primario md:col-span-2">Enviar webhook</button>
    </form>
</section>
@endsection

