import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de producto con filtros por empresa.
 */
export const productoService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/producto', params: loFiltros });
    },
    obtener(tnProducto) {
        return solicitarApi({ method: 'get', url: `/producto/${tnProducto}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/producto', data: loPayload });
    },
    actualizar(tnProducto, loPayload) {
        return solicitarApi({ method: 'patch', url: `/producto/${tnProducto}`, data: loPayload });
    },
    eliminarLogico(tnProducto, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/producto/${tnProducto}`, data: loPayload });
    },
    historial(tnProducto, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/producto/${tnProducto}/historial`, params: loFiltros });
    },
};
