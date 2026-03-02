import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Gestion de mermas con aprobacion y evidencia.
 */
export const mermaService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/merma', params: loFiltros });
    },
    obtener(tnMerma) {
        return solicitarApi({ method: 'get', url: `/merma/${tnMerma}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/merma', data: loPayload, idempotente: true });
    },
    actualizar(tnMerma, loPayload) {
        return solicitarApi({ method: 'patch', url: `/merma/${tnMerma}`, data: loPayload });
    },
    eliminarLogico(tnMerma, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/merma/${tnMerma}`, data: loPayload });
    },
    aprobar(tnMerma, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/merma/${tnMerma}/aprobar`, data: loPayload });
    },
    rechazar(tnMerma, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/merma/${tnMerma}/rechazar`, data: loPayload });
    },
    subirEvidencia(tnMerma, loPayload) {
        return solicitarApi({ method: 'post', url: `/merma/${tnMerma}/evidencia/subir`, data: loPayload });
    },
    listarEvidencia(tnMerma, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/merma/${tnMerma}/evidencia`, params: loFiltros });
    },
};
