import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Operacion de deposito para entradas, salidas y transferencias a maquina.
 */
export const depositoService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/deposito', params: loFiltros });
    },
    stock(tnDeposito, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/deposito/${tnDeposito}/stock`, params: loFiltros });
    },
    movimientos(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/deposito/movimientos', params: loFiltros });
    },
    entrada(loPayload) {
        return solicitarApi({ method: 'post', url: '/deposito/movimiento/entrada', data: loPayload, idempotente: true });
    },
    salida(loPayload) {
        return solicitarApi({ method: 'post', url: '/deposito/movimiento/salida', data: loPayload, idempotente: true });
    },
    transferirAMaquina(loPayload) {
        return solicitarApi({ method: 'post', url: '/deposito/transferir-a-maquina', data: loPayload, idempotente: true });
    },
};
