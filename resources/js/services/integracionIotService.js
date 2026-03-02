import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Monitorea eventos de integracion IoT y reintentos.
 */
export const integracionIotService = {
    webhook(loPayload, loHeaders = {}) {
        return solicitarApi({ method: 'post', url: '/integracion/iot/webhook', data: loPayload, headers: loHeaders });
    },
    listarEventos(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/integracion/iot/evento', params: loFiltros });
    },
    obtenerEvento(tnEvento) {
        return solicitarApi({ method: 'get', url: `/integracion/iot/evento/${tnEvento}` });
    },
};
