import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Gestion de ubicacion y estado tecnico por maquina.
 */
export const ubicacionMaquinaService = {
    obtener(tnMaquina) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/ubicacion` });
    },
    actualizar(tnMaquina, loPayload) {
        return solicitarApi({ method: 'put', url: `/maquina/${tnMaquina}/ubicacion`, data: loPayload });
    },
    estadoOperativo(tnMaquina) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/estado-operativo` });
    },
    cambiarEstadoOperativo(tnMaquina, loPayload) {
        return solicitarApi({ method: 'post', url: `/maquina/${tnMaquina}/estado-operativo`, data: loPayload });
    },
    historialEstadoOperativo(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/estado-operativo/historial`, params: loFiltros });
    },
};
