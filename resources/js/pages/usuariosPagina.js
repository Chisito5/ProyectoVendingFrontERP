import { aplicarEmpresaMaquinaEnFormulario, leerContextoActual, reaccionarCambiosContexto } from '../core/contextoPagina';
import { usuarioService } from '../services/usuarioService';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { confirmarAccion } from '../ui/confirmacion';
import { abrirDrawerDetalle } from '../ui/drawerDetalle';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa la pantalla de usuarios jerarquicos y maquinas asignadas.
 */
export function iniciarPaginaUsuarios() {
    const loFormularioCrear = buscar('#form-usuario-crear');
    const loFormularioActualizar = buscar('#form-usuario-actualizar');
    const loFormularioMaquina = buscar('#form-usuario-maquina');
    const loFormularioQuitarMaquina = buscar('#form-usuario-maquina-eliminar');
    const loFormularioFiltros = buscar('#form-usuarios-filtros');

    const loMensajeUsuarios = buscar('#usuarios-mensaje');
    const loMensajeMaquinas = buscar('#usuario-maquina-mensaje');
    const loRolActual = buscar('#usuario-rol-actual');
    const loResumenUsuarios = buscar('#usuarios-resumen');
    const loContenedorTabla = buscar('#usuarios-tabla');

    const loSelectUsuarioEdicion = buscar('#select-usuario-edicion');
    const loSelectUsuarioAsignar = buscar('#select-usuario-asignar');
    const loSelectUsuarioQuitar = buscar('#select-usuario-quitar');

    let loMetaUsuarios = {
        PaginaActual: 1,
        TotalPaginas: 1,
        TamanoPagina: 20,
        TotalRegistros: 0,
    };

    loSelectUsuarioEdicion?.addEventListener('change', async () => {
        await cargarContextoUsuarioEdicion(loSelectUsuarioEdicion.value);
    });

    aplicarEmpresaMaquinaEnFormulario(loFormularioCrear, { empresa: true, maquina: false });
    aplicarEmpresaMaquinaEnFormulario(loFormularioMaquina, { empresa: false, maquina: true });
    aplicarEmpresaMaquinaEnFormulario(loFormularioQuitarMaquina, { empresa: false, maquina: true });
    aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { empresa: true, maquina: false });

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioCrear, { empresa: true, maquina: false });
        aplicarEmpresaMaquinaEnFormulario(loFormularioMaquina, { empresa: false, maquina: true });
        aplicarEmpresaMaquinaEnFormulario(loFormularioQuitarMaquina, { empresa: false, maquina: true });
        aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { empresa: true, maquina: false });
        loFormularioFiltros?.querySelector('input[name="Pagina"]') && (loFormularioFiltros.querySelector('input[name="Pagina"]').value = 1);
        void cargarUsuarios();
    });

    loFormularioCrear?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioCrear.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Creando...');

        const loFormularioPayload = Object.fromEntries(new FormData(loFormularioCrear).entries());
        const tnRolId = Number(loFormularioPayload.RolId || 0);
        const tnEmpresa = Number(loFormularioPayload.Empresa || 0);
        if (!tnEmpresa) {
            renderizarMensaje(loMensajeUsuarios, { ok: false, mensaje: 'Seleccione una empresa activa en el header superior.' });
            setBotonCargando(loBoton, false);
            return;
        }

        const loPayload = {
            NombreUsuario: loFormularioPayload.NombreUsuario,
            Nombres: loFormularioPayload.Nombres,
            Clave: loFormularioPayload.Clave,
            Persona: Number(loFormularioPayload.Persona || 0) || null,
            Empresa: tnEmpresa,
            Estado: Number(loFormularioPayload.Estado || 0) || null,
            Rol: tnRolId > 0 ? [tnRolId] : [],
            Motivo: loFormularioPayload.Motivo || 'Alta de usuario',
        };

        const loResultado = await usuarioService.crear(loPayload);
        renderizarMensaje(loMensajeUsuarios, loResultado);

        if (loResultado.ok) {
            mostrarToast('Usuario creado.', 'ok');
            loFormularioCrear.reset();
            await cargarUsuarios();
        }

        setBotonCargando(loBoton, false);
    });

    buscar('#btn-usuario-actualizar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioActualizar).entries());
        if (!loPayload.IdUsuario || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeUsuarios, { ok: false, mensaje: 'Completa Usuario, Version y Motivo.' });
            return;
        }

        const loResultado = await usuarioService.actualizar(loPayload.IdUsuario, {
            Estado: Number(loPayload.Estado || 0),
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });

        renderizarMensaje(loMensajeUsuarios, loResultado);
        if (loResultado.ok) {
            mostrarToast('Usuario actualizado.', 'ok');
            await cargarUsuarios();
        }
    });

    buscar('#btn-usuario-rol-actualizar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioActualizar).entries());
        const tnRol = Number(loPayload.RolIdNuevo || 0);
        if (!loPayload.IdUsuario || !tnRol || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeUsuarios, { ok: false, mensaje: 'Completa Usuario, Rol nuevo, Version y Motivo.' });
            return;
        }

        const loResultado = await usuarioService.actualizarRol(loPayload.IdUsuario, {
            Version: loPayload.Version,
            Rol: [tnRol],
            Roles: [tnRol],
            Motivo: loPayload.Motivo,
        });

        renderizarMensaje(loMensajeUsuarios, loResultado);
        if (loResultado.ok) {
            mostrarToast('Rol actualizado.', 'ok');
            await cargarRolActual(loPayload.IdUsuario);
            await cargarUsuarios();
        }
    });

    buscar('#btn-usuario-eliminar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioActualizar).entries());
        if (!loPayload.IdUsuario || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeUsuarios, { ok: false, mensaje: 'Completa Usuario, Version y Motivo.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Inactivacion de usuario',
            mensaje: 'El usuario quedara inactivo pero auditado.',
            textoConfirmar: 'Inactivar',
        });

        if (!tlConfirmado) return;

        const loResultado = await usuarioService.eliminarLogico(loPayload.IdUsuario, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });

        renderizarMensaje(loMensajeUsuarios, loResultado);
        if (loResultado.ok) {
            mostrarToast('Usuario inactivado.', 'ok');
            await cargarUsuarios();
        }
    });

    buscar('#btn-usuario-detalle')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioActualizar).entries());
        if (!loPayload.IdUsuario) {
            renderizarMensaje(loMensajeUsuarios, { ok: false, mensaje: 'Selecciona un usuario.' });
            return;
        }

        const [loUsuario, loRol] = await Promise.all([
            usuarioService.obtener(loPayload.IdUsuario),
            usuarioService.obtenerRol(loPayload.IdUsuario),
        ]);

        if (loUsuario.ok) {
            abrirDrawerDetalle({
                titulo: `Usuario #${loPayload.IdUsuario}`,
                datos: {
                    Usuario: loUsuario.datos,
                    Rol: loRol.ok ? loRol.datos : loRol.mensaje,
                },
            });
            return;
        }

        renderizarMensaje(loMensajeUsuarios, loUsuario);
    });

    loFormularioMaquina?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioMaquina.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Asignando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioMaquina).entries());
        if (!loPayload.IdUsuario || !loPayload.IdMaquina) {
            renderizarMensaje(loMensajeMaquinas, { ok: false, mensaje: 'Seleccione usuario y una maquina activa en el header superior.' });
            setBotonCargando(loBoton, false);
            return;
        }
        const loResultado = await usuarioService.asignarMaquina(loPayload.IdUsuario, {
            Maquina: loPayload.IdMaquina,
            Motivo: loPayload.Motivo || 'Asignacion operativa',
        });

        renderizarMensaje(loMensajeMaquinas, loResultado);
        if (loResultado.ok) {
            mostrarToast('Maquina asignada.', 'ok');
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioQuitarMaquina?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioQuitarMaquina.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Quitando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioQuitarMaquina).entries());
        if (!loPayload.IdUsuario || !loPayload.IdMaquina || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeMaquinas, { ok: false, mensaje: 'Complete usuario, maquina activa en header, version y motivo.' });
            setBotonCargando(loBoton, false);
            return;
        }
        const loResultado = await usuarioService.quitarMaquina(loPayload.IdUsuario, loPayload.IdMaquina, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });

        renderizarMensaje(loMensajeMaquinas, loResultado);
        if (loResultado.ok) {
            mostrarToast('Asignacion removida.', 'ok');
        }

        setBotonCargando(loBoton, false);
    });

    buscar('#btn-cargar-usuarios')?.addEventListener('click', async () => {
        await cargarUsuarios();
    });
    buscar('#btn-buscar-usuarios')?.addEventListener('click', async () => {
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = 1;
        await cargarUsuarios();
    });
    buscar('#btn-limpiar-filtros-usuarios')?.addEventListener('click', async () => {
        loFormularioFiltros.reset();
        aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { empresa: true, maquina: false });
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = 1;
        loFormularioFiltros.querySelector('input[name="TamanoPagina"]').value = 20;
        await cargarUsuarios();
    });

    async function cargarUsuarios() {
        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);
        const loContexto = leerContextoActual();
        const tcBusqueda = [loFiltros.NombreUsuario, loFiltros.Nombres].filter(Boolean).join(' ').trim();
        if (tcBusqueda) {
            loFiltros.Busqueda = tcBusqueda;
        }
        if (loContexto.empresaId) {
            loFiltros.Empresa = loContexto.empresaId;
        }

        const loResultado = await usuarioService.listar(loFiltros);

        if (loResultado.ok) {
            const laDatos = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos);
            loMetaUsuarios = extraerMetaPaginacion(loResultado);
            llenarSelectUsuarios(laDatos);
            renderizarListadoOperativo(laDatos);
        }

        renderizarMensaje(loMensajeUsuarios, loResultado);
    }

    function renderizarListadoOperativo(laUsuarios) {
        if (!loContenedorTabla) return;

        const laFilas = laUsuarios.map((loUsuario) => {
            const tnUsuario = loUsuario.IdUsuario ?? loUsuario.Usuario ?? loUsuario.id;
            return {
                id: tnUsuario,
                nombreUsuario: loUsuario.NombreUsuario ?? '',
                nombres: loUsuario.Nombres ?? '',
                empresa: loUsuario.Empresa ?? loUsuario.IdEmpresa ?? '',
                estado: normalizarEstado(loUsuario.Estado),
                rol: normalizarRolTexto(loUsuario.RolActual ?? loUsuario.Rol ?? loUsuario.Roles),
                maquinas: normalizarMaquinasTexto(loUsuario.MaquinasAsignadas ?? loUsuario.Maquinas ?? loUsuario.Maquina),
            };
        });

        if (!laFilas.length) {
            loContenedorTabla.innerHTML = '<p class="text-sm text-slate-500">Sin usuarios para los filtros aplicados.</p>';
            loResumenUsuarios.innerHTML = '';
            return;
        }

        loResumenUsuarios.innerHTML = `
            <div class="flex flex-wrap gap-2 text-xs">
                <span class="erp-chip">Registros: ${loMetaUsuarios.TotalRegistros ?? laFilas.length}</span>
                <span class="erp-chip">Pagina: ${loMetaUsuarios.PaginaActual ?? 1}/${loMetaUsuarios.TotalPaginas ?? 1}</span>
                <span class="erp-chip">Mostrando: ${laFilas.length}</span>
            </div>
        `;

        const tcFilas = laFilas.map((loFila) => `
            <tr>
                <td>${escaparHtml(loFila.id)}</td>
                <td><strong>${escaparHtml(loFila.nombreUsuario)}</strong></td>
                <td>${escaparHtml(loFila.nombres)}</td>
                <td>${escaparHtml(loFila.empresa)}</td>
                <td><span class="erp-chip">${escaparHtml(loFila.estado)}</span></td>
                <td>${escaparHtml(loFila.rol)}</td>
                <td title="${escaparHtml(loFila.maquinas)}">${escaparHtml(resumirTexto(loFila.maquinas, 52))}</td>
                <td>
                    <button type="button" class="erp-btn erp-btn--secundario text-[11px]" data-usuario-ver="${escaparHtml(loFila.id)}">Ver</button>
                </td>
            </tr>
        `).join('');

        loContenedorTabla.innerHTML = `
            <div class="erp-tabla-container">
                <table class="erp-tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Empresa</th>
                            <th>Estado</th>
                            <th>Rol actual</th>
                            <th>Maquinas asignadas</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>${tcFilas}</tbody>
                </table>
            </div>
            <div class="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>Registros: <strong>${loMetaUsuarios.TotalRegistros ?? 0}</strong></span>
                <div class="flex gap-2">
                    <button type="button" class="erp-btn erp-btn--secundario" data-usuarios-anterior>Anterior</button>
                    <button type="button" class="erp-btn erp-btn--secundario" data-usuarios-siguiente>Siguiente</button>
                </div>
            </div>
        `;

        loContenedorTabla.querySelector('[data-usuarios-anterior]')?.addEventListener('click', async () => {
            const tnActual = Number(loMetaUsuarios.PaginaActual ?? 1);
            if (tnActual <= 1) return;
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnActual - 1;
            await cargarUsuarios();
        });

        loContenedorTabla.querySelector('[data-usuarios-siguiente]')?.addEventListener('click', async () => {
            const tnActual = Number(loMetaUsuarios.PaginaActual ?? 1);
            const tnTotal = Number(loMetaUsuarios.TotalPaginas ?? 1);
            if (tnActual >= tnTotal) return;
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnActual + 1;
            await cargarUsuarios();
        });

        loContenedorTabla.querySelectorAll('[data-usuario-ver]').forEach((loBoton) => {
            loBoton.addEventListener('click', async () => {
                const tnUsuario = loBoton.getAttribute('data-usuario-ver');
                const [loUsuario, loRol, loMaquinas] = await Promise.all([
                    usuarioService.obtener(tnUsuario),
                    usuarioService.obtenerRol(tnUsuario),
                    usuarioService.listarMaquinas(tnUsuario, { Pagina: 1, TamanoPagina: 100 }),
                ]);

                abrirDrawerDetalle({
                    titulo: `Perfil de usuario #${tnUsuario}`,
                    datos: {
                        Usuario: loUsuario.ok ? loUsuario.datos : loUsuario.mensaje,
                        Rol: loRol.ok ? loRol.datos : loRol.mensaje,
                        Maquinas: loMaquinas.ok ? loMaquinas.datos : loMaquinas.mensaje,
                    },
                });
            });
        });
    }

    async function cargarRolActual(tnUsuario) {
        if (!tnUsuario) {
            loRolActual.textContent = 'Seleccione un usuario...';
            return;
        }
        const loResultado = await usuarioService.obtenerRol(tnUsuario);
        loRolActual.textContent = loResultado.ok
            ? normalizarRolTexto(loResultado.datos)
            : `No disponible: ${loResultado.mensaje}`;
    }

    async function cargarContextoUsuarioEdicion(tnUsuario) {
        if (!tnUsuario) {
            loRolActual.textContent = 'Seleccione un usuario...';
            return;
        }

        const [loUsuario, loRol] = await Promise.all([
            usuarioService.obtener(tnUsuario),
            usuarioService.obtenerRol(tnUsuario),
        ]);

        loRolActual.textContent = loRol.ok
            ? normalizarRolTexto(loRol.datos)
            : `No disponible: ${loRol.mensaje}`;

        if (loUsuario.ok) {
            const loDatos = loUsuario.datos ?? {};
            const loCampoVersion = loFormularioActualizar.querySelector('input[name="Version"]');
            const loCampoEstado = loFormularioActualizar.querySelector('select[name="Estado"]');

            if (loCampoVersion) {
                loCampoVersion.value = loDatos.Version ?? loDatos.version ?? '';
            }

            if (loCampoEstado) {
                const txEstado = String(loDatos.Estado ?? loDatos.estado ?? '');
                if (txEstado !== '') {
                    loCampoEstado.value = txEstado;
                }
            }
        }
    }

    function llenarSelectUsuarios(laUsuarios) {
        const tcOpciones = laUsuarios.map((loUsuario) => {
            const tnId = loUsuario.IdUsuario ?? loUsuario.Usuario ?? loUsuario.id;
            const tcNombre = loUsuario.NombreUsuario ?? loUsuario.Nombres ?? `Usuario ${tnId}`;
            return `<option value="${tnId}">${tcNombre}</option>`;
        }).join('');

        const tcBase = `<option value="">Seleccione usuario...</option>${tcOpciones}`;
        loSelectUsuarioEdicion.innerHTML = tcBase;
        loSelectUsuarioAsignar.innerHTML = tcBase;
        loSelectUsuarioQuitar.innerHTML = tcBase;
    }

    function normalizarRolTexto(lxRol) {
        const laRoles = extraerRoles(lxRol);
        if (!laRoles.length) return 'Sin rol';
        return laRoles
            .map((loRol) => {
                const tcNombre = loRol.nombre || `Rol ${loRol.id}`;
                return `${tcNombre} (${loRol.id})`;
            })
            .join(', ');
    }

    function extraerRoles(lxRol) {
        if (lxRol === null || lxRol === undefined) return [];

        if (Array.isArray(lxRol)) {
            return lxRol.flatMap((loItem) => extraerRoles(loItem));
        }

        if (typeof lxRol === 'number' || typeof lxRol === 'string') {
            return [{ id: String(lxRol), nombre: '' }];
        }

        if (typeof lxRol === 'object') {
            if (Array.isArray(lxRol.Roles)) return extraerRoles(lxRol.Roles);
            if (Array.isArray(lxRol.Rol)) return extraerRoles(lxRol.Rol);

            const tnId = lxRol.Rol ?? lxRol.IdRol ?? lxRol.rol ?? lxRol.id ?? null;
            const tcNombre = lxRol.NombreRol ?? lxRol.RolNombre ?? lxRol.nombre ?? lxRol.Descripcion ?? '';
            if (tnId !== null) {
                return [{ id: String(tnId), nombre: String(tcNombre || '') }];
            }
        }

        return [];
    }

    function normalizarMaquinasTexto(lxMaquinas) {
        if (lxMaquinas === null || lxMaquinas === undefined || lxMaquinas === '') {
            return 'Sin asignacion';
        }

        if (typeof lxMaquinas === 'string') {
            return lxMaquinas;
        }

        if (Array.isArray(lxMaquinas)) {
            if (!lxMaquinas.length) return 'Sin asignacion';
            const laEtiquetas = lxMaquinas.map((loMaquina) => {
                if (typeof loMaquina === 'string' || typeof loMaquina === 'number') {
                    return String(loMaquina);
                }
                if (typeof loMaquina === 'object' && loMaquina) {
                    return loMaquina.CodigoMaquina
                        ?? loMaquina.NombreMaquina
                        ?? loMaquina.Nombre
                        ?? loMaquina.Maquina
                        ?? loMaquina.IdMaquina
                        ?? '';
                }
                return '';
            }).filter(Boolean);
            return laEtiquetas.length ? laEtiquetas.join(', ') : 'Sin asignacion';
        }

        if (typeof lxMaquinas === 'object') {
            const laDatos = convertirAArreglo(lxMaquinas.items ?? lxMaquinas.Rows ?? lxMaquinas.lista ?? lxMaquinas.data ?? lxMaquinas);
            return normalizarMaquinasTexto(laDatos);
        }

        return 'Sin asignacion';
    }

    function normalizarEstado(txEstado) {
        const tcValor = String(txEstado ?? '');
        if (tcValor === '1') return 'ACTIVO';
        if (tcValor === '2') return 'INACTIVO';
        return tcValor || 'N/D';
    }

    function resumirTexto(tcTexto, tnMaximo = 40) {
        if (!tcTexto) return '';
        return tcTexto.length > tnMaximo ? `${tcTexto.slice(0, tnMaximo)}...` : tcTexto;
    }

    function escaparHtml(tcTexto) {
        return String(tcTexto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    void cargarUsuarios();
}
