import { buscar, renderizarTablaDatos } from '../utils/dom';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/ui
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Componente tabla paginada server-side.
 */
export class TablaPaginada {
    constructor({ selectorContenedor, onCambiarPagina }) {
        this.loContenedor = buscar(selectorContenedor);
        this.onCambiarPagina = onCambiarPagina;
        this.loMeta = {
            PaginaActual: 1,
            TotalPaginas: 1,
            TamanoPagina: 20,
            TotalRegistros: 0,
        };
    }

    renderizar(lxDatos, loMeta = null) {
        if (loMeta) {
            this.loMeta = {
                ...this.loMeta,
                ...loMeta,
            };
        }

        if (!this.loContenedor) return;

        const loTabla = document.createElement('div');
        renderizarTablaDatos(loTabla, lxDatos);

        const loPaginacion = document.createElement('div');
        loPaginacion.className = 'mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600';
        loPaginacion.innerHTML = `
            <div>
                Registros: <strong>${this.loMeta.TotalRegistros ?? 0}</strong> |
                Pagina <strong>${this.loMeta.PaginaActual ?? 1}</strong> de <strong>${this.loMeta.TotalPaginas ?? 1}</strong>
            </div>
            <div class="flex items-center gap-2">
                <button data-anterior class="erp-btn erp-btn--secundario">Anterior</button>
                <button data-siguiente class="erp-btn erp-btn--secundario">Siguiente</button>
            </div>
        `;

        this.loContenedor.innerHTML = '';
        this.loContenedor.appendChild(loTabla);
        this.loContenedor.appendChild(loPaginacion);

        loPaginacion.querySelector('[data-anterior]')?.addEventListener('click', () => this.cambiarPagina(-1));
        loPaginacion.querySelector('[data-siguiente]')?.addEventListener('click', () => this.cambiarPagina(1));
    }

    cambiarPagina(tnDelta) {
        const tnActual = Number(this.loMeta.PaginaActual ?? 1);
        const tnTotal = Number(this.loMeta.TotalPaginas ?? 1);
        const tnNueva = tnActual + tnDelta;

        if (tnNueva < 1 || tnNueva > tnTotal) return;

        if (typeof this.onCambiarPagina === 'function') {
            this.onCambiarPagina(tnNueva, this.loMeta);
        }
    }
}
