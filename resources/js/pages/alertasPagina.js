import { alertaService } from '../services/alertaService';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje } from '../utils/dom';
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
 * Inicializa la pantalla de alertas operativas.
 */
export function iniciarPaginaAlertas() {
    const loFormularioRegla = buscar('#form-alerta-regla');
    const loFormularioAccion = buscar('#form-alerta-accion');
    const loFormularioFiltros = buscar('#form-alerta-filtros');
    const loMensaje = buscar('#alerta-mensaje');

    const loTabla = new TablaPaginada({
        selectorContenedor: '#alerta-tabla',
        onCambiarPagina: async (tnPagina) => {
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnPagina;
            await cargarAlertas();
        },
    });

    buscar('#btn-alerta-regla-crear')?.addEventListener('click', async () => {
        const loPayload = construirPayloadRegla();
        const loResultado = await alertaService.crearRegla(loPayload);
        manejarResultado(loResultado, 'Regla creada.');
    });

    buscar('#btn-alerta-regla-actualizar')?.addEventListener('click', async () => {
        const loPayload = construirPayloadRegla();
        if (!loPayload.IdRegla || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Completa IdRegla, Version y Motivo.' });
            return;
        }

        const loResultado = await alertaService.actualizarRegla(loPayload.IdRegla, loPayload);
        manejarResultado(loResultado, 'Regla actualizada.');
    });
    buscar('#btn-alerta-regla-eliminar')?.addEventListener('click', async () => {
        const loPayload = construirPayloadRegla();
        if (!loPayload.IdRegla || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Completa IdRegla, Version y Motivo para inactivar.' });
            return;
        }

        const loResultado = await alertaService.eliminarRegla(loPayload.IdRegla, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        manejarResultado(loResultado, 'Regla inactivada.');
    });

    buscar('#btn-alerta-atender')?.addEventListener('click', async () => {
        await ejecutarAccionAlerta('atender');
    });

    buscar('#btn-alerta-escalar')?.addEventListener('click', async () => {
        await ejecutarAccionAlerta('escalar');
    });

    buscar('#btn-alerta-cerrar')?.addEventListener('click', async () => {
        await ejecutarAccionAlerta('cerrar');
    });

    buscar('#btn-alerta-cargar')?.addEventListener('click', async () => {
        await cargarAlertas();
    });

    async function ejecutarAccionAlerta(tcAccion) {
        const loPayload = Object.fromEntries(new FormData(loFormularioAccion).entries());
        if (!loPayload.IdAlerta) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdAlerta.' });
            return;
        }

        let loResultado = null;

        if (tcAccion === 'atender') {
            loResultado = await alertaService.atender(loPayload.IdAlerta, { Motivo: loPayload.Motivo });
        }
        if (tcAccion === 'escalar') {
            loResultado = await alertaService.escalar(loPayload.IdAlerta, { Motivo: loPayload.Motivo });
        }
        if (tcAccion === 'cerrar') {
            loResultado = await alertaService.cerrar(loPayload.IdAlerta, { Motivo: loPayload.Motivo });
        }

        manejarResultado(loResultado, `Alerta ${tcAccion}da.`);
    }

    function manejarResultado(loResultado, tcMensajeOk) {
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast(tcMensajeOk, 'ok');
            void cargarAlertas();
        }
    }

    function construirPayloadRegla() {
        const loDatos = Object.fromEntries(new FormData(loFormularioRegla).entries());
        return {
            ...loDatos,
            IdRegla: loDatos.IdRegla ? Number(loDatos.IdRegla) : undefined,
            Empresa: loDatos.Empresa ? Number(loDatos.Empresa) : undefined,
            Maquina: loDatos.Maquina ? Number(loDatos.Maquina) : undefined,
            Celda: loDatos.Celda ? Number(loDatos.Celda) : undefined,
            Producto: loDatos.Producto ? Number(loDatos.Producto) : undefined,
            Estado: loDatos.Estado ? Number(loDatos.Estado) : undefined,
            UmbralMinimo: loDatos.UmbralMinimo ? Number(loDatos.UmbralMinimo) : undefined,
            Prioridad: loDatos.Prioridad ? Number(loDatos.Prioridad) : undefined,
            TipoRegla: loDatos.TipoRegla || loDatos.Tipo || undefined,
            MensajeRegla: loDatos.MensajeRegla || undefined,
        };
    }

    async function cargarAlertas() {
        const loResultado = await alertaService.listar(obtenerFiltrosDeFormulario(loFormularioFiltros));

        if (loResultado.ok) {
            loTabla.renderizar(
                convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos),
                extraerMetaPaginacion(loResultado)
            );
        }

        renderizarMensaje(loMensaje, loResultado);
    }

    void cargarAlertas();
}
