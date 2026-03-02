import { productoService } from '../services/productoService';
import { analiticaService } from '../services/analiticaService';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { mapearResultadoAnalitica, toArray } from '../utils/tableroAdaptadores';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa consultas de analitica ejecutiva con filtros homologados.
 */
export function iniciarPaginaAnalitica() {
    const loFormulario = buscar('#form-analitica');
    const loMensaje = buscar('#analitica-mensaje');
    const loResumen = buscar('#analitica-resumen');
    const loTabla = buscar('#analitica-tabla');
    const loResumenListado = buscar('#analitica-resumen-listado');

    const loBtnConsultar = buscar('#btn-analitica-consultar');
    const loBtnLimpiar = buscar('#btn-analitica-limpiar');
    const loBtnAnterior = buscar('#btn-analitica-anterior');
    const loBtnSiguiente = buscar('#btn-analitica-siguiente');

    let loMeta = {
        PaginaActual: 1,
        TamanoPagina: 20,
        TotalRegistros: 0,
        TotalPaginas: 1,
    };

    aplicarEmpresaMaquinaEnFormulario(loFormulario, { empresa: true, maquina: true });
    aplicarFechasPorDefecto();

    loBtnConsultar?.addEventListener('click', async () => {
        loFormulario.querySelector('input[name="Pagina"]').value = 1;
        await cargarAnalitica();
    });

    loBtnLimpiar?.addEventListener('click', async () => {
        loFormulario.reset();
        aplicarFechasPorDefecto();
        loFormulario.querySelector('input[name="Pagina"]').value = 1;
        loFormulario.querySelector('input[name="TamanoPagina"]').value = 20;
        await cargarAnalitica();
    });

    loBtnAnterior?.addEventListener('click', async () => {
        if (loMeta.PaginaActual <= 1) return;
        loFormulario.querySelector('input[name="Pagina"]').value = loMeta.PaginaActual - 1;
        await cargarAnalitica();
    });

    loBtnSiguiente?.addEventListener('click', async () => {
        if (loMeta.PaginaActual >= loMeta.TotalPaginas) return;
        loFormulario.querySelector('input[name="Pagina"]').value = loMeta.PaginaActual + 1;
        await cargarAnalitica();
    });

    async function cargarAnalitica() {
        setBotonCargando(loBtnConsultar, true, 'Consultando...');
        const loFiltros = obtenerFiltros();
        const loResultado = await consultarAnalitica(loFiltros.Tipo, loFiltros);

        if (loResultado.ok) {
            const loNormalizado = mapearResultadoAnalitica(loResultado.datos);
            loMeta = extraerMeta(loResultado.meta, loFiltros);

            pintarResumen(loNormalizado.resumen);
            renderizarTabla(loNormalizado.filas);
            pintarKpis(loFiltros.Tipo, loNormalizado.filas.length, loMeta);
        } else {
            loResumen.innerHTML = '';
            loTabla.innerHTML = '';
            pintarKpis(loFiltros.Tipo, 0, loMeta);
        }

        loResumenListado.textContent = `Registros: ${loMeta.TotalRegistros} | Pagina ${loMeta.PaginaActual} de ${loMeta.TotalPaginas}`;
        renderizarMensaje(loMensaje, loResultado);
        setBotonCargando(loBtnConsultar, false);
    }

    async function consultarAnalitica(tcTipo, loFiltros) {
        if (tcTipo === 'resumen') return analiticaService.resumen(loFiltros);
        if (tcTipo === 'ventas') return analiticaService.ventas(loFiltros);
        if (tcTipo === 'rotacion') return analiticaService.rotacion(loFiltros);
        if (tcTipo === 'stockout') return analiticaService.stockout(loFiltros);
        if (tcTipo === 'rentabilidad') return analiticaService.rentabilidad(loFiltros);
        return analiticaService.mermas(loFiltros);
    }

    function obtenerFiltros() {
        const loPayload = obtenerFiltrosDeFormulario(loFormulario);
        return {
            Tipo: loPayload.Tipo || 'resumen',
            Empresa: loPayload.Empresa || undefined,
            Maquina: loPayload.Maquina || undefined,
            Producto: loPayload.Producto || undefined,
            FechaDesde: loPayload.FechaDesde || undefined,
            FechaHasta: loPayload.FechaHasta || undefined,
            Pagina: Number(loPayload.Pagina || 1),
            TamanoPagina: Number(loPayload.TamanoPagina || 20),
        };
    }

    function pintarResumen(loResumenDatos) {
        const laEntradas = Object.entries(loResumenDatos || {});
        if (!laEntradas.length) {
            loResumen.innerHTML = '<p class="text-sm text-slate-500">Sin resumen agregado para este conjunto.</p>';
            return;
        }

        const tcChips = laEntradas.map(([tcClave, lxValor]) => `
            <article class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p class="text-[11px] uppercase tracking-wide text-slate-500">${escaparHtml(tcClave)}</p>
                <p class="mt-1 text-sm font-bold text-slate-900">${escaparHtml(formatearValor(lxValor))}</p>
            </article>
        `).join('');

        loResumen.innerHTML = `<div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">${tcChips}</div>`;
    }

    function renderizarTabla(laFilas) {
        if (!Array.isArray(laFilas) || !laFilas.length) {
            loTabla.innerHTML = '<p class="text-sm text-slate-500">Sin datos para los filtros aplicados.</p>';
            return;
        }

        const laColumnas = [...new Set(laFilas.flatMap((loFila) => Object.keys(loFila ?? {})))];
        const tcEncabezado = laColumnas.map((tcColumna) => `<th>${escaparHtml(tcColumna)}</th>`).join('');
        const tcFilas = laFilas.map((loFila) => {
            const tcCeldas = laColumnas.map((tcColumna) => `<td>${escaparHtml(formatearValor(loFila[tcColumna]))}</td>`).join('');
            return `<tr>${tcCeldas}</tr>`;
        }).join('');

        loTabla.innerHTML = `
            <div class="erp-tabla-container">
                <table class="erp-tabla">
                    <thead><tr>${tcEncabezado}</tr></thead>
                    <tbody>${tcFilas}</tbody>
                </table>
            </div>
        `;
    }

    function pintarKpis(tcTipo, tnRegistros, loMetaDatos) {
        const loKpiDataset = buscar('#analitica-kpi-dataset');
        const loKpiRegistros = buscar('#analitica-kpi-registros');
        const loKpiPagina = buscar('#analitica-kpi-pagina');
        const loKpiTotal = buscar('#analitica-kpi-total');

        loKpiDataset.textContent = textoTipo(tcTipo);
        loKpiRegistros.textContent = formatearNumero(tnRegistros);
        loKpiPagina.textContent = `${loMetaDatos.PaginaActual}/${loMetaDatos.TotalPaginas}`;
        loKpiTotal.textContent = formatearNumero(loMetaDatos.TotalRegistros);
    }

    async function cargarProductos() {
        const loResultado = await productoService.listar({ Pagina: 1, TamanoPagina: 200 });
        if (!loResultado.ok) return;

        const laProductos = toArray(loResultado.datos?.items ?? loResultado.datos);
        const loSelect = buscar('#filtro-producto-analitica');
        if (!loSelect) return;

        const tcOpciones = laProductos.map((loProducto) => {
            const tnId = loProducto.IdProducto ?? loProducto.Producto ?? loProducto.id;
            const tcNombre = loProducto.NombreProducto ?? loProducto.ProductoNombre ?? loProducto.Nombre ?? `Producto ${tnId}`;
            return `<option value="${tnId}">${escaparHtml(tcNombre)}</option>`;
        }).join('');
        loSelect.innerHTML = `<option value="">Todos los productos</option>${tcOpciones}`;
    }

    function aplicarFechasPorDefecto() {
        const loHoy = new Date();
        const loInicioMes = new Date(loHoy.getFullYear(), loHoy.getMonth(), 1);

        const loFechaDesde = loFormulario.querySelector('input[name="FechaDesde"]');
        const loFechaHasta = loFormulario.querySelector('input[name="FechaHasta"]');

        if (!loFechaDesde.value) loFechaDesde.value = toIsoDate(loInicioMes);
        if (!loFechaHasta.value) loFechaHasta.value = toIsoDate(loHoy);
    }

    function toIsoDate(loFecha) {
        return loFecha.toISOString().split('T')[0];
    }

    function extraerMeta(loMetaRespuesta, loFiltros) {
        return {
            PaginaActual: Number(loMetaRespuesta?.PaginaActual ?? loFiltros.Pagina ?? 1),
            TamanoPagina: Number(loMetaRespuesta?.TamanoPagina ?? loFiltros.TamanoPagina ?? 20),
            TotalRegistros: Number(loMetaRespuesta?.TotalRegistros ?? 0),
            TotalPaginas: Number(loMetaRespuesta?.TotalPaginas ?? 1),
        };
    }

    function textoTipo(tcTipo) {
        const loEtiquetas = {
            resumen: 'Resumen',
            ventas: 'Ventas',
            rotacion: 'Rotacion',
            stockout: 'Quiebre de stock',
            rentabilidad: 'Rentabilidad',
            mermas: 'Mermas',
        };
        return loEtiquetas[tcTipo] ?? tcTipo;
    }

    function formatearNumero(tnValor) {
        const tnNumero = Number(tnValor);
        if (!Number.isFinite(tnNumero)) return '0';
        return tnNumero.toLocaleString('es-DO');
    }

    function formatearValor(lxValor) {
        if (lxValor === null || lxValor === undefined || lxValor === '') return 'N/D';
        if (typeof lxValor === 'number') return lxValor.toLocaleString('es-DO');
        if (typeof lxValor === 'boolean') return lxValor ? 'SI' : 'NO';
        if (Array.isArray(lxValor) || typeof lxValor === 'object') return JSON.stringify(lxValor);
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

    reaccionarCambiosContexto(async () => {
        loFormulario.querySelector('input[name="Pagina"]').value = 1;
        aplicarEmpresaMaquinaEnFormulario(loFormulario, { empresa: true, maquina: true });
        await cargarAnalitica();
    });

    Promise.all([cargarProductos()])
        .then(() => cargarAnalitica())
        .catch(() => {
            void cargarAnalitica();
        });
}
