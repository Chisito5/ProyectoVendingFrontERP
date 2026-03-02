import { obtenerConfiguracionFrontend } from '../core/sesionErp';

const tcUrlApiDefecto = 'http://127.0.0.1:8000/api';
const tnTimeoutDefecto = 15000;
const tcRutaApiAlternaLaragon = '/PagoFacil_ERPVendingMachine/public/api';

const loConfigFrontend = obtenerConfiguracionFrontend();
const tcBaseConfigurada = loConfigFrontend.apiBaseUrl || import.meta.env.VITE_ERP_API_BASE_URL || tcUrlApiDefecto;
const laBaseUrlsApi = construirBaseUrlsApi(tcBaseConfigurada);
let tcBaseUrlActiva = laBaseUrlsApi[0] || tcUrlApiDefecto;

export const configuracionApi = {
    baseURL: tcBaseUrlActiva,
    timeout: Number(loConfigFrontend.apiTimeout || import.meta.env.VITE_ERP_API_TIMEOUT_MS || tnTimeoutDefecto),
};

export function obtenerBaseUrlActiva() {
    return tcBaseUrlActiva;
}

export function establecerBaseUrlActiva(tcBaseUrl) {
    if (!tcBaseUrl) return;
    tcBaseUrlActiva = limpiarUrl(tcBaseUrl);
}

export function obtenerBaseUrlsApi() {
    return [...laBaseUrlsApi];
}

function construirBaseUrlsApi(tcBaseInicial) {
    const laCandidatas = [];
    const tcHostActual = obtenerHostActual();
    const tlHostActualLoopback = esHostLoopback(tcHostActual);
    let tcBaseConHostActual = '';

    try {
        const loUrlInicial = new URL(tcBaseInicial);
        if (esHostLoopback(loUrlInicial.hostname) && tcHostActual && !tlHostActualLoopback) {
            loUrlInicial.hostname = tcHostActual;
            loUrlInicial.protocol = window.location.protocol || loUrlInicial.protocol;
            tcBaseConHostActual = loUrlInicial.toString();
        }
    } catch {
        // Ignorar parseo y continuar con defaults.
    }

    if (tcBaseConHostActual) {
        agregarUrl(laCandidatas, tcBaseConHostActual);
    }

    agregarUrl(laCandidatas, tcBaseInicial);
    agregarUrl(laCandidatas, import.meta.env.VITE_ERP_API_BASE_URL || '');
    agregarUrl(laCandidatas, tcUrlApiDefecto);

    if (window?.location?.origin) {
        agregarUrl(laCandidatas, `${window.location.origin}/api`);
        agregarUrl(laCandidatas, `${window.location.origin}${tcRutaApiAlternaLaragon}`);
    }

    return laCandidatas.length ? laCandidatas : [tcUrlApiDefecto];
}

function agregarUrl(laCandidatas, tcUrl) {
    const tcNormalizada = limpiarUrl(tcUrl);
    if (!tcNormalizada) return;
    if (!laCandidatas.includes(tcNormalizada)) {
        laCandidatas.push(tcNormalizada);
    }
}

function limpiarUrl(tcUrl) {
    if (!tcUrl) return '';
    return String(tcUrl).trim().replace(/\/+$/, '');
}

function obtenerHostActual() {
    return window?.location?.hostname || '';
}

function esHostLoopback(tcHost) {
    const tc = String(tcHost || '').toLowerCase();
    return tc === '127.0.0.1' || tc === 'localhost' || tc === '::1';
}
