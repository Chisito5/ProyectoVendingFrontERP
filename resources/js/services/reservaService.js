import { solicitarApi } from '../api/client';

export const reservaService = {
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/reserva', data: loPayload, idempotente: true });
    },
    confirmar(loPayload) {
        return solicitarApi({ method: 'post', url: '/reserva/confirmar', data: loPayload, idempotente: true });
    },
    cancelar(loPayload) {
        return solicitarApi({ method: 'post', url: '/reserva/cancelar', data: loPayload, idempotente: true });
    },
};
