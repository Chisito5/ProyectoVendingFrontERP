import { reporteService } from '../services/reporteService';
import { buscar, renderizarMensaje, renderizarTablaDatos, setBotonCargando } from '../utils/dom';
import { convertirAArreglo } from '../utils/datos';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa pantalla de reportes exportables.
 */
export function iniciarPaginaReportes() {
    const loFormularioGenerar = buscar('#form-reporte-generar');
    const loFormularioEstado = buscar('#form-reporte-estado');
    const loFormularioDescargar = buscar('#form-reporte-descargar');
    const loFormularioListado = buscar('#form-reporte-listado');

    const loMensaje = buscar('#reporte-mensaje');
    const loEstadoDetalle = buscar('#reporte-estado-detalle');
    const loDescargaDetalle = buscar('#reporte-descarga-detalle');
    const loListado = buscar('#reporte-listado-tabla');
    const loListadoMeta = buscar('#reporte-listado-meta');

    loFormularioGenerar?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioGenerar.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Generando...');

        const loDatos = Object.fromEntries(new FormData(loFormularioGenerar).entries());
        const loPayload = {
            TipoReporte: loDatos.Plantilla || loDatos.TipoReporte,
            Formato: String(loDatos.Formato || '').toUpperCase(),
            Empresa: loDatos.Empresa ? Number(loDatos.Empresa) : undefined,
            Filtros: {
                FechaDesde: loDatos.FechaDesde || undefined,
                FechaHasta: loDatos.FechaHasta || undefined,
            },
        };
        const loResultado = await reporteService.generar(loPayload);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            mostrarToast('Reporte enviado a cola.', 'ok');
            renderizarTablaDatos(loEstadoDetalle, loResultado.datos, { columnas: columnasReporte() });
            await cargarListado();
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioEstado?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioEstado.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Consultando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioEstado).entries());
        const loResultado = await reporteService.obtener(loPayload.IdReporte);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            renderizarTablaDatos(loEstadoDetalle, loResultado.datos, { columnas: columnasReporte() });
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioDescargar?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioDescargar.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Obteniendo...');

        const loPayload = Object.fromEntries(new FormData(loFormularioDescargar).entries());
        const loResultado = await reporteService.descargar(loPayload.IdReporte);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            renderizarTablaDatos(loDescargaDetalle, loResultado.datos);
            const tcUrl = loResultado.datos?.Url
                ?? loResultado.datos?.url
                ?? loResultado.datos?.Link
                ?? loResultado.datos?.UrlArchivo
                ?? loResultado.datos?.UrlImagen
                ?? null;
            if (tcUrl) {
                window.open(tcUrl, '_blank', 'noopener');
            }
        }

        setBotonCargando(loBoton, false);
    });

    loFormularioListado?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        await cargarListado();
    });

    async function cargarPlantillas() {
        const loResultado = await reporteService.plantillas();
        if (!loResultado.ok) {
            buscar('#reporte-tipo')?.classList.remove('hidden');
            buscar('#reporte-plantilla')?.classList.add('hidden');
            return;
        }

        const laPlantillas = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos);
        const tcOpciones = laPlantillas.map((loPlantilla) => {
            const tcValor = loPlantilla.Codigo ?? loPlantilla.IdPlantilla ?? loPlantilla.id ?? loPlantilla;
            const tcTexto = loPlantilla.Nombre ?? loPlantilla.Descripcion ?? tcValor;
            return `<option value="${tcValor}">${tcTexto}</option>`;
        }).join('');

        const loSelectPlantilla = buscar('#reporte-plantilla');
        if (loSelectPlantilla) {
            loSelectPlantilla.innerHTML = `<option value="">Seleccione plantilla...</option>${tcOpciones}`;
            loSelectPlantilla.classList.remove('hidden');
        }
        buscar('#reporte-tipo')?.classList.add('hidden');
    }

    async function cargarListado() {
        const loFiltros = loFormularioListado
            ? Object.fromEntries(new FormData(loFormularioListado).entries())
            : { Pagina: 1, TamanoPagina: 20 };

        const loResultado = await reporteService.listar(loFiltros);
        renderizarMensaje(loMensaje, loResultado);
        if (!loResultado.ok) {
            return;
        }

        renderizarTablaDatos(loListado, convertirAArreglo(loResultado.datos?.items ?? loResultado.datos), {
            columnas: columnasReporte(),
        });

        const loMeta = loResultado.meta ?? {};
        loListadoMeta.textContent = `Pagina ${loMeta.PaginaActual ?? loFiltros.Pagina ?? 1} de ${loMeta.TotalPaginas ?? 1} | Registros ${loMeta.TotalRegistros ?? convertirAArreglo(loResultado.datos).length}`;
    }

    function columnasReporte() {
        return [
            { clave: 'IdReporte', etiqueta: 'Reporte' },
            { clave: 'TipoReporte', etiqueta: 'Tipo' },
            { clave: 'Formato', etiqueta: 'Formato' },
            { clave: 'Estado', etiqueta: 'Estado' },
            { clave: 'Empresa', etiqueta: 'Empresa' },
            { clave: 'FechaSolicitud', etiqueta: 'Fecha solicitud' },
            { clave: 'FechaFinalizacion', etiqueta: 'Fecha finalizacion' },
        ];
    }

    void cargarPlantillas();
    void cargarListado();
}
