/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: string tcSelector
 * return: Element|null
 *
 * Busca un elemento en el documento.
 */
export function buscar(tcSelector) {
    return document.querySelector(tcSelector);
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: HTMLButtonElement loBoton
 * param: boolean tlCargando
 * param: string tcTextoCargando
 * return: void
 *
 * Activa o desactiva estado de carga de un boton.
 */
export function setBotonCargando(loBoton, tlCargando, tcTextoCargando = 'Procesando...') {
    if (!loBoton) return;
    if (!loBoton.dataset.textoOriginal) {
        loBoton.dataset.textoOriginal = loBoton.textContent;
    }
    loBoton.disabled = tlCargando;
    loBoton.textContent = tlCargando ? tcTextoCargando : loBoton.dataset.textoOriginal;
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: Element loContenedor
 * param: object loPayload
 * return: void
 *
 * Renderiza mensajes de exito o error en pantalla.
 */
export function renderizarMensaje(loContenedor, loPayload) {
    if (!loContenedor) return;
    if (!loPayload) {
        loContenedor.innerHTML = '';
        return;
    }

    const tcClase = loPayload.ok
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

    const laErrores = Array.isArray(loPayload.errores) ? loPayload.errores : [];
    const tcErrores = laErrores.length
        ? `
            <ul class="mt-2 space-y-1 text-xs">
                ${laErrores.map((loError) => {
                    const tcCampo = loError?.Campo ? `${escaparHtml(loError.Campo)}: ` : '';
                    const tcDetalle = escaparHtml(loError?.Detalle ?? loError?.Mensaje ?? 'Error de validacion');
                    return `<li>• ${tcCampo}${tcDetalle}</li>`;
                }).join('')}
            </ul>
        `
        : '';

    const tlDebug = Boolean(window.__ERP_DEBUG__);
    const tcDetalles = loPayload.detalles && tlDebug
        ? `<pre class="mt-2 overflow-auto rounded bg-white p-2 text-xs">${escaparHtml(JSON.stringify(loPayload.detalles, null, 2))}</pre>`
        : '';

    const tcReplay = loPayload.replay
        ? '<span class="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">repeticion segura</span>'
        : '';

    loContenedor.innerHTML = `
        <div class="rounded border p-3 text-sm ${tcClase}">
            <strong>${loPayload.ok ? 'Correcto' : 'Error'}</strong>${tcReplay}
            <div class="mt-1">${escaparHtml(loPayload.mensaje || 'Operacion finalizada')}</div>
            ${tcErrores}
            ${tcDetalles}
        </div>
    `;
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: Element loContenedor
 * param: Array|Object lxDatos
 * return: void
 *
 * Renderiza datos en formato tabular para consultas del ERP.
 */
export function renderizarTablaDatos(loContenedor, lxDatos, loConfig = {}) {
    if (!loContenedor) return;

    if (!lxDatos || (Array.isArray(lxDatos) && lxDatos.length === 0)) {
        loContenedor.innerHTML = '<p class="text-sm text-slate-500">Sin datos.</p>';
        return;
    }

    if (Array.isArray(lxDatos)) {
        const laColumnas = Array.isArray(loConfig.columnas) && loConfig.columnas.length
            ? loConfig.columnas.map((loColumna) => typeof loColumna === 'string' ? { clave: loColumna, etiqueta: loColumna } : loColumna)
            : [...new Set(lxDatos.flatMap((loItem) => Object.keys(loItem ?? {})))].map((tcColumna) => ({ clave: tcColumna, etiqueta: tcColumna }));
        const tcHeader = laColumnas.map((loColumna) => `<th>${escaparHtml(loColumna.etiqueta ?? loColumna.clave)}</th>`).join('');
        const tcRows = lxDatos.map((loFila) => {
            const tcCells = laColumnas
                .map((loColumna) => {
                    const txValor = typeof loColumna.mapeador === 'function'
                        ? loColumna.mapeador(loFila)
                        : loFila?.[loColumna.clave];
                    return `<td>${escaparHtml(formatearCelda(txValor))}</td>`;
                })
                .join('');
            return `<tr>${tcCells}</tr>`;
        }).join('');

        loContenedor.innerHTML = `
            <div class="erp-tabla-container">
                <table class="erp-tabla">
                    <thead><tr>${tcHeader}</tr></thead>
                    <tbody>${tcRows}</tbody>
                </table>
            </div>
        `;
        return;
    }

    if (typeof lxDatos === 'object') {
        const tcRows = Object.entries(lxDatos).map(([tcClave, lxValor]) => `
            <tr>
                <th>${escaparHtml(tcClave)}</th>
                <td>${escaparHtml(formatearCelda(lxValor))}</td>
            </tr>
        `).join('');

        loContenedor.innerHTML = `<div class="erp-tabla-container"><table class="erp-tabla">${tcRows}</table></div>`;
        return;
    }

    loContenedor.textContent = String(lxDatos);
}

function formatearCelda(lxValor) {
    if (lxValor === null || lxValor === undefined) return '';
    if (Array.isArray(lxValor)) {
        if (!lxValor.length) return '';
        if (lxValor.every((lxItem) => ['string', 'number', 'boolean'].includes(typeof lxItem))) {
            return lxValor.join(', ');
        }
        return `${lxValor.length} elemento(s)`;
    }
    if (typeof lxValor === 'object') {
        const laEntradas = Object.entries(lxValor)
            .filter(([, lxItem]) => lxItem !== null && lxItem !== undefined && typeof lxItem !== 'object')
            .slice(0, 3)
            .map(([tcClave, lxItem]) => `${tcClave}: ${lxItem}`);

        if (laEntradas.length) {
            return laEntradas.join(' | ');
        }

        const laClaves = Object.keys(lxValor);
        return laClaves.length ? `Objeto (${laClaves.length} campos)` : 'Objeto';
    }
    return String(lxValor);
}

function escaparHtml(tcTexto) {
    return String(tcTexto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
