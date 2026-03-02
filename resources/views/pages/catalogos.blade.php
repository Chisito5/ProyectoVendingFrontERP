@extends('layouts.app')

@section('title', 'Catalogos y CRUD critico')
@section('page_key', 'catalogos')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">CRUD de maestros criticos</h2>
    <p class="erp-panel-subtitulo">Empresa, maquina, celda, producto, planograma y lote con versionado, inactivacion logica, aprobacion y auditoria.</p>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Empresa</h3>
        <form id="form-create-company" class="erp-grid-campos mt-3">
            <input name="CodigoEmpresa" required placeholder="CodigoEmpresa" class="erp-input">
            <input name="RazonSocial" required placeholder="RazonSocial" class="erp-input">
            <input name="NombreComercial" required placeholder="NombreComercial" class="erp-input">
            <input name="Nit" required placeholder="Nit" class="erp-input">
            <input name="Telefono" placeholder="Telefono" class="erp-input">
            <input name="Correo" type="email" placeholder="Correo" class="erp-input">
            <input name="DireccionFiscal" placeholder="DireccionFiscal" class="erp-input">
            <select name="TipoEmpresa" id="company-tipoempresa" class="erp-select"></select>
            <select name="Estado" id="company-estado" class="erp-select"></select>
            <input name="Usr" type="number" value="1" min="1" class="erp-input">
            <button class="erp-btn erp-btn--primario">Crear empresa</button>
        </form>

        <form id="form-update-company" class="erp-grid-campos mt-4 border-t pt-4">
            <p class="text-xs font-semibold text-slate-600">Actualizar / inactivar (concurrencia + motivo)</p>
            <input name="IdEmpresa" type="number" min="1" required placeholder="ID Empresa" class="erp-input">
            <input name="Version" required placeholder="Version" class="erp-input">
            <input name="Motivo" required placeholder="Motivo del cambio" class="erp-input">
            <div class="flex gap-2">
                <button type="button" id="btn-update-company" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-delete-company" class="erp-btn erp-btn--peligro">Inactivar</button>
                <button type="button" id="btn-company-history" class="erp-btn erp-btn--secundario">Historial</button>
            </div>
        </form>

        <div id="company-message" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Maquina y celda</h3>
        <form id="form-maquina-crud" class="erp-grid-campos mt-3">
            <input name="IdMaquina" type="number" min="1" placeholder="ID Maquina (para actualizar/inactivar)" class="erp-input">
            <input name="CodigoMaquina" placeholder="CodigoMaquina" class="erp-input">
            <input name="NumeroSerie" placeholder="NumeroSerie" class="erp-input">
            <input name="Marca" placeholder="Marca" class="erp-input">
            <input name="Modelo" placeholder="Modelo" class="erp-input">
            <input name="IdentificadorConexion" placeholder="IdentificadorConexion" class="erp-input">
            <input name="TipoInternet" placeholder="TipoInternet (id o codigo)" class="erp-input">
            <input name="ConsumoKwhMensual" type="number" step="0.01" min="0" placeholder="ConsumoKwhMensual" class="erp-input">
            <input name="TipoLugarInstalacion" placeholder="TipoLugarInstalacion (id o codigo)" class="erp-input">
            <input name="UbicacionActual" placeholder="UbicacionActual" class="erp-input">
            <input name="FilasMatriz" type="number" min="1" placeholder="FilasMatriz" class="erp-input">
            <input name="ColumnasMatriz" type="number" min="1" placeholder="ColumnasMatriz" class="erp-input">
            <input name="Estado" placeholder="Estado" class="erp-input">
            <input name="Version" placeholder="Version" class="erp-input">
            <input name="Motivo" placeholder="Motivo" class="erp-input">
            <div class="flex gap-2">
                <button type="button" id="btn-create-machine" class="erp-btn erp-btn--primario">Crear</button>
                <button type="button" id="btn-update-machine" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-delete-machine" class="erp-btn erp-btn--peligro">Inactivar</button>
            </div>
        </form>

        <div class="mt-3 flex gap-2">
            <button id="btn-load-machines" class="erp-btn erp-btn--secundario">Cargar maquinas</button>
            <select id="machine-select-catalog" class="erp-select"></select>
            <button id="btn-load-cells" class="erp-btn erp-btn--secundario">Ver celdas</button>
        </div>

        <div id="machines-table" class="mt-3"></div>
        <div id="cells-table" class="mt-3"></div>
    </article>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Producto</h3>
        <form id="form-product-crud" class="erp-grid-campos mt-3">
            <input name="IdProducto" type="number" min="1" placeholder="ID Producto (actualizar/inactivar)" class="erp-input">
            <input name="CodigoProducto" placeholder="CodigoProducto" class="erp-input">
            <input name="Nombre" placeholder="Nombre" class="erp-input">
            <input name="Version" placeholder="Version" class="erp-input">
            <input name="Motivo" placeholder="Motivo" class="erp-input">
            <div class="flex gap-2">
                <button type="button" id="btn-create-product" class="erp-btn erp-btn--primario">Crear</button>
                <button type="button" id="btn-update-product" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-delete-product" class="erp-btn erp-btn--peligro">Inactivar</button>
            </div>
        </form>

        <div class="mt-3 flex gap-2">
            <input id="product-company-filter" type="number" min="1" placeholder="Empresa (opcional)" class="erp-input">
            <button id="btn-load-products" class="erp-btn erp-btn--secundario">Cargar productos</button>
        </div>
        <div id="products-table" class="mt-3"></div>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Aprobaciones y auditoria</h3>
        <form id="form-approval-request" class="erp-grid-campos mt-3">
            <input name="Entidad" placeholder="Entidad (MAQUINA, PLANOGRAMA, LOTE...)" class="erp-input">
            <input name="EntidadId" type="number" min="1" placeholder="EntidadId" class="erp-input">
            <input name="Accion" placeholder="Accion solicitada" class="erp-input">
            <input name="Motivo" placeholder="Motivo de aprobacion" class="erp-input">
            <button id="btn-request-approval" class="erp-btn erp-btn--primario">Solicitar aprobacion</button>
        </form>

        <form id="form-audit-query" class="erp-grid-campos mt-4 border-t pt-4">
            <input name="Entidad" placeholder="Entidad auditoria" class="erp-input">
            <input name="EntidadId" type="number" min="1" placeholder="EntidadId" class="erp-input">
            <button id="btn-audit-query" class="erp-btn erp-btn--secundario">Consultar auditoria</button>
        </form>

        <div id="approval-message" class="mt-3"></div>
        <div id="audit-table" class="mt-3"></div>
    </article>
</section>

<section class="erp-panel">
    <h3 class="erp-panel-titulo">Listado empresas</h3>
    <div class="mt-3 flex gap-2">
        <button id="btn-load-companies" class="erp-btn erp-btn--secundario">Cargar empresas</button>
    </div>
    <div id="companies-table" class="mt-3"></div>
</section>
@endsection

