import { empresaService } from '../services/empresaService';
import { obtenerSesion } from './sesionErp';

const tcClaveEmpresaActiva = 'erp_frontend_empresa_activa';
const tcClaveMaquinaActiva = 'erp_frontend_maquina_activa';
const tcClaveEmpresasCache = 'erp_frontend_empresas_cache';
const tnCacheMsEmpresas = 5 * 60 * 1000;

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/core
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * return: Promise<void>
 *
 * Inicializa selector global de empresa en el header y publica cambios.
 */
export async function inicializarContextoEmpresa() {
    const loSelect = document.querySelector('#erp-header-empresa');
    if (!loSelect) return;

    const loSesion = obtenerSesion();
    const loEmpresaActual = obtenerEmpresaActiva();
    const tnEmpresaDefault = normalizarIdEmpresa(loSesion?.empresaDefault);

    if (!loEmpresaActual && tnEmpresaDefault) {
        guardarEmpresaActiva({ id: tnEmpresaDefault, nombre: `Empresa ${tnEmpresaDefault}` });
    }

    loSelect.innerHTML = '<option value="">Todas las empresas</option>';

    const laEmpresas = await cargarEmpresasCacheadas();
    if (!laEmpresas.length) {
        publicarCambioEmpresa();
        return;
    }
    const loEmpresaPersistida = obtenerEmpresaActiva();
    const tnEmpresaSeleccionada = loEmpresaPersistida?.id ?? tnEmpresaDefault ?? null;

    const tcOpciones = laEmpresas.map((loEmpresa) => {
        const tnId = normalizarIdEmpresa(loEmpresa.IdEmpresa ?? loEmpresa.Empresa ?? loEmpresa.id);
        const tcNombre = String(loEmpresa.NombreComercial ?? loEmpresa.RazonSocial ?? loEmpresa.NombreEmpresa ?? `Empresa ${tnId}`);
        return `<option value="${tnId}">${escaparHtml(tcNombre)}</option>`;
    }).join('');

    loSelect.innerHTML = `<option value="">Todas las empresas</option>${tcOpciones}`;

    if (tnEmpresaSeleccionada) {
        loSelect.value = String(tnEmpresaSeleccionada);
        const loEmpresa = laEmpresas.find((loItem) => normalizarIdEmpresa(loItem.IdEmpresa ?? loItem.Empresa ?? loItem.id) === tnEmpresaSeleccionada);
        guardarEmpresaActiva({
            id: tnEmpresaSeleccionada,
            nombre: String(loEmpresa?.NombreComercial ?? loEmpresa?.RazonSocial ?? loEmpresa?.NombreEmpresa ?? `Empresa ${tnEmpresaSeleccionada}`),
        });
    } else {
        loSelect.value = '';
    }

    loSelect.addEventListener('change', () => {
        const tnEmpresa = normalizarIdEmpresa(loSelect.value);
        const tnEmpresaAnterior = obtenerEmpresaActiva()?.id ?? null;

        if (!tnEmpresa) {
            limpiarEmpresaActiva();
            limpiarMaquinaActivaContexto();
            publicarCambioEmpresa();
            return;
        }

        const loEmpresa = laEmpresas.find((loItem) => normalizarIdEmpresa(loItem.IdEmpresa ?? loItem.Empresa ?? loItem.id) === tnEmpresa);
        guardarEmpresaActiva({
            id: tnEmpresa,
            nombre: String(loEmpresa?.NombreComercial ?? loEmpresa?.RazonSocial ?? loEmpresa?.NombreEmpresa ?? `Empresa ${tnEmpresa}`),
        });

        if (tnEmpresaAnterior !== tnEmpresa) {
            limpiarMaquinaActivaContexto();
        }

        publicarCambioEmpresa();
    });

    publicarCambioEmpresa();
}

export function obtenerEmpresaActiva() {
    try {
        const loData = JSON.parse(localStorage.getItem(tcClaveEmpresaActiva) || 'null');
        if (!loData || typeof loData !== 'object') return null;
        const tnId = normalizarIdEmpresa(loData.id);
        if (!tnId) return null;
        return {
            id: tnId,
            nombre: String(loData.nombre ?? `Empresa ${tnId}`),
        };
    } catch {
        return null;
    }
}

export function obtenerEmpresaActivaId() {
    return obtenerEmpresaActiva()?.id ?? null;
}

export function obtenerEmpresaActivaNombre() {
    return obtenerEmpresaActiva()?.nombre ?? '';
}

function guardarEmpresaActiva(loEmpresa) {
    localStorage.setItem(tcClaveEmpresaActiva, JSON.stringify(loEmpresa));
}

function limpiarEmpresaActiva() {
    localStorage.removeItem(tcClaveEmpresaActiva);
}

function limpiarMaquinaActivaContexto() {
    localStorage.removeItem(tcClaveMaquinaActiva);
}

function publicarCambioEmpresa() {
    window.dispatchEvent(new CustomEvent('erp:empresa-activa', {
        detail: {
            empresa: obtenerEmpresaActiva(),
        },
    }));
}

async function cargarEmpresasCacheadas() {
    const loCache = leerCacheEmpresas();
    if (loCache) {
        return loCache;
    }

    const loResultado = await empresaService.listar({ Pagina: 1, TamanoPagina: 500, Estado: 1 });
    if (!loResultado.ok) {
        return [];
    }

    const laEmpresas = normalizarColeccion(loResultado.datos);
    guardarCacheEmpresas(laEmpresas);
    return laEmpresas;
}

function leerCacheEmpresas() {
    try {
        const loRaw = JSON.parse(localStorage.getItem(tcClaveEmpresasCache) || 'null');
        if (!loRaw || typeof loRaw !== 'object') return null;
        if (!Array.isArray(loRaw.items)) return null;
        if (!Number.isFinite(loRaw.ts)) return null;
        if ((Date.now() - loRaw.ts) > tnCacheMsEmpresas) return null;
        return loRaw.items;
    } catch {
        return null;
    }
}

function guardarCacheEmpresas(laEmpresas) {
    localStorage.setItem(tcClaveEmpresasCache, JSON.stringify({
        ts: Date.now(),
        items: Array.isArray(laEmpresas) ? laEmpresas : [],
    }));
}

function normalizarColeccion(lxDatos) {
    if (!lxDatos) return [];
    if (Array.isArray(lxDatos)) return lxDatos;

    const loObjeto = (typeof lxDatos === 'object') ? lxDatos : {};
    const laClaves = ['items', 'Rows', 'rows', 'data', 'lista', 'Datos'];
    for (const tcClave of laClaves) {
        if (Array.isArray(loObjeto[tcClave])) {
            return loObjeto[tcClave];
        }
    }

    return [];
}

function normalizarIdEmpresa(lxValor) {
    if (lxValor === null || lxValor === undefined) return null;
    const tcTexto = String(lxValor).trim();
    if (!tcTexto) return null;

    const tnDirecto = Number(tcTexto);
    if (Number.isFinite(tnDirecto) && tnDirecto > 0) {
        return tnDirecto;
    }

    const loMatch = tcTexto.match(/\d+/);
    if (!loMatch) return null;
    const tnValor = Number(loMatch[0]);
    return Number.isFinite(tnValor) && tnValor > 0 ? tnValor : null;
}

function escaparHtml(tcTexto) {
    return String(tcTexto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
