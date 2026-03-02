import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de planograma celda y cambios sensibles de precio.
 */
export const planogramaService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/planogramacelda', params: loFiltros });
    },
    listarPorCelda(tnCelda, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/planogramacelda/celda/${tnCelda}`, params: loFiltros });
    },
    listarPorPlanograma(tnPlanograma, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/planogramacelda/planograma/${tnPlanograma}`, params: loFiltros });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/planogramacelda', data: loPayload });
    },
    actualizar(tnPlanogramaCelda, loPayload) {
        return solicitarApi({ method: 'patch', url: `/planogramacelda/${tnPlanogramaCelda}`, data: loPayload });
    },
    actualizarPrecio(tnPlanogramaCelda, loPayload) {
        return solicitarApi({ method: 'patch', url: `/planogramacelda/${tnPlanogramaCelda}/precio`, data: loPayload });
    },
    eliminarLogico(tnPlanogramaCelda, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/planogramacelda/${tnPlanogramaCelda}`, data: loPayload });
    },
    historial(tnPlanogramaCelda, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/planogramacelda/${tnPlanogramaCelda}/historial`, params: loFiltros });
    },
};
