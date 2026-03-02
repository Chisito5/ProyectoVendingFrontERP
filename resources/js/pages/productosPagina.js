import { disenoProductoService } from '../services/disenoProductoService';
import { productoService } from '../services/productoService';
import { toArray } from '../utils/tableroAdaptadores';
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
 * Inicializa gestion de productos con dimensiones fisicas y galeria multimedia.
 */
export function iniciarPaginaProductos() {
    const loFormularioProducto = buscar('#form-producto');
    const loFormularioGaleria = buscar('#form-producto-galeria');
    const loFormularioFiltros = buscar('#form-productos-filtros');

    const loMensaje = buscar('#productos-mensaje');
    const loTabla = buscar('#productos-tabla');
    const loGaleria = buscar('#productos-galeria');

    buscar('#btn-productos-listar')?.addEventListener('click', async () => {
        await cargarListado();
    });

    buscar('#btn-producto-crear')?.addEventListener('click', async () => {
        const loPayload = payloadProducto();
        const loResultado = await productoService.crear(loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Producto creado.', 'ok');
            await cargarListado();
        }
    });

    buscar('#btn-producto-actualizar')?.addEventListener('click', async () => {
        const loPayload = payloadProducto();
        if (!loPayload.IdProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Indique el ID del producto.' });
            return;
        }
        const loResultado = await productoService.actualizar(loPayload.IdProducto, loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Producto actualizado.', 'ok');
            await cargarListado();
        }
    });

    buscar('#btn-producto-inactivar')?.addEventListener('click', async () => {
        const loPayload = payloadProducto();
        if (!loPayload.IdProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Indique el ID del producto.' });
            return;
        }
        const loResultado = await productoService.eliminarLogico(loPayload.IdProducto, {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Producto inactivado.', 'ok');
            await cargarListado();
        }
    });

    buscar('#btn-galeria-cargar')?.addEventListener('click', async () => {
        await cargarGaleria();
    });

    buscar('#btn-galeria-subir')?.addEventListener('click', async () => {
        const loBoton = buscar('#btn-galeria-subir');
        setBotonCargando(loBoton, true, 'Subiendo...');
        await subirImagenes();
        setBotonCargando(loBoton, false);
    });

    async function cargarListado() {
        const loFiltros = Object.fromEntries(new FormData(loFormularioFiltros).entries());
        const loResultado = await productoService.listar(loFiltros);
        renderizarMensaje(loMensaje, loResultado);
        if (!loResultado.ok) return;

        const laFilas = toArray(loResultado.datos?.items ?? loResultado.datos);
        renderizarTablaDatos(loTabla, laFilas, {
            columnas: [
                { clave: 'IdProducto', etiqueta: 'ID' },
                { clave: 'CodigoProducto', etiqueta: 'Codigo' },
                { clave: 'NombreProducto', etiqueta: 'Producto' },
                { clave: 'Precio', etiqueta: 'Precio' },
                { clave: 'AnchoMm', etiqueta: 'Ancho (mm)' },
                { clave: 'AltoMm', etiqueta: 'Alto (mm)' },
                { clave: 'ProfundidadMm', etiqueta: 'Prof. (mm)' },
                { clave: 'PesoGr', etiqueta: 'Peso (gr)' },
                { clave: 'Orientacion', etiqueta: 'Orientacion' },
                { clave: 'Estado', etiqueta: 'Estado' },
            ],
        });
    }

    async function cargarGaleria() {
        const loDatos = Object.fromEntries(new FormData(loFormularioGaleria).entries());
        const tnProducto = Number(loDatos.IdProducto || 0);
        if (!tnProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione un producto para cargar galeria.' });
            return;
        }

        const loResultado = await disenoProductoService.galeria(tnProducto);
        if (loResultado.ok) {
            pintarGaleria(toArray(loResultado.datos?.items ?? loResultado.datos));
            renderizarMensaje(loMensaje, loResultado);
            return;
        }

        renderizarMensaje(loMensaje, loResultado);
    }

    async function subirImagenes() {
        const loForm = new FormData(loFormularioGaleria);
        const loDatos = Object.fromEntries(loForm.entries());
        const tnProducto = Number(loDatos.IdProducto || 0);
        if (!tnProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione un producto.' });
            return;
        }

        const laLineas = String(loDatos.ImagenesUrl || '')
            .split('\n')
            .map((tcLinea) => tcLinea.trim())
            .filter(Boolean);
        const laArchivos = loForm.getAll('ImagenesArchivo')
            .filter((loItem) => loItem instanceof File && loItem.size > 0);

        if (!laLineas.length && !laArchivos.length) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingrese al menos una URL o seleccione archivos de imagen.' });
            return;
        }

        const loPayloadBase = {
            TipoImagenNombre: loDatos.TipoImagen || 'DETALLE',
            Version: loDatos.Version,
            Motivo: loDatos.Motivo,
        };
        const tlUnaSola = laLineas.length + laArchivos.length === 1;
        let loResultado;

        if (tlUnaSola) {
            if (laArchivos.length === 1) {
                const loPayloadArchivo = new FormData();
                loPayloadArchivo.append('Imagen', laArchivos[0]);
                loPayloadArchivo.append('TipoImagenNombre', loPayloadBase.TipoImagenNombre);
                if (loPayloadBase.Version) loPayloadArchivo.append('Version', loPayloadBase.Version);
                if (loPayloadBase.Motivo) loPayloadArchivo.append('Motivo', loPayloadBase.Motivo);
                loResultado = await disenoProductoService.subirImagen(tnProducto, loPayloadArchivo);
            } else {
                const loPayloadLoteUrl = new FormData();
                loPayloadLoteUrl.append('Imagenes[]', laLineas[0]);
                loPayloadLoteUrl.append('TipoImagenNombre', loPayloadBase.TipoImagenNombre);
                if (loPayloadBase.Version) loPayloadLoteUrl.append('Version', loPayloadBase.Version);
                if (loPayloadBase.Motivo) loPayloadLoteUrl.append('Motivo', loPayloadBase.Motivo);
                loResultado = await disenoProductoService.subirLoteImagenes(tnProducto, loPayloadLoteUrl);
            }
        } else {
            const loPayloadLote = new FormData();
            if (loPayloadBase.Version) loPayloadLote.append('Version', loPayloadBase.Version);
            if (loPayloadBase.Motivo) loPayloadLote.append('Motivo', loPayloadBase.Motivo);
            laLineas.forEach((tcUrl) => {
                loPayloadLote.append('Imagenes[]', tcUrl);
            });
            if (laArchivos.length === 1) loPayloadLote.append('Archivo', laArchivos[0]);
            if (laArchivos.length > 1) laArchivos.forEach((loArchivo) => loPayloadLote.append('Archivos[]', loArchivo));
            loPayloadLote.append('TipoImagenNombre', loPayloadBase.TipoImagenNombre);

            loResultado = await disenoProductoService.subirLoteImagenes(tnProducto, loPayloadLote);
        }
        if (loResultado.ok) {
            renderizarMensaje(loMensaje, loResultado);
            mostrarToast('Imagenes subidas.', 'ok');
            await cargarGaleria();
            return;
        }
        renderizarMensaje(loMensaje, loResultado);
    }

    function payloadProducto() {
        const loDatos = Object.fromEntries(new FormData(loFormularioProducto).entries());
        return {
            ...loDatos,
            IdProducto: loDatos.IdProducto ? Number(loDatos.IdProducto) : undefined,
            Precio: loDatos.Precio ? Number(loDatos.Precio) : undefined,
            AnchoMm: loDatos.AnchoMm ? Number(loDatos.AnchoMm) : undefined,
            AltoMm: loDatos.AltoMm ? Number(loDatos.AltoMm) : undefined,
            ProfundidadMm: loDatos.ProfundidadMm ? Number(loDatos.ProfundidadMm) : undefined,
            PesoGr: loDatos.PesoGr ? Number(loDatos.PesoGr) : undefined,
            PermiteGiro: loDatos.PermiteGiro === '' ? undefined : loDatos.PermiteGiro === 'true',
        };
    }

    function pintarGaleria(laImagenes) {
        if (!Array.isArray(laImagenes) || !laImagenes.length) {
            loGaleria.innerHTML = '<p class="text-sm text-slate-500">Sin imagenes para este producto.</p>';
            return;
        }

        loGaleria.innerHTML = `
            <div class="mb-2 text-xs font-semibold text-slate-600">
                Imagenes registradas en backend: ${escapeHtml(String(laImagenes.length))}
            </div>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                ${laImagenes.map((loImagen) => {
                    const tcUrl = resolverUrlMultimedia(
                        loImagen.UrlImagen ?? loImagen.UrlArchivo ?? loImagen.Url ?? loImagen.Ruta ?? loImagen.ImagenUrl ?? ''
                    );
                    const tcTipo = loImagen.TipoImagen ?? loImagen.Tipo ?? 'DETALLE';
                    return `
                        <article class="rounded border border-slate-200 bg-white p-2">
                            <div class="mb-1 text-[11px] font-semibold text-slate-600">${escapeHtml(tcTipo)}</div>
                            ${tcUrl
        ? `<img src="${escapeHtml(tcUrl)}" alt="Imagen producto" class="h-24 w-full rounded object-cover" data-galeria-imagen>`
        : '<div class="h-24 w-full rounded bg-slate-100 text-center text-xs text-slate-500 leading-[96px]">Imagen no disponible</div>'}
                            <p class="mt-1 truncate text-[11px] text-slate-500" title="${escapeHtml(tcUrl)}">${escapeHtml(tcUrl || 'Sin URL')}</p>
                            ${tcUrl ? `<a class="text-[11px] text-blue-700 underline" href="${escapeHtml(tcUrl)}" target="_blank" rel="noopener noreferrer">Abrir imagen</a>` : ''}
                        </article>
                    `;
                }).join('')}
            </div>
        `;

        loGaleria.querySelectorAll('[data-galeria-imagen]').forEach((loImagen) => {
            loImagen.addEventListener('error', () => {
                loImagen.outerHTML = '<div class="h-24 w-full rounded bg-slate-100 text-center text-xs text-slate-500 leading-[96px]">Imagen no disponible</div>';
            }, { once: true });
        });
    }

    function escapeHtml(tcTexto) {
        return String(tcTexto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function resolverUrlMultimedia(txUrl) {
        const tcUrl = String(txUrl ?? '').trim();
        if (!tcUrl) return '';
        if (/^https?:\/\//i.test(tcUrl)) return tcUrl;
        if (tcUrl.startsWith('//')) return `${window.location.protocol}${tcUrl}`;

        const tcBaseApi = String(window.__ERP_FRONTEND_CONFIG__?.apiBaseUrl || '').trim();
        if (tcUrl.startsWith('/')) {
            if (tcBaseApi) {
                try {
                    return new URL(tcUrl, tcBaseApi).toString();
                } catch {
                    return `${window.location.origin}${tcUrl}`;
                }
            }
            return `${window.location.origin}${tcUrl}`;
        }

        if (tcBaseApi) {
            try {
                return new URL(tcUrl, `${tcBaseApi.replace(/\/+$/, '')}/`).toString();
            } catch {
                return tcUrl;
            }
        }
        return tcUrl;
    }

    void cargarListado();
}
