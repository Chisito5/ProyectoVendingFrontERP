import { integracionIotService } from '../services/integracionIotService';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje, renderizarTablaDatos, setBotonCargando } from '../utils/dom';
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
 * Inicializa monitor de integracion IoT.
 */
export function iniciarPaginaIntegracionIot() {
    const loFormularioEvento = buscar('#form-iot-evento');
    const loFormularioFiltros = buscar('#form-iot-filtros');
    const loFormularioWebhook = buscar('#form-iot-webhook');
    const loMensaje = buscar('#iot-mensaje');
    const loDetalle = buscar('#iot-detalle');

    const loTablaEventos = new TablaPaginada({
        selectorContenedor: '#iot-eventos-tabla',
        onCambiarPagina: async (tnPagina) => {
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnPagina;
            await cargarEventos();
        },
    });

    loFormularioEvento?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioEvento.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Consultando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioEvento).entries());
        const loResultado = await integracionIotService.obtenerEvento(loPayload.IdEvento);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            renderizarTablaDatos(loDetalle, loResultado.datos);
        }

        setBotonCargando(loBoton, false);
    });

    buscar('#btn-iot-cargar-eventos')?.addEventListener('click', async () => {
        await cargarEventos();
    });

    loFormularioWebhook?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioWebhook.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Enviando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioWebhook).entries());
        let loBody = {};
        try {
            loBody = loPayload.Payload ? JSON.parse(loPayload.Payload) : {};
        } catch {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Payload JSON invalido.' });
            setBotonCargando(loBoton, false);
            return;
        }

        const loHeaders = {
            'X-IoT-EventId': loPayload.EventId || '',
            'X-IoT-Timestamp': loPayload.Timestamp || '',
            'X-IoT-Firma': loPayload.Firma || '',
            'X-IoT-Origen': loPayload.Origen || '',
        };

        const loResultado = await integracionIotService.webhook(loBody, loHeaders);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Webhook enviado.', 'ok');
            await cargarEventos();
        }

        setBotonCargando(loBoton, false);
    });

    async function cargarEventos() {
        const loResultado = await integracionIotService.listarEventos(obtenerFiltrosDeFormulario(loFormularioFiltros));

        if (loResultado.ok) {
            loTablaEventos.renderizar(
                convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos),
                extraerMetaPaginacion(loResultado)
            );
        }

        renderizarMensaje(loMensaje, loResultado);
    }

    void cargarEventos();
}
