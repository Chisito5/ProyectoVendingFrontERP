import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Gestion de anuncios comerciales y su publicacion operativa.
 */
export const anuncioService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/anuncio', params: loFiltros });
    },
    obtener(tnAnuncio) {
        return solicitarApi({ method: 'get', url: `/anuncio/${tnAnuncio}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/anuncio', data: loPayload });
    },
    actualizar(tnAnuncio, loPayload) {
        return solicitarApi({ method: 'patch', url: `/anuncio/${tnAnuncio}`, data: loPayload });
    },
    eliminarLogico(tnAnuncio, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/anuncio/${tnAnuncio}`, data: loPayload });
    },
    asignarMaquina(tnAnuncio, loPayload) {
        return solicitarApi({ method: 'post', url: `/anuncio/${tnAnuncio}/maquina`, data: loPayload });
    },
    quitarMaquina(tnAnuncio, tnMaquina, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/anuncio/${tnAnuncio}/maquina/${tnMaquina}`, data: loPayload });
    },
    asignarProducto(tnAnuncio, loPayload) {
        return solicitarApi({ method: 'post', url: `/anuncio/${tnAnuncio}/producto`, data: loPayload });
    },
    quitarProducto(tnAnuncio, tnProducto, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/anuncio/${tnAnuncio}/producto/${tnProducto}`, data: loPayload });
    },
    publicar(tnAnuncio, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/anuncio/${tnAnuncio}/publicar`, data: loPayload });
    },
    detener(tnAnuncio, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/anuncio/${tnAnuncio}/detener`, data: loPayload });
    },
    impacto(tnAnuncio, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/anuncio/${tnAnuncio}/impacto`, params: loFiltros });
    },
};
