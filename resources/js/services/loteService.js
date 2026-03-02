import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de lotes para reposicion e inventario.
 */
export const loteService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/lote', params: loFiltros });
    },
    obtener(tnLote) {
        return solicitarApi({ method: 'get', url: `/lote/${tnLote}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/lote', data: loPayload });
    },
    actualizar(tnLote, loPayload) {
        return solicitarApi({ method: 'patch', url: `/lote/${tnLote}`, data: loPayload });
    },
    eliminarLogico(tnLote, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/lote/${tnLote}`, data: loPayload });
    },
    historial(tnLote, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/lote/${tnLote}/historial`, params: loFiltros });
    },
};
