import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Flujo de aprobaciones de cambios sensibles.
 */
export const aprobacionService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/aprobaciones', params: loFiltros });
    },
    solicitar(loPayload) {
        return solicitarApi({ method: 'post', url: '/aprobaciones/solicitar', data: loPayload });
    },
    aprobar(tnAprobacion, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/aprobaciones/${tnAprobacion}/aprobar`, data: loPayload });
    },
    rechazar(tnAprobacion, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/aprobaciones/${tnAprobacion}/rechazar`, data: loPayload });
    },
};
