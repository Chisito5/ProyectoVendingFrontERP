@extends('layouts.app')

@section('title', 'Usuarios jerarquicos')
@section('page_key', 'usuarios')

@section('content')
<section class="erp-panel">
    <h2 class="erp-panel-titulo">Jerarquia multiempresa</h2>
    <p class="erp-panel-subtitulo">Operacion guiada por seleccion: usuario, empresa, rol y maquina sin adivinar IDs.</p>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Crear usuario</h3>
        <form id="form-usuario-crear" class="erp-grid-campos mt-3">
            <input name="NombreUsuario" required class="erp-input" placeholder="NombreUsuario">
            <input name="Nombres" required class="erp-input" placeholder="Nombres">
            <input name="Clave" type="password" minlength="6" required class="erp-input" placeholder="Clave temporal (min 6)">
            <select name="Empresa" id="select-empresa-crear" class="erp-select"></select>
            <select name="RolId" class="erp-select">
                <option value="3">OPERADOR (3)</option>
                <option value="2">ADMIN (2)</option>
                <option value="1">DUENO (1)</option>
            </select>
            <input name="Persona" type="number" min="1" value="1" class="erp-input" placeholder="Persona">
            <input name="Estado" type="number" min="1" value="1" class="erp-input" placeholder="Estado">
            <input name="Motivo" class="erp-input" placeholder="Motivo (alta de usuario)">
            <button class="erp-btn erp-btn--primario">Crear usuario</button>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Actualizar usuario</h3>
        <form id="form-usuario-actualizar" class="erp-grid-campos mt-3">
            <select name="IdUsuario" id="select-usuario-edicion" class="erp-select"></select>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <p class="font-semibold">Rol actual del usuario:</p>
                <p id="usuario-rol-actual" class="mt-1">Seleccione un usuario...</p>
            </div>
            <select name="RolIdNuevo" class="erp-select">
                <option value="">Rol nuevo (opcional)</option>
                <option value="3">OPERADOR (3)</option>
                <option value="2">ADMIN (2)</option>
                <option value="1">DUENO (1)</option>
            </select>
            <select name="Estado" class="erp-select">
                <option value="1">ACTIVO (1)</option>
                <option value="2">INACTIVO (2)</option>
            </select>
            <input name="Version" required readonly class="erp-input bg-slate-100" placeholder="Version (autocompletada)">
            <input name="Motivo" required class="erp-input" placeholder="Motivo">
            <div class="flex flex-wrap gap-2">
                <button type="button" id="btn-usuario-actualizar" class="erp-btn erp-btn--secundario">Actualizar</button>
                <button type="button" id="btn-usuario-rol-actualizar" class="erp-btn erp-btn--secundario">Actualizar rol</button>
                <button type="button" id="btn-usuario-eliminar" class="erp-btn erp-btn--peligro">Inactivar usuario</button>
                <button type="button" id="btn-usuario-detalle" class="erp-btn erp-btn--secundario">Ver detalle</button>
            </div>
        </form>
        <div id="usuarios-mensaje" class="mt-3"></div>
    </article>
</section>

<section class="grid gap-4 xl:grid-cols-2">
    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Asignar maquina</h3>
        <form id="form-usuario-maquina" class="erp-grid-campos mt-3">
            <select name="IdUsuario" id="select-usuario-asignar" class="erp-select"></select>
            <select name="IdMaquina" id="select-maquina-asignar" class="erp-select"></select>
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--primario">Asignar maquina</button>
        </form>
    </article>

    <article class="erp-panel">
        <h3 class="erp-panel-titulo">Quitar maquina de usuario</h3>
        <form id="form-usuario-maquina-eliminar" class="erp-grid-campos mt-3">
            <select name="IdUsuario" id="select-usuario-quitar" class="erp-select"></select>
            <select name="IdMaquina" id="select-maquina-quitar" class="erp-select"></select>
            <input name="Version" class="erp-input" placeholder="Version">
            <input name="Motivo" class="erp-input" placeholder="Motivo">
            <button class="erp-btn erp-btn--peligro">Quitar maquina</button>
        </form>
        <div id="usuario-maquina-mensaje" class="mt-3"></div>
    </article>
</section>

<section class="erp-panel">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
            <h3 class="erp-panel-titulo">Listado operativo de usuarios</h3>
            <p class="erp-panel-subtitulo">Incluye rol actual y maquinas asignadas por usuario.</p>
        </div>
        <div class="flex gap-2">
            <button id="btn-buscar-usuarios" class="erp-btn erp-btn--primario">Buscar</button>
            <button id="btn-limpiar-filtros-usuarios" class="erp-btn erp-btn--secundario">Limpiar</button>
            <button id="btn-cargar-usuarios" class="erp-btn erp-btn--secundario">Actualizar</button>
        </div>
    </div>

    <form id="form-usuarios-filtros" class="mt-3 grid gap-3 md:grid-cols-8">
        <input name="Usuario" type="number" min="1" class="erp-input" placeholder="ID Usuario">
        <input name="NombreUsuario" class="erp-input" placeholder="NombreUsuario">
        <input name="Nombres" class="erp-input" placeholder="Nombres">
        <input name="Empresa" type="number" min="1" class="erp-input" placeholder="Empresa">
        <input name="Estado" class="erp-input" placeholder="Estado">
        <input name="Rol" class="erp-input" placeholder="Rol">
        <input name="Pagina" type="number" min="1" value="1" class="erp-input">
        <input name="TamanoPagina" type="number" min="5" value="20" class="erp-input">
    </form>

    <div id="usuarios-resumen" class="mt-3"></div>
    <div id="usuarios-tabla" class="mt-4"></div>
</section>
@endsection

