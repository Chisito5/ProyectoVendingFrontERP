import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Consulta de auditoria por entidad para trazabilidad critica.
 */
export const auditoriaService = {
    porEntidad(tcEntidad, tnEntidadId, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/auditoria/${tcEntidad}/${tnEntidadId}`, params: loFiltros });
    },
};
