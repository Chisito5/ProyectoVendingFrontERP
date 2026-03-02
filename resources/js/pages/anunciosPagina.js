import { anuncioService } from '../services/anuncioService';
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
 * Inicializa gestion de anuncios comerciales.
 */
export function iniciarPaginaAnuncios() {
    const loFormularioAnuncio = buscar('#form-anuncio');
    const loFormularioProductos = buscar('#form-anuncio-productos');
    const loFormularioMaquinas = buscar('#form-anuncio-maquinas');
    const loFormularioFiltros = buscar('#form-anuncio-filtros');

    const loMensaje = buscar('#anuncio-mensaje');

    const loTabla = new TablaPaginada({
        selectorContenedor: '#anuncio-tabla',
        onCambiarPagina: async (tnPagina) => {
            loFormularioFiltros.querySelector('input[name="Pagina"]').value = tnPagina;
            await cargarAnuncios();
        },
    });

    buscar('#btn-anuncio-crear')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioAnuncio).entries());
        const loResultado = await anuncioService.crear(loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Anuncio creado.', 'ok');
            await cargarAnuncios();
        }
    });

    buscar('#btn-anuncio-actualizar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioAnuncio).entries());
        if (!loPayload.IdAnuncio || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Completa IdAnuncio, Version y Motivo.' });
            return;
        }

        const loResultado = await anuncioService.actualizar(loPayload.IdAnuncio, loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Anuncio actualizado.', 'ok');
            await cargarAnuncios();
        }
    });

    buscar('#btn-anuncio-eliminar')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioAnuncio).entries());
        if (!loPayload.IdAnuncio || !loPayload.Version || !loPayload.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Completa IdAnuncio, Version y Motivo.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Inactivacion de anuncio',
            mensaje: 'El anuncio quedara inactivo sin borrar historico.',
            textoConfirmar: 'Inactivar',
        });
        if (!tlConfirmado) return;

        const loResultado = await anuncioService.eliminarLogico(loPayload.IdAnuncio, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });

        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Anuncio inactivado.', 'ok');
            await cargarAnuncios();
        }
    });

    buscar('#btn-anuncio-publicar')?.addEventListener('click', async () => {
        await ejecutarEstadoAnuncio('publicar');
    });

    buscar('#btn-anuncio-detener')?.addEventListener('click', async () => {
        await ejecutarEstadoAnuncio('detener');
    });

    buscar('#btn-anuncio-detalle')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioAnuncio).entries());
        if (!loPayload.IdAnuncio) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdAnuncio.' });
            return;
        }

        const [loAnuncio, loImpacto] = await Promise.all([
            anuncioService.obtener(loPayload.IdAnuncio),
            anuncioService.impacto(loPayload.IdAnuncio),
        ]);

        if (loAnuncio.ok) {
            abrirDrawerDetalle({
                titulo: `Anuncio #${loPayload.IdAnuncio}`,
                datos: {
                    Anuncio: loAnuncio.datos,
                    Impacto: loImpacto.ok ? loImpacto.datos : loImpacto.mensaje,
                },
            });
            return;
        }

        renderizarMensaje(loMensaje, loAnuncio);
    });

    loFormularioProductos?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioProductos.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Asignando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioProductos).entries());
        const laProductos = (loPayload.Productos || '')
            .split(',')
            .map((txValor) => txValor.trim())
            .filter(Boolean);

        const laResultados = await Promise.all(
            laProductos.map((tnProducto) => anuncioService.asignarProducto(loPayload.IdAnuncio, { Producto: tnProducto }))
        );

        const loError = laResultados.find((loResultado) => !loResultado.ok);
        const loResultadoFinal = loError ?? { ok: true, mensaje: 'Productos asignados.', datos: laResultados.map((loRes) => loRes.datos) };
        renderizarMensaje(loMensaje, loResultadoFinal);
        if (loResultadoFinal.ok) {
            mostrarToast('Productos asignados.', 'ok');
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioMaquinas?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioMaquinas.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Asignando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioMaquinas).entries());
        const laMaquinas = (loPayload.Maquinas || '')
            .split(',')
            .map((txValor) => txValor.trim())
            .filter(Boolean);

        const laResultados = await Promise.all(
            laMaquinas.map((tnMaquina) => anuncioService.asignarMaquina(loPayload.IdAnuncio, { Maquina: tnMaquina }))
        );

        const loError = laResultados.find((loResultado) => !loResultado.ok);
        const loResultadoFinal = loError ?? { ok: true, mensaje: 'Maquinas asignadas.', datos: laResultados.map((loRes) => loRes.datos) };
        renderizarMensaje(loMensaje, loResultadoFinal);
        if (loResultadoFinal.ok) {
            mostrarToast('Maquinas asignadas.', 'ok');
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioProductos?.querySelector('[data-quitar-producto]')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioProductos).entries());
        if (!loPayload.IdAnuncio || !loPayload.IdProductoQuitar) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdAnuncio e IdProductoQuitar.' });
            return;
        }

        const loResultado = await anuncioService.quitarProducto(loPayload.IdAnuncio, loPayload.IdProductoQuitar, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensaje, loResultado);
    });

    loFormularioMaquinas?.querySelector('[data-quitar-maquina]')?.addEventListener('click', async () => {
        const loPayload = Object.fromEntries(new FormData(loFormularioMaquinas).entries());
        if (!loPayload.IdAnuncio || !loPayload.IdMaquinaQuitar) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdAnuncio e IdMaquinaQuitar.' });
            return;
        }

        const loResultado = await anuncioService.quitarMaquina(loPayload.IdAnuncio, loPayload.IdMaquinaQuitar, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensaje, loResultado);
    });

    buscar('#btn-anuncio-cargar')?.addEventListener('click', async () => {
        await cargarAnuncios();
    });

    async function ejecutarEstadoAnuncio(tcAccion) {
        const loPayload = Object.fromEntries(new FormData(loFormularioAnuncio).entries());
        if (!loPayload.IdAnuncio) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingresa IdAnuncio.' });
            return;
        }

        const loResultado = tcAccion === 'publicar'
            ? await anuncioService.publicar(loPayload.IdAnuncio, { Motivo: loPayload.Motivo })
            : await anuncioService.detener(loPayload.IdAnuncio, { Motivo: loPayload.Motivo });

        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast(`Anuncio ${tcAccion}do.`, 'ok');
            await cargarAnuncios();
        }
    }

    async function cargarAnuncios() {
        const loResultado = await anuncioService.listar(obtenerFiltrosDeFormulario(loFormularioFiltros));

        if (loResultado.ok) {
            const laDatos = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos);
            loTabla.renderizar(laDatos, extraerMetaPaginacion(loResultado));
        }

        renderizarMensaje(loMensaje, loResultado);
    }

    void cargarAnuncios();
}
