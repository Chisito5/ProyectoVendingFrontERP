import { buscar, renderizarTablaDatos } from '../utils/dom';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/ui
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Drawer lateral para mostrar detalle de registros.
 */
export function abrirDrawerDetalle({ titulo = 'Detalle', datos = null, secciones = null }) {
    const loNodo = buscar('#erp-drawer-detalle');
    if (!loNodo) return;

    loNodo.className = 'erp-drawer-capa';
    loNodo.innerHTML = `
        <section class="erp-drawer">
            <header class="sticky top-0 z-10 border-b bg-white px-4 py-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-bold">${titulo}</h3>
                    <button data-cerrar class="erp-btn erp-btn--secundario">Cerrar</button>
                </div>
            </header>
            <div id="erp-drawer-contenido" class="p-4"></div>
        </section>
    `;

    const loContenido = loNodo.querySelector('#erp-drawer-contenido');
    if (Array.isArray(secciones) && secciones.length) {
        renderizarSecciones(loContenido, secciones);
    } else {
        const loTabla = document.createElement('div');
        renderizarTablaDatos(loTabla, datos);
        loContenido?.appendChild(loTabla);
    }

    const fnCerrar = () => {
        loNodo.className = 'hidden';
        loNodo.innerHTML = '';
    };

    loNodo.querySelector('[data-cerrar]')?.addEventListener('click', fnCerrar);
    loNodo.addEventListener('click', (loEvento) => {
        if (loEvento.target === loNodo) {
            fnCerrar();
        }
    }, { once: true });
}

function renderizarSecciones(loContenido, laSecciones) {
    if (!loContenido) return;

    const tcHtml = laSecciones.map((loSeccion) => `
        <section class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h4 class="text-sm font-bold text-slate-800">${escaparHtml(loSeccion.titulo ?? 'Seccion')}</h4>
            <div data-seccion-contenido="${escaparHtml(loSeccion.id ?? loSeccion.titulo ?? 'seccion')}" class="mt-2"></div>
        </section>
    `).join('');

    loContenido.innerHTML = tcHtml;

    laSecciones.forEach((loSeccion) => {
        const tcId = loSeccion.id ?? loSeccion.titulo ?? 'seccion';
        const loDestino = loContenido.querySelector(`[data-seccion-contenido="${cssEscape(tcId)}"]`);
        if (!loDestino) return;

        if (loSeccion.tipo === 'lista') {
            const laItems = Array.isArray(loSeccion.datos) ? loSeccion.datos : [];
            if (!laItems.length) {
                loDestino.innerHTML = '<p class="text-xs text-slate-500">Sin datos.</p>';
                return;
            }
            loDestino.innerHTML = `<ul class="list-disc pl-5 text-xs text-slate-700">${laItems.map((tcItem) => `<li>${escaparHtml(tcItem)}</li>`).join('')}</ul>`;
            return;
        }

        if (loSeccion.tipo === 'resumen') {
            const loDatos = loSeccion.datos ?? {};
            const laEntradas = Object.entries(loDatos);
            if (!laEntradas.length) {
                loDestino.innerHTML = '<p class="text-xs text-slate-500">Sin datos.</p>';
                return;
            }
            loDestino.innerHTML = `
                <div class="grid gap-2 md:grid-cols-2">
                    ${laEntradas.map(([tcClave, lxValor]) => `
                        <article class="rounded border border-slate-200 bg-white px-2 py-1.5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">${escaparHtml(tcClave)}</p>
                            <p class="mt-1 text-xs text-slate-800">${escaparHtml(formatearValor(lxValor))}</p>
                        </article>
                    `).join('')}
                </div>
            `;
            return;
        }

        renderizarTablaDatos(loDestino, loSeccion.datos, loSeccion.tablaConfig ?? {});
    });
}

function formatearValor(lxValor) {
    if (lxValor === null || lxValor === undefined || lxValor === '') return 'N/D';
    if (Array.isArray(lxValor)) return `${lxValor.length} elemento(s)`;
    if (typeof lxValor === 'object') return 'Objeto';
    return String(lxValor);
}

function escaparHtml(tcTexto) {
    return String(tcTexto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cssEscape(tcTexto) {
    if (window.CSS?.escape) return window.CSS.escape(tcTexto);
    return String(tcTexto).replace(/"/g, '\\"');
}
