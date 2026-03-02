import { clasificacionProductoService } from '../services/clasificacionProductoService';
import { convertirAArreglo } from '../utils/datos';
import { buscar, renderizarMensaje, renderizarTablaDatos } from '../utils/dom';
import { confirmarAccion } from '../ui/confirmacion';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa catalogo avanzado de producto.
 */
export function iniciarPaginaCatalogoAvanzado() {
    const loMensaje = buscar('#catalogo-avanzado-mensaje');

    const loFormularioFamilia = buscar('#form-familia');
    const loFormularioGrupo = buscar('#form-grupo');
    const loFormularioSubgrupo = buscar('#form-subgrupo');
    const loFormularioImagen = buscar('#form-imagen-producto');

    buscar('#btn-familia-crear')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioFamilia, 'familia', 'crear'));
    buscar('#btn-familia-actualizar')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioFamilia, 'familia', 'actualizar'));
    buscar('#btn-familia-eliminar')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioFamilia, 'familia', 'eliminar'));

    buscar('#btn-grupo-crear')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioGrupo, 'grupo', 'crear'));
    buscar('#btn-grupo-actualizar')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioGrupo, 'grupo', 'actualizar'));
    buscar('#btn-grupo-eliminar')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioGrupo, 'grupo', 'eliminar'));

    buscar('#btn-subgrupo-crear')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioSubgrupo, 'subgrupo', 'crear'));
    buscar('#btn-subgrupo-actualizar')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioSubgrupo, 'subgrupo', 'actualizar'));
    buscar('#btn-subgrupo-eliminar')?.addEventListener('click', async () => ejecutarCrudTaxonomia(loFormularioSubgrupo, 'subgrupo', 'eliminar'));

    buscar('#btn-cargar-taxonomia')?.addEventListener('click', async () => {
        await cargarTaxonomia();
    });

    buscar('#btn-imagen-listar')?.addEventListener('click', async () => {
        await listarImagenes();
    });

    buscar('#btn-imagen-crear')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioImagen).entries());
        const loResultado = await clasificacionProductoService.crearImagen(loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Imagen registrada.', 'ok');
            await listarImagenes();
        }
    });

    buscar('#btn-imagen-subir')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioImagen).entries());
        if (!loPayload.IdProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdProducto.' });
            return;
        }
        const loResultado = await clasificacionProductoService.subirImagenProducto(loPayload.IdProducto, loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Imagen subida al producto.', 'ok');
            await listarImagenes();
        }
    });

    buscar('#btn-imagen-actualizar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioImagen).entries());
        if (!loPayload.IdImagen) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdImagen.' });
            return;
        }

        const loResultado = await clasificacionProductoService.actualizarImagen(loPayload.IdImagen, loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Imagen actualizada.', 'ok');
            await listarImagenes();
        }
    });

    buscar('#btn-imagen-eliminar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioImagen).entries());
        if (!loPayload.IdProducto || !loPayload.IdImagen) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdProducto e IdImagen.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Eliminar imagen',
            mensaje: 'La imagen quedara inactiva por inactivacion logica.',
            textoConfirmar: 'Eliminar',
        });
        if (!tlConfirmado) return;

        const loResultado = await clasificacionProductoService.eliminarImagen(loPayload.IdProducto, loPayload.IdImagen, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Imagen inactivada.', 'ok');
            await listarImagenes();
        }
    });

    async function ejecutarCrudTaxonomia(loFormulario, tcEntidad, tcAccion) {
        const loPayload = Object.fromEntries(new FormData(loFormulario).entries());
        let loResultado = null;

        if (tcEntidad === 'familia') {
            loResultado = await ejecutarCrudEntidad(
                tcAccion,
                loPayload,
                clasificacionProductoService.crearFamilia,
                clasificacionProductoService.actualizarFamilia,
                clasificacionProductoService.eliminarFamilia
            );
        }

        if (tcEntidad === 'grupo') {
            loResultado = await ejecutarCrudEntidad(
                tcAccion,
                loPayload,
                clasificacionProductoService.crearGrupo,
                clasificacionProductoService.actualizarGrupo,
                clasificacionProductoService.eliminarGrupo
            );
        }

        if (tcEntidad === 'subgrupo') {
            loResultado = await ejecutarCrudEntidad(
                tcAccion,
                loPayload,
                clasificacionProductoService.crearSubgrupo,
                clasificacionProductoService.actualizarSubgrupo,
                clasificacionProductoService.eliminarSubgrupo
            );
        }

        renderizarMensaje(loMensaje, loResultado);
        if (loResultado?.ok) {
            mostrarToast(`${tcEntidad} ${tcAccion} exitoso.`, 'ok');
            await cargarTaxonomia();
        }
    }

    async function ejecutarCrudEntidad(tcAccion, loPayload, fnCrear, fnActualizar, fnEliminar) {
        if (tcAccion === 'crear') {
            return fnCrear(loPayload);
        }

        if (!loPayload.Id) {
            return { ok: false, mensaje: 'Ingresa Id para esta accion.' };
        }

        if (tcAccion === 'actualizar') {
            return fnActualizar(loPayload.Id, loPayload);
        }

        if (tcAccion === 'eliminar') {
            return fnEliminar(loPayload.Id, { Version: loPayload.Version, Motivo: loPayload.Motivo });
        }

        return { ok: false, mensaje: 'Accion no soportada.' };
    }

    async function cargarTaxonomia() {
        const [loFamilia, loGrupo, loSubgrupo] = await Promise.all([
            clasificacionProductoService.listarFamilias({ Pagina: 1, TamanoPagina: 50 }),
            clasificacionProductoService.listarGrupos({ Pagina: 1, TamanoPagina: 50 }),
            clasificacionProductoService.listarSubgrupos({ Pagina: 1, TamanoPagina: 50 }),
        ]);

        if (loFamilia.ok) {
            renderizarTablaDatos(buscar('#tabla-familia'), convertirAArreglo(loFamilia.datos?.items ?? loFamilia.datos));
        }
        if (loGrupo.ok) {
            renderizarTablaDatos(buscar('#tabla-grupo'), convertirAArreglo(loGrupo.datos?.items ?? loGrupo.datos));
        }
        if (loSubgrupo.ok) {
            renderizarTablaDatos(buscar('#tabla-subgrupo'), convertirAArreglo(loSubgrupo.datos?.items ?? loSubgrupo.datos));
        }

        const loPrimeroConError = [loFamilia, loGrupo, loSubgrupo].find((loResultado) => !loResultado.ok);
        if (loPrimeroConError) {
            renderizarMensaje(loMensaje, loPrimeroConError);
        }
    }

    async function listarImagenes() {
        const loPayload = Object.fromEntries(new FormData(loFormularioImagen).entries());
        if (!loPayload.IdProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdProducto.' });
            return;
        }

        const loResultado = await clasificacionProductoService.listarImagenes(loPayload.IdProducto, loPayload.Tipo);
        if (loResultado.ok) {
            renderizarTablaDatos(buscar('#tabla-imagenes'), convertirAArreglo(loResultado.datos?.items ?? loResultado.datos));
        }
        renderizarMensaje(loMensaje, loResultado);
    }

    void cargarTaxonomia();
}
