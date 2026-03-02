import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Gestion de celdas inteligentes por maquina (matriz, simulacion y asignacion).
 */
export const maquinaCeldasService = {
    matriz(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/celdas/matriz`, params: loFiltros });
    },
    simularOcupacion(tnMaquina, loPayload) {
        return solicitarApi({ method: 'post', url: `/maquina/${tnMaquina}/celdas/simular-ocupacion`, data: loPayload });
    },
    asignarProducto(tnMaquina, loPayload) {
        return solicitarApi({
            method: 'post',
            url: `/maquina/${tnMaquina}/celdas/asignar-producto`,
            data: loPayload,
            idempotente: true,
        });
    },
    liberar(tnMaquina, loPayload) {
        return solicitarApi({
            method: 'post',
            url: `/maquina/${tnMaquina}/celdas/liberar`,
            data: loPayload,
            idempotente: true,
        });
    },
    conflictos(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/celdas/conflictos`, params: loFiltros });
    },
};
