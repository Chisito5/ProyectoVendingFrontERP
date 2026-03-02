import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de taxonomia avanzada y multimedia de producto.
 */
export const clasificacionProductoService = {
    listarFamilias(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/productofamilia', params: loFiltros });
    },
    crearFamilia(loPayload) {
        return solicitarApi({ method: 'post', url: '/productofamilia', data: loPayload });
    },
    actualizarFamilia(tnFamilia, loPayload) {
        return solicitarApi({ method: 'patch', url: `/productofamilia/${tnFamilia}`, data: loPayload });
    },
    eliminarFamilia(tnFamilia, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/productofamilia/${tnFamilia}`, data: loPayload });
    },

    listarGrupos(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/productogrupo', params: loFiltros });
    },
    crearGrupo(loPayload) {
        return solicitarApi({ method: 'post', url: '/productogrupo', data: loPayload });
    },
    actualizarGrupo(tnGrupo, loPayload) {
        return solicitarApi({ method: 'patch', url: `/productogrupo/${tnGrupo}`, data: loPayload });
    },
    eliminarGrupo(tnGrupo, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/productogrupo/${tnGrupo}`, data: loPayload });
    },

    listarSubgrupos(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/productosubgrupo', params: loFiltros });
    },
    crearSubgrupo(loPayload) {
        return solicitarApi({ method: 'post', url: '/productosubgrupo', data: loPayload });
    },
    actualizarSubgrupo(tnSubgrupo, loPayload) {
        return solicitarApi({ method: 'patch', url: `/productosubgrupo/${tnSubgrupo}`, data: loPayload });
    },
    eliminarSubgrupo(tnSubgrupo, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/productosubgrupo/${tnSubgrupo}`, data: loPayload });
    },

    listarImagenes(tnProducto, tcTipo) {
        return solicitarApi({ method: 'get', url: '/productoimagen', params: { Producto: tnProducto, TipoImagen: tcTipo } });
    },
    crearImagen(loPayload) {
        return solicitarApi({ method: 'post', url: '/productoimagen', data: loPayload });
    },
    actualizarImagen(tnImagen, loPayload) {
        return solicitarApi({ method: 'patch', url: `/productoimagen/${tnImagen}`, data: loPayload });
    },
    subirImagenProducto(tnProducto, loPayload) {
        return solicitarApi({ method: 'post', url: `/producto/${tnProducto}/imagen/subir`, data: loPayload });
    },
    eliminarImagen(tnProducto, tnImagen, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/producto/${tnProducto}/imagen/${tnImagen}`, data: loPayload });
    },
};
