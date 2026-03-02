import { solicitarApi } from '../api/client';

export const ventaService = {
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/venta', data: loPayload, idempotente: true });
    },
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/venta', params: loFiltros });
    },
    obtener(tnVenta) {
        return solicitarApi({ method: 'get', url: `/venta/${tnVenta}` });
    },
    listarPorMaquina(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/venta/maquina/${tnMaquina}`, params: loFiltros });
    },
    reversar(loPayload) {
        return solicitarApi({ method: 'post', url: '/venta/reversa', data: loPayload, idempotente: true });
    },
    historial(tnVenta, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/venta/${tnVenta}/historial`, params: loFiltros });
    },
};
