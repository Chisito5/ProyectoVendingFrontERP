/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/core
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Gestion de sesion local del frontend ERP.
 */
const tcClaveStorage = 'erp_frontend_sesion';

export function obtenerConfiguracionFrontend() {
    return window.__ERP_FRONTEND_CONFIG__ ?? {};
}

export function inicializarSesion() {
    const loConfig = obtenerConfiguracionFrontend();
    const loSesionServidor = loConfig.sesion ?? {};
    const loSesionStorage = leerSesionStorage();

    const loSesion = {
        token: loSesionServidor.token ?? loSesionStorage.token ?? null,
        refreshToken: loSesionServidor.refreshToken ?? loSesionStorage.refreshToken ?? null,
        rol: loSesionServidor.rol ?? loSesionStorage.rol ?? 'Operador',
        usuario: loSesionServidor.usuario ?? loSesionStorage.usuario ?? null,
        empresaDefault: loSesionServidor.empresaDefault ?? loSesionStorage.empresaDefault ?? null,
        permisos: Array.isArray(loSesionServidor.permisos) && loSesionServidor.permisos.length
            ? loSesionServidor.permisos
            : (Array.isArray(loSesionStorage.permisos) ? loSesionStorage.permisos : []),
    };

    guardarSesion(loSesion);

    return loSesion;
}

export function obtenerSesion() {
    return leerSesionStorage();
}

export function guardarSesion(loSesion) {
    localStorage.setItem(tcClaveStorage, JSON.stringify(loSesion ?? {}));
}

export function limpiarSesion() {
    localStorage.removeItem(tcClaveStorage);
}

export function obtenerToken() {
    return obtenerSesion().token ?? null;
}

export function obtenerRefreshToken() {
    return obtenerSesion().refreshToken ?? null;
}

export function actualizarTokens(tcToken, tcRefreshToken = null) {
    const loSesion = obtenerSesion();
    loSesion.token = tcToken;
    if (tcRefreshToken !== null) {
        loSesion.refreshToken = tcRefreshToken;
    }
    guardarSesion(loSesion);
}

export function tienePermiso(tcPermiso) {
    const loSesion = obtenerSesion();
    const laPermisos = Array.isArray(loSesion.permisos) ? loSesion.permisos : [];
    if ((loSesion.rol ?? '').toLowerCase() === 'admin') return true;
    return laPermisos.includes('*') || laPermisos.includes(tcPermiso);
}

function leerSesionStorage() {
    try {
        return JSON.parse(localStorage.getItem(tcClaveStorage) || '{}');
    } catch {
        return {};
    }
}
