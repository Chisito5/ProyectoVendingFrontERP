import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de maquina y celdas operativas.
 */
export const maquinaService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/maquina', params: loFiltros });
    },
    obtener(tnMaquina) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/maquina', data: loPayload });
    },
    actualizar(tnMaquina, loPayload) {
        return solicitarApi({ method: 'patch', url: `/maquina/${tnMaquina}`, data: loPayload });
    },
    eliminarLogico(tnMaquina, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/maquina/${tnMaquina}`, data: loPayload });
    },
    listarCeldas(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/celda`, params: loFiltros });
    },
    crearCelda(tnMaquina, loPayload) {
        return solicitarApi({ method: 'post', url: `/maquina/${tnMaquina}/celda`, data: loPayload });
    },
    actualizarCelda(tnMaquina, tnCelda, loPayload) {
        return solicitarApi({ method: 'patch', url: `/maquina/${tnMaquina}/celda/${tnCelda}`, data: loPayload });
    },
    eliminarCeldaLogico(tnMaquina, tnCelda, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/maquina/${tnMaquina}/celda/${tnCelda}`, data: loPayload });
    },
    historial(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/historial`, params: loFiltros });
    },
    listarFotos(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/foto`, params: loFiltros });
    },
    subirFotosLote(tnMaquina, loPayload) {
        return solicitarApi({ method: 'post', url: `/maquina/${tnMaquina}/foto/lote-subir`, data: loPayload, idempotente: true });
    },
    eliminarFotoLogico(tnMaquina, tnFoto, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/maquina/${tnMaquina}/foto/${tnFoto}`, data: loPayload });
    },
};
