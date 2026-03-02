import { stockService } from '../services/stockService';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { iniciarCanalesTiempoReal } from '../tiempoReal/canalesErp';
import { abrirDrawerDetalle } from '../ui/drawerDetalle';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { TablaPaginada } from '../ui/tablaPaginada';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * return: void
 *
 * Inicializa la pagina de consultas de stock.
 */
export function iniciarPaginaStock() {
    const loFormularioFiltros = buscar('#form-filtros-stock');
    const loFormularioSeleccion = buscar('#form-stock-selection');
    const loFormularioMovimientos = buscar('#form-filtros-movimientos-stock');

    const loMensajeMaquina = buscar('#stock-machine-message');
    const loMensajeSeleccion = buscar('#stock-selection-message');
    const loMensajeMovimientos = buscar('#stock-movimientos-message');

    const loBotonStock = buscar('#btn-consultar-stock');
    const loBotonMovimientos = buscar('#btn-cargar-movimientos-stock');

    const loTablaStock = new TablaPaginada({
        selectorContenedor: '#stock-machine-table',
        onCambiarPagina: async (tnPagina) => {
            if (!loFormularioFiltros) return;
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnPagina;
            await consultarStock();
        },
    });

    const loTablaMovimientos = new TablaPaginada({
        selectorContenedor: '#stock-movimientos-table',
        onCambiarPagina: async (tnPagina) => {
            await cargarMovimientos(tnPagina);
        },
    });

    let loSuscriptor = { detener: () => {} };
    let lnTimerRefresco = null;

    aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: false });
    aplicarEmpresaMaquinaEnFormulario(loFormularioSeleccion, { maquina: true, empresa: false });
    aplicarEmpresaMaquinaEnFormulario(loFormularioMovimientos, { maquina: true, empresa: false });

    loFormularioFiltros?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        await consultarStock();
    });

    loFormularioSeleccion?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioSeleccion.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Consultando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioSeleccion).entries());
        const loResultado = await stockService.porSeleccion(loPayload.maquina, loPayload.codigo);

        if (loResultado.ok) {
            abrirDrawerDetalle({
                titulo: `Detalle seleccion ${loPayload.codigo}`,
                datos: loResultado.datos,
            });
            mostrarToast('Detalle de seleccion cargado.', 'ok');
        }

        renderizarMensaje(loMensajeSeleccion, loResultado);
        setBotonCargando(loBoton, false);
    });

    loBotonMovimientos?.addEventListener('click', async () => {
        await cargarMovimientos(1);
    });

    async function consultarStock() {
        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);

        if (!loFiltros.Maquina) {
            renderizarMensaje(loMensajeMaquina, { ok: false, mensaje: 'Selecciona una maquina para consultar stock.' });
            return;
        }

        setBotonCargando(loBotonStock, true, 'Consultando...');
        const loResultado = await stockService.porMaquina(loFiltros.Maquina, loFiltros);

        if (loResultado.ok) {
            const laDatos = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos);
            const loMeta = extraerMetaPaginacion(loResultado);
            loTablaStock.renderizar(laDatos, loMeta);
            await suscribirTiempoReal(loFiltros.Maquina);
        }

        renderizarMensaje(loMensajeMaquina, loResultado);
        setBotonCargando(loBotonStock, false);
    }

    async function cargarMovimientos(tnPagina = 1) {
        setBotonCargando(loBotonMovimientos, true, 'Cargando...');

        const loFiltros = {
            ...obtenerFiltrosDeFormulario(loFormularioMovimientos),
            Pagina: tnPagina,
        };

        const loResultado = await stockService.movimientos(loFiltros);
        if (loResultado.ok) {
            const laDatos = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos);
            loTablaMovimientos.renderizar(laDatos, extraerMetaPaginacion(loResultado));
        }

        renderizarMensaje(loMensajeMovimientos, loResultado);
        setBotonCargando(loBotonMovimientos, false);
    }

    async function suscribirTiempoReal(tnMaquina) {
        if (!tnMaquina) return;

        loSuscriptor.detener();

        loSuscriptor = await iniciarCanalesTiempoReal({
            canales: [`maquina.${tnMaquina}`],
            eventos: ['stock.actualizado', 'reposicion.creada', 'venta.creada', 'venta.reversada', 'reserva.confirmada', 'reserva.cancelada'],
            onEvento: (tcEvento) => {
                mostrarToast(`Evento recibido: ${tcEvento}`, 'ok', 2200);

                if (lnTimerRefresco) {
                    window.clearTimeout(lnTimerRefresco);
                }

                lnTimerRefresco = window.setTimeout(() => {
                    void consultarStock();
                }, 500);
            },
        });
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: false });
        aplicarEmpresaMaquinaEnFormulario(loFormularioSeleccion, { maquina: true, empresa: false });
        aplicarEmpresaMaquinaEnFormulario(loFormularioMovimientos, { maquina: true, empresa: false });
        void consultarStock();
    });

    void cargarMovimientos(1);
}
