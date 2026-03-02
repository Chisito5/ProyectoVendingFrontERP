import { aprobacionService } from '../services/aprobacionService';
import { auditoriaService } from '../services/auditoriaService';
import { catalogoService } from '../services/catalogoService';
import { empresaService } from '../services/empresaService';
import { maquinaService } from '../services/maquinaService';
import { productoService } from '../services/productoService';
import { aEntero, convertirAArreglo } from '../utils/datos';
import { buscar, renderizarMensaje, renderizarTablaDatos, setBotonCargando } from '../utils/dom';
import { confirmarAccion } from '../ui/confirmacion';
import { abrirDrawerDetalle } from '../ui/drawerDetalle';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa CRUD de catalogos con controles criticos.
 */
export function iniciarPaginaCatalogos() {
    const loFormularioEmpresa = buscar('#form-create-company');
    const loFormularioUpdateEmpresa = buscar('#form-update-company');
    const loFormularioMaquina = buscar('#form-maquina-crud');
    const loFormularioProducto = buscar('#form-product-crud');
    const loFormularioAprobacion = buscar('#form-approval-request');
    const loFormularioAuditoria = buscar('#form-audit-query');

    const loMensajeEmpresa = buscar('#company-message');
    const loMensajeAprobacion = buscar('#approval-message');

    const loSelectTipoEmpresa = buscar('#company-tipoempresa');
    const loSelectEstado = buscar('#company-estado');
    const loSelectMaquina = buscar('#machine-select-catalog');

    const loTablaEmpresas = buscar('#companies-table');
    const loTablaMaquinas = buscar('#machines-table');
    const loTablaCeldas = buscar('#cells-table');
    const loTablaProductos = buscar('#products-table');
    const loTablaAuditoria = buscar('#audit-table');

    buscar('#btn-load-companies')?.addEventListener('click', cargarEmpresas);
    buscar('#btn-load-machines')?.addEventListener('click', cargarMaquinas);
    buscar('#btn-load-cells')?.addEventListener('click', cargarCeldas);
    buscar('#btn-load-products')?.addEventListener('click', cargarProductos);

    loFormularioEmpresa?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioEmpresa.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true);

        const loPayload = Object.fromEntries(new FormData(loFormularioEmpresa).entries());
        loPayload.TipoEmpresa = aEntero(loPayload.TipoEmpresa, 0);
        loPayload.Estado = aEntero(loPayload.Estado, 0);
        loPayload.Usr = aEntero(loPayload.Usr, 1);
        loPayload.PlantillaVisualPredeterminada = null;

        const loResultado = await empresaService.crear(loPayload);
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Empresa creada.', 'ok');
            loFormularioEmpresa.reset();
            await cargarEmpresas();
        } else {
            mostrarToast(loResultado.mensaje || 'No se pudo crear empresa.', 'error');
        }

        setBotonCargando(loBoton, false);
    });

    buscar('#btn-update-company')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioUpdateEmpresa).entries());
        if (!loPayload.IdEmpresa || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Completa IdEmpresa, Version y Motivo para actualizar.' });
            return;
        }

        const loResultado = await empresaService.actualizar(loPayload.IdEmpresa, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Empresa actualizada.', 'ok');
            await cargarEmpresas();
        }
    });

    buscar('#btn-delete-company')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioUpdateEmpresa).entries());
        if (!loPayload.IdEmpresa || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Completa IdEmpresa, Version y Motivo para inactivar.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Inactivacion de empresa',
            mensaje: 'La empresa quedara inactiva/anulada pero no se eliminara fisicamente.',
            textoConfirmar: 'Aplicar inactivacion',
        });
        if (!tlConfirmado) return;

        const loResultado = await empresaService.eliminarLogico(loPayload.IdEmpresa, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Inactivacion aplicada.', 'ok');
            await cargarEmpresas();
        }
    });

    buscar('#btn-company-history')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioUpdateEmpresa).entries());
        if (!loPayload.IdEmpresa) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Ingresa IdEmpresa para ver historial.' });
            return;
        }

        const loResultado = await empresaService.historial(loPayload.IdEmpresa);
        if (loResultado.ok) {
            abrirDrawerDetalle({
                titulo: `Historial empresa #${loPayload.IdEmpresa}`,
                datos: loResultado.datos,
            });
        } else {
            renderizarMensaje(loMensajeEmpresa, loResultado);
        }
    });

    buscar('#btn-create-machine')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioMaquina).entries());
        const loResultado = await maquinaService.crear(construirPayloadMaquina(loPayload));
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Maquina creada.', 'ok');
            await cargarMaquinas();
        }
    });

    buscar('#btn-update-machine')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioMaquina).entries());
        if (!loPayload.IdMaquina || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Completa IdMaquina, Version y Motivo.' });
            return;
        }
        const loResultado = await maquinaService.actualizar(loPayload.IdMaquina, construirPayloadMaquina(loPayload));
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Maquina actualizada.', 'ok');
            await cargarMaquinas();
        }
    });

    buscar('#btn-delete-machine')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioMaquina).entries());
        if (!loPayload.IdMaquina || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Completa IdMaquina, Version y Motivo.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Inactivacion de maquina',
            mensaje: 'La maquina quedara desactivada. Esta accion requiere auditoria.',
            textoConfirmar: 'Desactivar',
        });
        if (!tlConfirmado) return;

        const loResultado = await maquinaService.eliminarLogico(loPayload.IdMaquina, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Maquina desactivada.', 'ok');
            await cargarMaquinas();
        }
    });

    buscar('#btn-create-product')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioProducto).entries());
        const loResultado = await productoService.crear(loPayload);
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Producto creado.', 'ok');
            await cargarProductos();
        }
    });

    buscar('#btn-update-product')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioProducto).entries());
        if (!loPayload.IdProducto || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Completa IdProducto, Version y Motivo.' });
            return;
        }
        const loResultado = await productoService.actualizar(loPayload.IdProducto, {
            CodigoProducto: loPayload.CodigoProducto,
            Nombre: loPayload.Nombre,
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Producto actualizado.', 'ok');
            await cargarProductos();
        }
    });

    buscar('#btn-delete-product')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioProducto).entries());
        if (!loPayload.IdProducto || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Completa IdProducto, Version y Motivo.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Inactivacion de producto',
            mensaje: 'El producto quedara inactivo en catalogo.',
            textoConfirmar: 'Inactivar',
        });
        if (!tlConfirmado) return;

        const loResultado = await productoService.eliminarLogico(loPayload.IdProducto, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensajeEmpresa, loResultado);
        if (loResultado.ok) {
            mostrarToast('Producto inactivado.', 'ok');
            await cargarProductos();
        }
    });

    loFormularioAprobacion?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = buscar('#btn-request-approval');
        setBotonCargando(loBoton, true, 'Solicitando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioAprobacion).entries());
        const loResultado = await aprobacionService.solicitar(loPayload);
        renderizarMensaje(loMensajeAprobacion, loResultado);
        if (loResultado.ok) {
            mostrarToast('Solicitud de aprobacion enviada.', 'ok');
            loFormularioAprobacion.reset();
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioAuditoria?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = buscar('#btn-audit-query');
        setBotonCargando(loBoton, true, 'Consultando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioAuditoria).entries());
        if (!loPayload.Entidad || !loPayload.EntidadId) {
            renderizarMensaje(loMensajeAprobacion, { ok: false, mensaje: 'Ingresa Entidad y EntidadId para auditoria.' });
            setBotonCargando(loBoton, false);
            return;
        }

        const loResultado = await auditoriaService.porEntidad(loPayload.Entidad, loPayload.EntidadId);
        if (loResultado.ok) {
            renderizarTablaDatos(loTablaAuditoria, convertirAArreglo(loResultado.datos));
        }
        renderizarMensaje(loMensajeAprobacion, loResultado);

        setBotonCargando(loBoton, false);
    });

    async function cargarReferencias() {
        const [loTipos, loEstados] = await Promise.all([
            catalogoService.listarTiposEmpresa(),
            catalogoService.listarEstados('GENERAL'),
        ]);

        if (loTipos.ok) {
            llenarSelect(loSelectTipoEmpresa, convertirAArreglo(loTipos.datos), ['TipoEmpresa', 'IdTipoEmpresa'], ['Descripcion', 'Nombre']);
        }

        if (loEstados.ok) {
            llenarSelect(loSelectEstado, convertirAArreglo(loEstados.datos), ['Estado', 'IdEstado'], ['Descripcion', 'Nombre']);
        }
    }

    async function cargarEmpresas() {
        const loBoton = buscar('#btn-load-companies');
        setBotonCargando(loBoton, true, 'Cargando...');

        const loResultado = await empresaService.listar({ Pagina: 1, TamanoPagina: 50 });
        if (loResultado.ok) {
            renderizarTablaDatos(loTablaEmpresas, convertirAArreglo(loResultado.datos?.items ?? loResultado.datos));
        }
        renderizarMensaje(loMensajeEmpresa, loResultado);
        setBotonCargando(loBoton, false);
    }

    async function cargarMaquinas() {
        const loBoton = buscar('#btn-load-machines');
        setBotonCargando(loBoton, true, 'Cargando...');

        const loResultado = await maquinaService.listar({ Pagina: 1, TamanoPagina: 100 });
        if (loResultado.ok) {
            const laMaquinas = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos);
            renderizarTablaDatos(loTablaMaquinas, laMaquinas);
            llenarSelect(loSelectMaquina, laMaquinas, ['IdMaquina', 'Maquina', 'id'], ['CodigoMaquina', 'Nombre', 'Descripcion']);
        }
        renderizarMensaje(loMensajeEmpresa, loResultado);
        setBotonCargando(loBoton, false);
    }

    async function cargarCeldas() {
        const tnMaquina = loSelectMaquina?.value;
        if (!tnMaquina) {
            renderizarMensaje(loMensajeEmpresa, { ok: false, mensaje: 'Seleccione una maquina para consultar celdas.' });
            return;
        }

        const loBoton = buscar('#btn-load-cells');
        setBotonCargando(loBoton, true, 'Consultando...');

        const loResultado = await maquinaService.listarCeldas(tnMaquina, { Pagina: 1, TamanoPagina: 100 });
        if (loResultado.ok) {
            renderizarTablaDatos(loTablaCeldas, convertirAArreglo(loResultado.datos?.items ?? loResultado.datos));
        }
        renderizarMensaje(loMensajeEmpresa, loResultado);
        setBotonCargando(loBoton, false);
    }

    async function cargarProductos() {
        const loBoton = buscar('#btn-load-products');
        setBotonCargando(loBoton, true, 'Cargando...');

        const tnEmpresa = buscar('#product-company-filter')?.value?.trim();
        const loResultado = await productoService.listar({ Empresa: tnEmpresa || undefined, Pagina: 1, TamanoPagina: 100 });
        if (loResultado.ok) {
            renderizarTablaDatos(loTablaProductos, convertirAArreglo(loResultado.datos?.items ?? loResultado.datos));
        }
        renderizarMensaje(loMensajeEmpresa, loResultado);
        setBotonCargando(loBoton, false);
    }

    function llenarSelect(loSelect, laDatos, laCamposValor, laCamposTexto) {
        if (!loSelect) return;
        const tcOpciones = laDatos.map((loItem) => {
            const txValor = tomarCampo(loItem, laCamposValor);
            const txTexto = tomarCampo(loItem, laCamposTexto);
            return `<option value="${txValor}">${txTexto}</option>`;
        }).join('');
        loSelect.innerHTML = `<option value="">Seleccione...</option>${tcOpciones}`;
    }

    function construirPayloadMaquina(loDatos = {}) {
        return {
            CodigoMaquina: textoOpcional(loDatos.CodigoMaquina),
            NumeroSerie: textoOpcional(loDatos.NumeroSerie),
            Marca: textoOpcional(loDatos.Marca),
            Modelo: textoOpcional(loDatos.Modelo),
            IdentificadorConexion: textoOpcional(loDatos.IdentificadorConexion),
            TipoInternet: normalizarCatalogo(loDatos.TipoInternet),
            ConsumoKwhMensual: loDatos.ConsumoKwhMensual !== '' ? Number(loDatos.ConsumoKwhMensual) : undefined,
            TipoLugarInstalacion: normalizarCatalogo(loDatos.TipoLugarInstalacion),
            UbicacionActual: textoOpcional(loDatos.UbicacionActual),
            FilasMatriz: loDatos.FilasMatriz !== '' ? Number(loDatos.FilasMatriz) : undefined,
            ColumnasMatriz: loDatos.ColumnasMatriz !== '' ? Number(loDatos.ColumnasMatriz) : undefined,
            Estado: textoOpcional(loDatos.Estado),
            Version: textoOpcional(loDatos.Version),
            Motivo: textoOpcional(loDatos.Motivo),
        };
    }

    function normalizarCatalogo(txValor) {
        const tcValor = String(txValor ?? '').trim();
        if (!tcValor) return undefined;
        if (/^\d+$/.test(tcValor)) return Number(tcValor);
        return tcValor;
    }

    function textoOpcional(txValor) {
        const tcValor = String(txValor ?? '').trim();
        return tcValor === '' ? undefined : tcValor;
    }

    function tomarCampo(loItem, laCampos) {
        for (const tcCampo of laCampos) {
            if (Object.prototype.hasOwnProperty.call(loItem, tcCampo)) {
                return loItem[tcCampo];
            }
        }
        const tcPrimeraClave = Object.keys(loItem)[0];
        return tcPrimeraClave ? loItem[tcPrimeraClave] : '';
    }

    void cargarReferencias();
    void cargarEmpresas();
    void cargarMaquinas();
    void cargarProductos();
}
