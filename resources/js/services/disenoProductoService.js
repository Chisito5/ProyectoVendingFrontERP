import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Gestion de composicion visual de producto por capas 2D.
 */
export const disenoProductoService = {
    obtener(tnProducto) {
        return solicitarApi({ method: 'get', url: `/producto/${tnProducto}/diseno` });
    },
    crear(tnProducto, loPayload) {
        return solicitarApi({ method: 'post', url: `/producto/${tnProducto}/diseno`, data: loPayload });
    },
    actualizar(tnProducto, loPayload) {
        return solicitarApi({ method: 'patch', url: `/producto/${tnProducto}/diseno`, data: loPayload });
    },
    renderizarPreview(tnProducto, loPayload) {
        return solicitarApi({ method: 'post', url: `/producto/${tnProducto}/diseno/render`, data: loPayload });
    },
    galeria(tnProducto) {
        return solicitarApi({ method: 'get', url: `/producto/${tnProducto}/galeria` });
    },
    subirImagen(tnProducto, loPayload) {
        return solicitarApi({ method: 'post', url: `/producto/${tnProducto}/imagen/subir`, data: loPayload });
    },
    subirLoteImagenes(tnProducto, loPayload) {
        return solicitarApi({ method: 'post', url: `/producto/${tnProducto}/imagen/lote-subir`, data: loPayload });
    },
    reordenarGaleria(tnProducto, loPayload) {
        return solicitarApi({ method: 'post', url: `/producto/${tnProducto}/galeria/reordenar`, data: loPayload });
    },
};
