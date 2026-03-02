import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de empresa con versionado optimista y soft delete.
 */
export const empresaService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/empresa', params: loFiltros });
    },
    obtener(tnEmpresa) {
        return solicitarApi({ method: 'get', url: `/empresa/${tnEmpresa}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/empresa', data: loPayload });
    },
    actualizar(tnEmpresa, loPayload) {
        return solicitarApi({ method: 'patch', url: `/empresa/${tnEmpresa}`, data: loPayload });
    },
    eliminarLogico(tnEmpresa, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/empresa/${tnEmpresa}`, data: loPayload });
    },
    historial(tnEmpresa, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/empresa/${tnEmpresa}/historial`, params: loFiltros });
    },
};
