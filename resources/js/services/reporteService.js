import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Generacion y descarga de reportes asincronos.
 */
export const reporteService = {
    plantillas() {
        return solicitarApi({ method: 'get', url: '/reporte/plantillas' });
    },
    generar(loPayload) {
        return solicitarApi({ method: 'post', url: '/reporte/generar', data: loPayload });
    },
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/reporte', params: loFiltros });
    },
    obtener(tnReporte) {
        return solicitarApi({ method: 'get', url: `/reporte/${tnReporte}` });
    },
    descargar(tnReporte) {
        return solicitarApi({ method: 'get', url: `/reporte/${tnReporte}/descargar` });
    },
};
