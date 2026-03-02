import { solicitarApi } from '../api/client';

export const tableroService = {
    unificado(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/tablero/ejecutivo/unificado', params: loFiltros });
    },
    resumen() {
        return solicitarApi({ method: 'get', url: '/tablero/resumen' });
    },
    resumenEjecutivo(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/tablero/ejecutivo/resumen', params: loFiltros });
    },
    maquinasEjecutivo(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/tablero/ejecutivo/maquinas', params: loFiltros });
    },
    mapaEjecutivo(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/tablero/ejecutivo/mapa', params: loFiltros });
    },
    rankingEjecutivo(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/tablero/ejecutivo/ranking', params: loFiltros });
    },
    detalleMaquinaEjecutivo(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/tablero/ejecutivo/maquina/${tnMaquina}/detalle`, params: loFiltros });
    },
};
