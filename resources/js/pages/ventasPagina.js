import { ventaService } from '../services/ventaService';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { confirmarAccion } from '../ui/confirmacion';
import { abrirDrawerDetalle } from '../ui/drawerDetalle';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { TablaPaginada } from '../ui/tablaPaginada';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa la pagina de ventas y reversa con UX operativa y paginacion.
 */
export function iniciarPaginaVentas() {
    const loFormularioVenta = buscar('#form-create-sale');
    const loFormularioReversa = buscar('#form-reverse-sale');
    const loFormularioFiltros = buscar('#form-filtros-ventas');

    const loMensajeVenta = buscar('#sale-message');
    const loMensajeReversa = buscar('#sale-reverse-message');

    const loBotonCrear = buscar('#btn-create-sale');
    const loBotonReversa = buscar('#btn-reverse-sale');
    const loBotonActualizar = buscar('#btn-load-sales');
    const loBotonFiltrar = buscar('#btn-load-sales-machine');

    const loTabla = new TablaPaginada({
        selectorContenedor: '#sales-table',
        onCambiarPagina: async (tnPagina) => {
            const loInputPagina = loFormularioFiltros?.querySelector('input[name="Pagina"]');
            if (loInputPagina) loInputPagina.value = tnPagina;
            await cargarListado();
        },
    });
    aplicarEmpresaMaquinaEnFormulario(loFormularioVenta, { maquina: true, empresa: false });
    aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: false });

    loFormularioVenta?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        setBotonCargando(loBotonCrear, true, 'Procesando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioVenta).entries());
        loPayload.Maquina = Number(loPayload.Maquina);
        loPayload.Cantidad = Number(loPayload.Cantidad);

        const loResultado = await ventaService.crear(loPayload);
        renderizarMensaje(loMensajeVenta, loResultado);

        if (loResultado.ok) {
            mostrarToast('Venta procesada correctamente.', 'ok');
            loFormularioVenta.reset();
            await cargarListado();
        } else {
            mostrarToast(loResultado.mensaje || 'Error al crear venta.', 'error');
        }

        setBotonCargando(loBotonCrear, false);
    });

    loFormularioReversa?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();

        const tlConfirmado = await confirmarAccion({
            titulo: 'Confirmar reversa de venta',
            mensaje: 'Se anulara la venta y se ajustara stock. Deseas continuar?',
            textoConfirmar: 'Si, reversar',
        });

        if (!tlConfirmado) return;

        setBotonCargando(loBotonReversa, true, 'Reversando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioReversa).entries());
        loPayload.Venta = Number(loPayload.Venta);

        const loResultado = await ventaService.reversar(loPayload);
        renderizarMensaje(loMensajeReversa, loResultado);

        if (loResultado.ok) {
            mostrarToast('Reversa aplicada.', 'ok');
            loFormularioReversa.reset();
            await cargarListado();
        } else {
            mostrarToast(loResultado.mensaje || 'No se pudo reversar.', 'error');
        }

        setBotonCargando(loBotonReversa, false);
    });

    loBotonActualizar?.addEventListener('click', async () => {
        await cargarListado();
    });

    loBotonFiltrar?.addEventListener('click', async () => {
        await cargarListado();
    });

    buscar('#btn-open-sales-detail')?.addEventListener('click', async () => {
        const tnVenta = Number(loFormularioReversa?.querySelector('input[name="Venta"]')?.value || 0);
        if (!tnVenta) {
            mostrarToast('Ingresa un Id de venta para abrir detalle.', 'error');
            return;
        }

        const loResultado = await ventaService.obtener(tnVenta);
        if (loResultado.ok) {
            abrirDrawerDetalle({
                titulo: `Detalle venta #${tnVenta}`,
                datos: loResultado.datos,
            });
        } else {
            mostrarToast(loResultado.mensaje || 'No se pudo cargar detalle.', 'error');
        }
    });

    async function cargarListado() {
        setBotonCargando(loBotonActualizar, true, 'Cargando...');

        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);
        const tnMaquina = loFiltros.Maquina || null;

        const loResultado = tnMaquina
            ? await ventaService.listarPorMaquina(tnMaquina, loFiltros)
            : await ventaService.listar(loFiltros);

        if (loResultado.ok) {
            const laDatos = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos);
            loTabla.renderizar(laDatos, extraerMetaPaginacion(loResultado));
        }

        renderizarMensaje(loMensajeVenta, loResultado);
        setBotonCargando(loBotonActualizar, false);
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioVenta, { maquina: true, empresa: false });
        aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: false });
        void cargarListado();
    });

    void cargarListado();
}
