import { mermaService } from '../services/mermaService';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje } from '../utils/dom';
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
 * Inicializa gestion de mermas con aprobacion.
 */
export function iniciarPaginaMermas() {
    const loFormulario = buscar('#form-merma');
    const loFormularioFiltros = buscar('#form-merma-filtros');
    const loMensaje = buscar('#merma-mensaje');

    const loTabla = new TablaPaginada({
        selectorContenedor: '#merma-tabla',
        onCambiarPagina: async (tnPagina) => {
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnPagina;
            await cargarMermas();
        },
    });

    buscar('#btn-merma-crear')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        const loResultado = await mermaService.crear(loPayload);
        manejarResultado(loResultado, 'Merma creada.');
    });

    buscar('#btn-merma-actualizar')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        if (!loPayload.IdMerma || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Completa IdMerma, Version y Motivo.' });
            return;
        }

        const loResultado = await mermaService.actualizar(loPayload.IdMerma, loPayload);
        manejarResultado(loResultado, 'Merma actualizada.');
    });

    buscar('#btn-merma-eliminar')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        if (!loPayload.IdMerma || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Completa IdMerma, Version y Motivo.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Inactivacion de merma',
            mensaje: 'La merma se marca como anulada y queda auditada.',
            textoConfirmar: 'Anular',
        });
        if (!tlConfirmado) return;

        const loResultado = await mermaService.eliminarLogico(loPayload.IdMerma, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        manejarResultado(loResultado, 'Merma anulada.');
    });

    buscar('#btn-merma-aprobar')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        if (!loPayload.IdMerma) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdMerma.' });
            return;
        }

        const loResultado = await mermaService.aprobar(loPayload.IdMerma, { Motivo: loPayload.Motivo });
        manejarResultado(loResultado, 'Merma aprobada.');
    });

    buscar('#btn-merma-rechazar')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        if (!loPayload.IdMerma) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdMerma.' });
            return;
        }

        const loResultado = await mermaService.rechazar(loPayload.IdMerma, { Motivo: loPayload.Motivo });
        manejarResultado(loResultado, 'Merma rechazada.');
    });

    buscar('#btn-merma-detalle')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        if (!loPayload.IdMerma) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdMerma.' });
            return;
        }

        const loResultado = await mermaService.obtener(loPayload.IdMerma);
        if (loResultado.ok) {
            abrirDrawerDetalle({
                titulo: `Merma #${loPayload.IdMerma}`,
                datos: loResultado.datos,
            });
            return;
        }

        renderizarMensaje(loMensaje, loResultado);
    });

    buscar('#btn-merma-subir-evidencia')?.addEventListener('click', async () => {
        const loPayload = obtenerPayloadMerma();
        if (!loPayload.IdMerma) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdMerma para subir evidencia.' });
            return;
        }

        const loFormData = construirPayloadEvidencia();
        if (!loFormData) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Debe seleccionar un archivo de evidencia.' });
            return;
        }

        const loResultado = await mermaService.subirEvidencia(loPayload.IdMerma, loFormData);
        manejarResultado(loResultado, 'Evidencia subida.');
    });

    buscar('#btn-merma-cargar')?.addEventListener('click', async () => {
        await cargarMermas();
    });

    function obtenerPayloadMerma() {
        const loPayload = Object.fromEntries(new FormData(loFormulario).entries());
        const txEvidencia = loPayload.Evidencia?.trim();
        loPayload.Evidencia = txEvidencia ? [txEvidencia] : [];
        return loPayload;
    }

    function construirPayloadEvidencia() {
        const loForm = new FormData(loFormulario);
        const tcMotivo = String(loForm.get('Motivo') || '').trim();
        const tcVersion = String(loForm.get('Version') || '').trim();
        const loArchivo = loForm.get('EvidenciaArchivo');

        if (!(loArchivo instanceof File) || loArchivo.size <= 0) {
            return null;
        }

        const loPayload = new FormData();
        if (tcMotivo) loPayload.append('Motivo', tcMotivo);
        if (tcVersion) loPayload.append('Version', tcVersion);
        loPayload.append('Archivo', loArchivo);

        return loPayload;
    }

    function manejarResultado(loResultado, tcMensajeOk) {
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast(tcMensajeOk, 'ok');
            void cargarMermas();
        }
    }

    async function cargarMermas() {
        const loResultado = await mermaService.listar(obtenerFiltrosDeFormulario(loFormularioFiltros));

        if (loResultado.ok) {
            loTabla.renderizar(
                convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos),
                extraerMetaPaginacion(loResultado)
            );
        }

        renderizarMensaje(loMensaje, loResultado);
    }

    void cargarMermas();
}
