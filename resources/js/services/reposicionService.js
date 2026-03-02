import { solicitarApi } from '../api/client';

export const reposicionService = {
    prevalidar(loPayload) {
        return solicitarApi({ method: 'post', url: '/reposicion/prevalidar', data: loPayload, idempotente: true });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/reposicion', data: loPayload, idempotente: true });
    },
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/reposicion', params: loFiltros });
    },
    listarPorMaquina(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/reposicion/maquina/${tnMaquina}`, params: loFiltros });
    },
    obtener(tnReposicion) {
        return solicitarApi({ method: 'get', url: `/reposicion/${tnReposicion}` });
    },
};
