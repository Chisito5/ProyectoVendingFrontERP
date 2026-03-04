import axios from 'axios';
import { actualizarTokens, limpiarSesion, obtenerRefreshToken, obtenerToken } from '../core/sesionErp';
import { configuracionApi, establecerBaseUrlActiva, obtenerBaseUrlActiva, obtenerBaseUrlsApi } from './config';
import { generarClaveIdempotencia } from './idempotencia';

const loCliente = axios.create({
    baseURL: obtenerBaseUrlActiva(),
    timeout: configuracionApi.timeout,
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

let tlRefrescando = false;

loCliente.interceptors.request.use((loConfig) => {
    loConfig.baseURL = obtenerBaseUrlActiva();
    loConfig.headers = loConfig.headers || {};
    loConfig.headers.Accept = loConfig.headers.Accept || 'application/json';
    loConfig.headers['X-Requested-With'] = loConfig.headers['X-Requested-With'] || 'XMLHttpRequest';

    if (esFormData(loConfig.data)) {
        delete loConfig.headers['Content-Type'];
    } else if (loConfig.data !== undefined && loConfig.data !== null && !loConfig.headers['Content-Type']) {
        loConfig.headers['Content-Type'] = 'application/json';
    }

    const tcToken = obtenerToken();
    if (tcToken) {
        loConfig.headers.Authorization = `Bearer ${tcToken}`;
    }
    return loConfig;
});

loCliente.interceptors.response.use(
    (loRespuesta) => loRespuesta,
    async (loError) => {
        const loOriginal = loError.config;
        const tnStatus = loError?.response?.status;

        if (tnStatus === 401 && !loOriginal?._reintento) {
            loOriginal._reintento = true;
            const tlRenovado = await refrescarToken();
            if (tlRenovado) {
                const tcNuevoToken = obtenerToken();
                if (tcNuevoToken) {
                    loOriginal.headers.Authorization = `Bearer ${tcNuevoToken}`;
                }
                return loCliente(loOriginal);
            }
            redirigirPorSesionExpirada();
        }

        return Promise.reject(loError);
    }
);

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/api
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: object loSolicitud
 * return: Promise<object>
 *
 * Ejecuta una solicitud HTTP y normaliza respuesta del backend ERP.
 */
export async function solicitarApi({ method = 'get', url, params, data, headers = {}, idempotente = false, claveIdempotencia = null }) {
    const loHeaders = { ...headers };

    if (idempotente) {
        loHeaders['Clave-Idempotencia'] = claveIdempotencia || generarClaveIdempotencia();
    }

    try {
        const loSolicitud = { method, url, params, data, headers: loHeaders };
        const loRespuesta = await loCliente.request(loSolicitud);
        const loNormalizado = normalizarExito(loRespuesta);
        if (debeReintentarPorPayloadNoRoute(loNormalizado, method)) {
            const loReintentoPayload = await reintentarConBasesAlternas({ method, url, params, data, headers: loHeaders });
            if (loReintentoPayload) {
                return normalizarExito(loReintentoPayload);
            }
        }
        return loNormalizado;
    } catch (loError) {
        if (debeReintentarConAlterna(loError, method)) {
            const loReintentoHttp = await reintentarConBasesAlternas({ method, url, params, data, headers: loHeaders });
            if (loReintentoHttp) {
                return normalizarExito(loReintentoHttp);
            }
        }
        if (!loError?.response) {
            const loReintento = await reintentarConBasesAlternas({ method, url, params, data, headers: loHeaders });
            if (loReintento) {
                return normalizarExito(loReintento);
            }
        }
        return normalizarError(loError);
    }
}

async function refrescarToken() {
    if (tlRefrescando) return false;

    const tcRefresh = obtenerRefreshToken();
    if (!tcRefresh) return false;

    tlRefrescando = true;

    try {
        const loRespuesta = await solicitarRefreshConFallback(tcRefresh);

        const loPayload = loRespuesta.data ?? {};
        if (!(loPayload.Ok ?? false)) {
            return false;
        }

        const loDatos = loPayload.Datos ?? {};
        const tcTokenNuevo = loDatos.Token ?? loDatos.token ?? null;
        const tcRefreshNuevo = loDatos.RefreshToken ?? loDatos.refresh_token ?? tcRefresh;

        if (!tcTokenNuevo) return false;

        actualizarTokens(tcTokenNuevo, tcRefreshNuevo);
        return true;
    } catch {
        return false;
    } finally {
        tlRefrescando = false;
    }
}

async function solicitarRefreshConFallback(tcRefresh) {
    const laBases = obtenerBaseUrlsApi();
    const tcBaseActiva = obtenerBaseUrlActiva();
    const laOrden = [tcBaseActiva, ...laBases.filter((tcBase) => tcBase !== tcBaseActiva)];

    for (const tcBase of laOrden) {
        try {
            const loRespuesta = await axios.post(
                `${tcBase}/auth/refresh`,
                { RefreshToken: tcRefresh },
                {
                    timeout: configuracionApi.timeout,
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );
            establecerBaseUrlActiva(tcBase);
            return loRespuesta;
        } catch (loError) {
            if (loError?.response) {
                throw loError;
            }
        }
    }

    throw new Error('No fue posible renovar sesion en ninguna URL de API configurada.');
}

async function reintentarConBasesAlternas(loSolicitudBase) {
    const tcBaseActiva = obtenerBaseUrlActiva();
    const laAlternas = obtenerBaseUrlsApi().filter((tcBase) => tcBase !== tcBaseActiva);

    for (const tcBase of laAlternas) {
        try {
            const loRespuesta = await loCliente.request({
                ...loSolicitudBase,
                baseURL: tcBase,
            });
            establecerBaseUrlActiva(tcBase);
            return loRespuesta;
        } catch (loError) {
            if (loError?.response) {
                return null;
            }
        }
    }

    return null;
}

function normalizarExito(loRespuesta) {
    const loPayload = loRespuesta.data ?? {};
    const tlOk = loPayload.Ok ?? true;
    const tnStatus = loRespuesta.status;

    if (!tlOk && esSesionExpirada(loPayload, tnStatus)) {
        redirigirPorSesionExpirada();
    }

    return {
        ok: Boolean(tlOk),
        mensaje: loPayload.Mensaje || 'Operacion completada',
        datos: loPayload.Datos ?? loPayload,
        errores: loPayload.Errores ?? [],
        meta: loPayload.Meta ?? null,
        status: tnStatus,
        replay: loRespuesta.headers?.['x-repeticion-idempotencia'] === 'si',
    };
}

function normalizarError(loError) {
    const loRespuesta = loError.response;
    if (!loRespuesta) {
        return {
            ok: false,
            mensaje: 'No se pudo conectar con el backend ERP',
            status: 0,
            detalles: loError.message,
            errores: [],
            replay: false,
        };
    }

    const loPayload = loRespuesta.data ?? {};
    if (esSesionExpirada(loPayload, loRespuesta.status)) {
        redirigirPorSesionExpirada();
    }

    return {
        ok: false,
        mensaje: loPayload.Mensaje || loPayload.message || `Error HTTP ${loRespuesta.status}`,
        status: loRespuesta.status,
        detalles: loPayload,
        errores: loPayload.Errores ?? [],
        meta: loPayload.Meta ?? null,
        replay: loRespuesta.headers?.['x-repeticion-idempotencia'] === 'si',
    };
}

function esSesionExpirada(loPayload = {}, tnStatus = 0) {
    if (tnStatus === 401 || tnStatus === 403) {
        return true;
    }

    const tcMensaje = String(loPayload.Mensaje ?? loPayload.message ?? '').toLowerCase();
    const laErrores = Array.isArray(loPayload.Errores) ? loPayload.Errores : [];
    const laCodigos = laErrores.map((loError) => String(loError?.Codigo ?? '').toUpperCase());

    return (
        laCodigos.includes('AUTH_401') ||
        laCodigos.includes('NO_AUTENTICADO') ||
        tcMensaje.includes('no autenticado') ||
        tcMensaje.includes('debe iniciar sesion')
    );
}

function redirigirPorSesionExpirada() {
    limpiarSesion();

    if (esRutaAcceso(window.location.pathname)) {
        return;
    }

    window.location.href = obtenerUrlAccesoForzar();
}

function obtenerUrlAccesoForzar() {
    const tcDesdeConfig = window.__ERP_FRONTEND_CONFIG__?.urls?.accesoForzar;
    if (tcDesdeConfig) {
        return tcDesdeConfig;
    }

    const tcPath = String(window.location.pathname || '');
    const tnIndicePublic = tcPath.indexOf('/public/');
    if (tnIndicePublic >= 0) {
        const tcPrefijo = tcPath.slice(0, tnIndicePublic + '/public'.length);
        return `${tcPrefijo}/acceso?forzar=1`;
    }

    if (tcPath.endsWith('/public')) {
        return `${tcPath}/acceso?forzar=1`;
    }

    return '/acceso?forzar=1';
}

function esRutaAcceso(tcPathname = '') {
    const tc = String(tcPathname || '');
    return (
        tc === '/acceso' ||
        tc.endsWith('/acceso') ||
        tc.includes('/public/acceso')
    );
}

function esFormData(lxData) {
    return typeof FormData !== 'undefined' && lxData instanceof FormData;
}

function debeReintentarConAlterna(loError, tcMetodo = 'get') {
    const tnStatus = Number(loError?.response?.status || 0);
    const tcMetodoNormalizado = String(tcMetodo || 'get').toLowerCase();
    if (!['get', 'head', 'options'].includes(tcMetodoNormalizado)) return false;
    return tnStatus === 404 || tnStatus === 500 || tnStatus === 503;
}

function debeReintentarPorPayloadNoRoute(loNormalizado, tcMetodo = 'get') {
    const tcMetodoNormalizado = String(tcMetodo || 'get').toLowerCase();
    if (!['get', 'head', 'options'].includes(tcMetodoNormalizado)) return false;
    if (loNormalizado?.ok !== false) return false;

    const tcMensaje = String(loNormalizado?.mensaje || '').toLowerCase();
    const tlNoRoute = tcMensaje.includes('could not be found') || tcMensaje.includes('route') && tcMensaje.includes('not found');
    const tlErpV1 = tcMensaje.includes('/erp/v1/');
    return tlNoRoute && tlErpV1;
}
