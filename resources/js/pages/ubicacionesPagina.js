import { ubicacionMaquinaService } from '../services/ubicacionMaquinaService';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { buscar, renderizarMensaje, renderizarTablaDatos, setBotonCargando } from '../utils/dom';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa gestion de ubicacion y estado operativo.
 */
export function iniciarPaginaUbicaciones() {
    const loFormularioConsulta = buscar('#form-ubicacion-consulta');
    const loFormularioActualizar = buscar('#form-ubicacion-actualizar');
    const loFormularioEstadoOperativo = buscar('#form-estado-operativo-actualizar');
    const loSelectMaquina = buscar('#ubicacion-maquina');

    const loMensaje = buscar('#ubicacion-mensaje');
    const loContenedorDetalle = buscar('#ubicacion-detalle');
    const loContenedorEstado = buscar('#ubicacion-estado-detalle');
    const loContenedorHistorial = buscar('#ubicacion-historial');

    aplicarEmpresaMaquinaEnFormulario(loFormularioConsulta, { maquina: true, empresa: false });

    loFormularioConsulta?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = buscar('#btn-consultar-ubicacion');
        setBotonCargando(loBoton, true, 'Consultando...');
        await consultarUbicacion();
        setBotonCargando(loBoton, false);
    });

    buscar('#btn-consultar-estado-operativo')?.addEventListener('click', async () => {
        await consultarEstadoOperativo();
    });

    buscar('#btn-consultar-historial-operativo')?.addEventListener('click', async () => {
        await consultarHistorialOperativo();
    });

    loFormularioEstadoOperativo?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();

        const tnMaquina = loSelectMaquina?.value;
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Selecciona una maquina en el header superior.' });
            return;
        }

        const loBoton = loFormularioEstadoOperativo.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Actualizando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioEstadoOperativo).entries());
        const loResultado = await ubicacionMaquinaService.cambiarEstadoOperativo(tnMaquina, loPayload);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            mostrarToast('Estado operativo actualizado.', 'ok');
            await consultarEstadoOperativo();
            await consultarHistorialOperativo();
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioActualizar?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();

        const tnMaquina = loSelectMaquina?.value;
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Selecciona una maquina en el header superior.' });
            return;
        }

        const loBoton = loFormularioActualizar.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Actualizando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioActualizar).entries());
        loPayload.TieneEnergiaPropia = loPayload.TieneEnergiaPropia === ''
            ? undefined
            : loPayload.TieneEnergiaPropia === 'true';

        const loResultado = await ubicacionMaquinaService.actualizar(tnMaquina, loPayload);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            mostrarToast('Ubicacion actualizada.', 'ok');
            await consultarUbicacion();
            await consultarEstadoOperativo();
        }

        setBotonCargando(loBoton, false);
    });

    async function consultarUbicacion() {
        const tnMaquina = loSelectMaquina?.value;
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Selecciona una maquina en el header superior.' });
            return;
        }

        const loResultado = await ubicacionMaquinaService.obtener(tnMaquina);
        if (loResultado.ok) {
            renderizarTablaDatos(loContenedorDetalle, loResultado.datos);
        }
        renderizarMensaje(loMensaje, loResultado);
    }

    async function consultarEstadoOperativo() {
        const tnMaquina = loSelectMaquina?.value;
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Selecciona una maquina en el header superior.' });
            return;
        }

        const loResultado = await ubicacionMaquinaService.estadoOperativo(tnMaquina);
        if (loResultado.ok) {
            renderizarTablaDatos(loContenedorEstado, loResultado.datos);
        }
        renderizarMensaje(loMensaje, loResultado);
    }

    async function consultarHistorialOperativo() {
        const tnMaquina = loSelectMaquina?.value;
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Selecciona una maquina en el header superior.' });
            return;
        }

        const loResultado = await ubicacionMaquinaService.historialEstadoOperativo(tnMaquina, { Pagina: 1, TamanoPagina: 30 });
        if (loResultado.ok) {
            renderizarTablaDatos(loContenedorHistorial, loResultado.datos);
        }
        renderizarMensaje(loMensaje, loResultado);
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioConsulta, { maquina: true, empresa: false });
        void consultarUbicacion();
    });

    void consultarUbicacion();
}
