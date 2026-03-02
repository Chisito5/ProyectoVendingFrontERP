import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Gestion de alertas operativas y reglas de umbral.
 */
export const alertaService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/alerta', params: loFiltros });
    },
    obtener(tnAlerta) {
        return solicitarApi({ method: 'get', url: `/alerta/${tnAlerta}` });
    },
    listarReglas(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/reglaalerta', params: loFiltros });
    },
    obtenerRegla(tnRegla) {
        return solicitarApi({ method: 'get', url: `/reglaalerta/${tnRegla}` });
    },
    crearRegla(loPayload) {
        return solicitarApi({ method: 'post', url: '/reglaalerta', data: loPayload });
    },
    actualizarRegla(tnRegla, loPayload) {
        return solicitarApi({ method: 'patch', url: `/reglaalerta/${tnRegla}`, data: loPayload });
    },
    eliminarRegla(tnRegla, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/reglaalerta/${tnRegla}`, data: loPayload });
    },
    atender(tnAlerta, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/alerta/${tnAlerta}/atender`, data: loPayload });
    },
    escalar(tnAlerta, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/alerta/${tnAlerta}/escalar`, data: loPayload });
    },
    cerrar(tnAlerta, loPayload = {}) {
        return solicitarApi({ method: 'post', url: `/alerta/${tnAlerta}/cerrar`, data: loPayload });
    },
};
