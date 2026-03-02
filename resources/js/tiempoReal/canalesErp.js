import { obtenerConfiguracionFrontend, obtenerToken } from '../core/sesionErp';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/tiempoReal
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Integracion opcional con Laravel Reverb/Pusher.
 */
export async function iniciarCanalesTiempoReal({ canales = [], eventos = [], onEvento = null } = {}) {
    const loConfig = obtenerConfiguracionFrontend();
    const loWs = loConfig.websocket ?? {};

    if (!loWs.key || !Array.isArray(canales) || canales.length === 0) {
        return { detener: () => {} };
    }

    try {
        const [{ default: Echo }, { default: Pusher }] = await Promise.all([
            import('laravel-echo'),
            import('pusher-js'),
        ]);

        window.Pusher = Pusher;

        const tcAuthEndpoint = loWs.authEndpoint || construirAuthEndpoint(loConfig.apiBaseUrl || '');

        const loEcho = new Echo({
            broadcaster: loWs.broadcaster || 'reverb',
            key: loWs.key,
            wsHost: loWs.host,
            wsPort: loWs.port,
            wssPort: loWs.port,
            forceTLS: loWs.scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: tcAuthEndpoint,
            auth: {
                headers: {
                    Authorization: obtenerToken() ? `Bearer ${obtenerToken()}` : '',
                },
            },
        });

        const laSuscripciones = [];

        canales.forEach((tcCanal) => {
            const loCanal = loEcho.private(tcCanal);
            eventos.forEach((tcEventoOriginal) => {
                const tcEvento = normalizarEvento(tcEventoOriginal);
                loCanal.listen(tcEvento, (loPayload) => {
                    if (typeof onEvento === 'function') {
                        onEvento(tcEventoOriginal, loPayload, tcCanal);
                    }
                });
            });
            laSuscripciones.push({ canal: tcCanal, ref: loCanal });
        });

        return {
            detener: () => {
                laSuscripciones.forEach((loItem) => {
                    loEcho.leave(loItem.canal);
                });
                loEcho.disconnect();
            },
        };
    } catch {
        return { detener: () => {} };
    }
}

function normalizarEvento(tcEvento) {
    if (!tcEvento) return '';
    return tcEvento.startsWith('.') ? tcEvento : `.${tcEvento}`;
}

function construirAuthEndpoint(tcApiBaseUrl) {
    if (!tcApiBaseUrl) {
        return '/broadcasting/auth';
    }

    const tcLimpia = tcApiBaseUrl.replace(/\/+$/, '');
    const tcRaiz = tcLimpia.endsWith('/api') ? tcLimpia.slice(0, -4) : tcLimpia;

    return `${tcRaiz}/broadcasting/auth`;
}
