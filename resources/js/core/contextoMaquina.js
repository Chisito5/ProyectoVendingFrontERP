import { maquinaService } from '../services/maquinaService';
import { obtenerEmpresaActivaId } from './contextoEmpresa';

const tcClaveMaquinaActiva = 'erp_frontend_maquina_activa';
const tcPrefijoCacheMaquinas = 'erp_frontend_maquinas_cache_v2_';
const tnCacheMsMaquinas = 2 * 60 * 1000;

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/core
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * return: Promise<void>
 *
 * Inicializa contexto global de maquina en header y sincroniza vistas.
 */
export async function inicializarContextoMaquina() {
    const loSelect = document.querySelector('#erp-header-maquina');
    if (!loSelect) return;

    loSelect.innerHTML = '<option value="">Todas las maquinas</option>';
    loSelect.addEventListener('change', () => {
        const tnMaquina = normalizarId(loSelect.value);
        if (!tnMaquina) {
            limpiarMaquinaActiva();
            publicarCambioMaquina();
            return;
        }

        const tcNombre = loSelect.options[loSelect.selectedIndex]?.textContent?.trim() || `Maquina ${tnMaquina}`;
        guardarMaquinaActiva({
            id: tnMaquina,
            nombre: tcNombre,
            empresaId: obtenerEmpresaActivaId(),
        });
        publicarCambioMaquina();
    });

    window.addEventListener('erp:empresa-activa', async () => {
        await cargarOpcionesMaquinaHeader();
    });

    await cargarOpcionesMaquinaHeader();
}

export function obtenerMaquinaActiva() {
    try {
        const loData = JSON.parse(localStorage.getItem(tcClaveMaquinaActiva) || 'null');
        if (!loData || typeof loData !== 'object') return null;
        const tnId = normalizarId(loData.id);
        if (!tnId) return null;
        return {
            id: tnId,
            nombre: String(loData.nombre ?? `Maquina ${tnId}`),
            empresaId: normalizarId(loData.empresaId),
        };
    } catch {
        return null;
    }
}

export function obtenerMaquinaActivaId() {
    return obtenerMaquinaActiva()?.id ?? null;
}

async function cargarOpcionesMaquinaHeader() {
    const loSelect = document.querySelector('#erp-header-maquina');
    if (!loSelect) return;

    const tnEmpresa = obtenerEmpresaActivaId();
    const laCache = leerCacheMaquinas(tnEmpresa);
    const loFiltros = {
        Pagina: 1,
        TamanoPagina: 500,
        ...(tnEmpresa ? { Empresa: tnEmpresa } : {}),
    };

    const laMaquinas = (Array.isArray(laCache) && laCache.length > 0)
        ? laCache
        : await cargarMaquinasDesdeApi(loFiltros, tnEmpresa);
    const loPersistida = obtenerMaquinaActiva();

    let loSeleccion = null;
    if (loPersistida && laMaquinas.some((loMaquina) => normalizarId(loMaquina.IdMaquina ?? loMaquina.Maquina ?? loMaquina.id) === loPersistida.id)) {
        loSeleccion = loPersistida;
    } else {
        limpiarMaquinaActiva();
    }

    const laOpciones = laMaquinas.map((loMaquina) => {
        const tnId = normalizarId(
            loMaquina.IdMaquina ??
            loMaquina.Maquina ??
            loMaquina.id ??
            loMaquina.Id ??
            loMaquina.IdMaquinaEmpresa
        );
        if (!tnId) return '';
        const tcNombre = String(loMaquina.CodigoMaquina ?? loMaquina.NombreMaquina ?? loMaquina.Nombre ?? `Maquina ${tnId}`);
        return `<option value="${tnId}">${escaparHtml(tcNombre)}</option>`;
    }).filter(Boolean);
    const tcOpciones = laOpciones.join('');

    loSelect.innerHTML = `<option value="">Todas las maquinas</option>${tcOpciones}`;
    loSelect.value = loSeleccion?.id ? String(loSeleccion.id) : '';

    publicarCambioMaquina();
}

async function cargarMaquinasDesdeApi(loFiltros, tnEmpresa) {
    const laIntentos = [];
    const loBase = {
        Pagina: loFiltros?.Pagina ?? 1,
        TamanoPagina: loFiltros?.TamanoPagina ?? 500,
    };

    if (tnEmpresa) {
        laIntentos.push({ ...loBase, Empresa: tnEmpresa });
        laIntentos.push({ ...loBase, IdEmpresa: tnEmpresa });
        laIntentos.push({ ...loBase, EmpresaId: tnEmpresa });
        laIntentos.push({ ...loBase, Empresa: tnEmpresa, Estado: 1 });
        laIntentos.push({ ...loBase, IdEmpresa: tnEmpresa, Estado: 1 });
        laIntentos.push({ ...loBase, EmpresaId: tnEmpresa, Estado: 1 });
    } else {
        laIntentos.push({ ...loBase });
        laIntentos.push({ ...loBase, Estado: 1 });
    }

    let laMaquinas = [];
    for (const loIntento of laIntentos) {
        const loResultado = await maquinaService.listar(loIntento);
        if (!loResultado.ok) continue;
        laMaquinas = normalizarColeccion(loResultado.datos);
        if (laMaquinas.length) break;
    }

    if (!laMaquinas.length && tnEmpresa) {
        const loResultadoGeneral = await maquinaService.listar(loBase);
        if (loResultadoGeneral.ok) {
            const laGeneral = normalizarColeccion(loResultadoGeneral.datos);
            laMaquinas = filtrarMaquinasPorEmpresa(laGeneral, tnEmpresa);
        }
    }

    if (laMaquinas.length > 0) {
        guardarCacheMaquinas(tnEmpresa, laMaquinas);
    }
    return laMaquinas;
}

function leerCacheMaquinas(tnEmpresa) {
    const tcClave = `${tcPrefijoCacheMaquinas}${tnEmpresa || 0}`;
    try {
        const loRaw = JSON.parse(localStorage.getItem(tcClave) || 'null');
        if (!loRaw || typeof loRaw !== 'object') return null;
        if (!Array.isArray(loRaw.items)) return null;
        if (loRaw.items.length === 0) return null;
        if (!Number.isFinite(loRaw.ts)) return null;
        if ((Date.now() - loRaw.ts) > tnCacheMsMaquinas) return null;
        return loRaw.items;
    } catch {
        return null;
    }
}

function guardarCacheMaquinas(tnEmpresa, laMaquinas) {
    const tcClave = `${tcPrefijoCacheMaquinas}${tnEmpresa || 0}`;
    localStorage.setItem(tcClave, JSON.stringify({
        ts: Date.now(),
        items: Array.isArray(laMaquinas) ? laMaquinas : [],
    }));
}

function publicarCambioMaquina() {
    window.dispatchEvent(new CustomEvent('erp:maquina-activa', {
        detail: {
            maquina: obtenerMaquinaActiva(),
        },
    }));
}

function guardarMaquinaActiva(loMaquina) {
    localStorage.setItem(tcClaveMaquinaActiva, JSON.stringify(loMaquina));
}

export function limpiarMaquinaActiva() {
    localStorage.removeItem(tcClaveMaquinaActiva);
}

function normalizarColeccion(lxDatos) {
    if (!lxDatos) return [];
    if (Array.isArray(lxDatos)) return lxDatos;
    if (typeof lxDatos !== 'object') return [];

    const laClaves = ['Rows', 'rows', 'items', 'lista', 'data', 'Datos'];
    for (const tcClave of laClaves) {
        if (Array.isArray(lxDatos[tcClave])) {
            return lxDatos[tcClave];
        }
    }

    for (const tcClave in lxDatos) {
        if (Object.prototype.hasOwnProperty.call(lxDatos, tcClave) && Array.isArray(lxDatos[tcClave])) {
            return lxDatos[tcClave];
        }
    }

    const laPlano = Object.values(lxDatos);
    if (laPlano.length === 1 && laPlano[0] && typeof laPlano[0] === 'object') {
        for (const tcClave of laClaves) {
            if (Array.isArray(laPlano[0][tcClave])) {
                return laPlano[0][tcClave];
            }
        }
    }

    if (lxDatos.Datos && typeof lxDatos.Datos === 'object') {
        return normalizarColeccion(lxDatos.Datos);
    }

    if (laPlano.length > 0 && laPlano.every((loItem) => loItem && typeof loItem === 'object' && !Array.isArray(loItem))) {
        return laPlano;
    }

    return [];
}

function filtrarMaquinasPorEmpresa(laMaquinas, tnEmpresa) {
    if (!Array.isArray(laMaquinas) || !tnEmpresa) return [];
    return laMaquinas.filter((loMaquina) => {
        const tnEmpresaItem = normalizarId(
            loMaquina.Empresa ??
            loMaquina.IdEmpresa ??
            loMaquina.EmpresaId ??
            loMaquina.IdEmpresaMaquina
        );
        return tnEmpresaItem === tnEmpresa;
    });
}

function normalizarId(lxValor) {
    if (lxValor === null || lxValor === undefined) return null;
    const tcTexto = String(lxValor).trim();
    if (!tcTexto) return null;
    const tnDirecto = Number(tcTexto);
    if (Number.isFinite(tnDirecto) && tnDirecto > 0) return tnDirecto;

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
