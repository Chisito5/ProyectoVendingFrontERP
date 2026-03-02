import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Consultas de analitica ejecutiva multiempresa.
 */
export const analiticaService = {
    resumen(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/analitica/resumen', params: loFiltros });
    },
    ventas(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/analitica/ventas', params: loFiltros });
    },
    rotacion(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/analitica/rotacion', params: loFiltros });
    },
    stockout(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/analitica/stockout', params: loFiltros });
    },
    rentabilidad(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/analitica/rentabilidad', params: loFiltros });
    },
    mermas(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/analitica/mermas', params: loFiltros });
    },
};
