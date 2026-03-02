/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/api
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * return: string
 *
 * Genera una clave de idempotencia unica por accion.
 */
export function generarClaveIdempotencia() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    const tcRandom = Math.random().toString(16).slice(2);
    return `idem-${Date.now()}-${tcRandom}`;
}
