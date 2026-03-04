import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 03-03-2026
 *
 * Operaciones directas sobre entidad celda.
 */
export const celdaService = {
    obtener(tnCelda) {
        return solicitarApi({ method: 'get', url: `/celda/${tnCelda}` });
    },
    eliminarLogico(tnCelda, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/celda/${tnCelda}`, data: loPayload });
    },
};

