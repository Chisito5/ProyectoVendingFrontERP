import { solicitarApi } from '../api/client';

export const stockService = {
    porMaquina(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/stock/maquina/${tnMaquina}`, params: loFiltros });
    },
    porSeleccion(tnMaquina, tcCodigoSeleccion) {
        return solicitarApi({ method: 'get', url: `/stock/maquina/${tnMaquina}/seleccion/${tcCodigoSeleccion}` });
    },
    movimientos(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/stock/movimientos', params: loFiltros });
    },
};
