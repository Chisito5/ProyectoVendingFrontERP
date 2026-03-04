import { catalogoService } from '../services/catalogoService';
import { obtenerEmpresaActivaId } from '../core/contextoEmpresa';
import { obtenerMaquinaActivaId } from '../core/contextoMaquina';
import { tableroService } from '../services/tableroService';
import {
    extraerFilasBloque,
    extraerMetaBloque,
    mapearCasillaTablero,
    mapearDetalleMaquina,
    mapearHistorialReposicionTablero,
    mapearMaquinaEjecutiva,
    mapearPuntoMapa,
    mapearRanking,
    mapearResumenEjecutivo,
    toArray,
} from '../utils/tableroAdaptadores';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { abrirDrawerDetalle } from '../ui/drawerDetalle';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * return: void
 *
 * Inicializa tablero ejecutivo consumiendo endpoint unificado.
 */
export function iniciarPaginaTablero() {
    const loFormularioFiltros = buscar('#form-tablero-filtros');
    const loMensajeApi = buscar('#tablero-mensaje-api');
    const loContenedorTabla = buscar('#tablero-tabla-maquinas');
    const loResumenListado = buscar('#tablero-resumen-listado');
    const loContenedorRanking = buscar('#tablero-ranking');
    const loMapaEstado = buscar('#tablero-mapa-estado');
    const loContenedorCasillas = buscar('#tablero-casillas');
    const loResumenCasillas = buscar('#tablero-casillas-resumen');
    const loContenedorHistorial = buscar('#tablero-historial-reposicion');
    const loResumenHistorial = buscar('#tablero-historial-resumen');

    const loBtnAplicar = buscar('#btn-tablero-aplicar');
    const loBtnLimpiar = buscar('#btn-tablero-limpiar');
    const loBtnAnterior = buscar('#btn-tablero-anterior');
    const loBtnSiguiente = buscar('#btn-tablero-siguiente');

    const loEstado = {
        paginaActual: 1,
        totalPaginas: 1,
        totalRegistros: 0,
        tamanoPagina: 20,
        mapa: null,
        capaMapa: null,
        filtros: {},
        detalleUnificadoPorMaquina: {},
        graficaTendencia: null,
        graficaRanking: null,
        graficaAlertas: null,
        graficaIngresos: null,
        filasMaquinas: [],
        filasRanking: [],
        filasCasillas: [],
        filasHistorial: [],
    };
    let loLeaflet = null;
    let loChartJs = null;
    let lnSecuenciaCarga = 0;
    let loResizeObserverMapa = null;

    aplicarFechasPorDefecto();

    loBtnAplicar?.addEventListener('click', async () => {
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = 1;
        await cargarTodoTablero();
    });

    loBtnLimpiar?.addEventListener('click', async () => {
        loFormularioFiltros.reset();
        aplicarFechasPorDefecto();
        loFormularioFiltros.querySelector('input[name="Top"]').value = 10;
        loFormularioFiltros.querySelector('select[name="Orden"]').value = 'ingresos';
        loFormularioFiltros.querySelector('select[name="Por"]').value = 'ingresos';
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = 1;
        loFormularioFiltros.querySelector('input[name="TamanoPagina"]').value = 20;
        await cargarTodoTablero();
    });

    loBtnAnterior?.addEventListener('click', async () => {
        if (loEstado.paginaActual <= 1) return;
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = loEstado.paginaActual - 1;
        await cargarTodoTablero();
    });

    loBtnSiguiente?.addEventListener('click', async () => {
        if (loEstado.paginaActual >= loEstado.totalPaginas) return;
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = loEstado.paginaActual + 1;
        await cargarTodoTablero();
    });

    async function cargarTodoTablero() {
        setBotonCargando(loBtnAplicar, true, 'Cargando...');
        const tnSecuencia = ++lnSecuenciaCarga;
        const loFiltros = obtenerFiltros();
        loEstado.filtros = loFiltros;

        const loResultado = await consultarTableroUnificado(loFiltros);
        if (tnSecuencia !== lnSecuenciaCarga) {
            return;
        }

        if (!loResultado.ok) {
            renderizarMensaje(loMensajeApi, loResultado);
            loContenedorTabla.innerHTML = '';
            loContenedorRanking.innerHTML = '';
            loContenedorCasillas.innerHTML = '';
            loContenedorHistorial.innerHTML = '';
            destruirGraficas();
            loMapaEstado.textContent = loResultado.mensaje || 'No se pudo cargar el tablero.';
            setBotonCargando(loBtnAplicar, false);
            return;
        }

        const loDatos = loResultado.datos ?? {};
        loEstado.detalleUnificadoPorMaquina = {};
        cachearDetalleUnificado(loDatos.DetalleMaquina);

        pintarKpis(mapearResumenEjecutivo(loDatos.Resumen ?? loDatos.resumen ?? {}));
        renderizarTablaMaquinas(loDatos.Maquinas);
        renderizarRanking(loDatos.Ranking);
        renderizarTablaCasillas(loDatos.Casillas);
        renderizarTablaHistorialReposicion(loDatos.HistorialReposicion);
        await renderizarGraficas();

        const loMapa = {
            ok: true,
            datos: extraerFilasBloque(loDatos.Mapa),
            mensaje: 'Mapa cargado correctamente.',
        };
        try {
            await renderizarMapa(loMapa);
        } catch (loError) {
            console.error('Error inicializando mapa del tablero:', loError);
            loMapaEstado.textContent = 'No se pudo inicializar el mapa en este navegador o red.';
        }

        renderizarMensaje(loMensajeApi, loResultado);
        setBotonCargando(loBtnAplicar, false);
    }

    async function consultarTableroUnificado(loFiltros) {
        let loResultado = await tableroService.unificado(loFiltros);

        if (
            loFiltros.Empresa &&
            esErrorServidor(loResultado)
        ) {
            const loSinEmpresa = { ...loFiltros };
            delete loSinEmpresa.Empresa;
            loResultado = await tableroService.unificado(loSinEmpresa);
        }

        return loResultado;
    }

    function renderizarTablaMaquinas(loBloqueMaquinas) {
        const laFilas = extraerFilasBloque(loBloqueMaquinas).map((loFila) => mapearMaquinaEjecutiva(loFila));
        loEstado.filasMaquinas = laFilas;
        const loMeta = extraerMetaBloque(loBloqueMaquinas);

        loEstado.paginaActual = Number(loMeta.PaginaActual ?? loEstado.filtros.Pagina ?? 1);
        loEstado.totalPaginas = Number(loMeta.TotalPaginas ?? 1);
        loEstado.totalRegistros = Number(loMeta.TotalRegistros ?? laFilas.length);
        loEstado.tamanoPagina = Number(loMeta.TamanoPagina ?? loEstado.filtros.TamanoPagina ?? 20);

        loResumenListado.textContent = `Registros: ${loEstado.totalRegistros} | Pagina ${loEstado.paginaActual} de ${loEstado.totalPaginas}`;

        if (!laFilas.length) {
            loContenedorTabla.innerHTML = '<p class="text-sm text-slate-500">Sin maquinas para los filtros aplicados.</p>';
            return;
        }

        const tcFilas = laFilas.map((loFila) => `
            <tr>
                <td>${escaparHtml(loFila.CodigoMaquina)}</td>
                <td>${escaparHtml(loFila.NombreMaquina)}</td>
                <td>${escaparHtml(loFila.TipoMaquina)}</td>
                <td>${escaparHtml(loFila.TipoInternet)}</td>
                <td>${escaparHtml(loFila.EstadoMaquina)}</td>
                <td>${escaparHtml(loFila.EstadoOperativo)}</td>
                <td title="${escaparHtml(loFila.Responsables)}">${escaparHtml(resumir(loFila.Responsables, 34))}</td>
                <td>${formatearDecimal(loFila.ConsumoKwhMensual, 'N/D')}</td>
                <td>${formatearNumero(loFila.VentasPeriodo)}</td>
                <td>${formatearMoneda(loFila.IngresosPeriodo)}</td>
                <td title="${escaparHtml(loFila.ProductoEstrella)}">${escaparHtml(resumir(loFila.ProductoEstrella, 28))}</td>
                <td>${formatearNumero(loFila.Alertas)}</td>
                <td>
                    <button class="erp-btn erp-btn--secundario text-[11px]" data-ver-detalle="${loFila.IdMaquina}">Ver detalle</button>
                </td>
            </tr>
        `).join('');

        loContenedorTabla.innerHTML = `
            <div class="erp-tabla-container">
                <table class="erp-tabla">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Maquina</th>
                            <th>Tipo</th>
                            <th>Internet</th>
                            <th>Estado</th>
                            <th>Estado operativo</th>
                            <th>Responsables</th>
                            <th>Kwh/mes</th>
                            <th>Ventas</th>
                            <th>Ingresos</th>
                            <th>Producto estrella</th>
                            <th>Alertas</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>${tcFilas}</tbody>
                </table>
            </div>
        `;

        loContenedorTabla.querySelectorAll('[data-ver-detalle]').forEach((loBoton) => {
            loBoton.addEventListener('click', async () => {
                const tnMaquina = Number(loBoton.getAttribute('data-ver-detalle'));
                await abrirDetalleMaquina(tnMaquina);
            });
        });
    }

    function renderizarRanking(loBloqueRanking) {
        const laFilas = extraerFilasBloque(loBloqueRanking).map((loFila) => mapearRanking(loFila));
        loEstado.filasRanking = laFilas;

        if (!laFilas.length) {
            loContenedorRanking.innerHTML = '<p class="text-sm text-slate-500">Sin datos de ranking en el periodo seleccionado.</p>';
            return;
        }

        const tcItems = laFilas.map((loFila, tnIndice) => `
            <article class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-bold text-slate-900">#${tnIndice + 1} ${escaparHtml(loFila.CodigoMaquina)}</p>
                    <span class="erp-chip">${formatearNumero(loFila.Valor)}</span>
                </div>
                <p class="mt-1 text-xs text-slate-600">${escaparHtml(loFila.NombreMaquina)}</p>
                <button class="mt-2 erp-btn erp-btn--secundario text-[11px]" data-ranking-detalle="${loFila.IdMaquina}">
                    Ver detalle
                </button>
            </article>
        `).join('');

        loContenedorRanking.innerHTML = `<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">${tcItems}</div>`;

        loContenedorRanking.querySelectorAll('[data-ranking-detalle]').forEach((loBoton) => {
            loBoton.addEventListener('click', async () => {
                const tnMaquina = Number(loBoton.getAttribute('data-ranking-detalle'));
                await abrirDetalleMaquina(tnMaquina);
            });
        });
    }

    function renderizarTablaCasillas(loBloqueCasillas) {
        const laFilas = extraerFilasBloque(loBloqueCasillas).map((loFila) => mapearCasillaTablero(loFila));
        loEstado.filasCasillas = laFilas;
        const loMeta = extraerMetaBloque(loBloqueCasillas);
        loResumenCasillas.textContent = construirResumenBloque(loMeta, laFilas.length);

        if (!laFilas.length) {
            loContenedorCasillas.innerHTML = '<p class="text-sm text-slate-500">Sin datos de casillas para los filtros aplicados.</p>';
            return;
        }

        loContenedorCasillas.innerHTML = `
            <div class="erp-tabla-container">
                <table class="erp-tabla">
                    <thead>
                        <tr>
                            <th>Maquina</th>
                            <th>Casilla</th>
                            <th>Producto</th>
                            <th>Stock actual</th>
                            <th>Stock maximo</th>
                            <th>Lote</th>
                            <th>Caducidad</th>
                            <th>SoldOut</th>
                            <th>ABC</th>
                            <th>Stock fugaz</th>
                            <th>Costo</th>
                            <th>Precio</th>
                            <th>Stock bajo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${laFilas.map((loFila) => `
                            <tr>
                                <td>${escaparHtml(loFila.Maquina)}</td>
                                <td>${escaparHtml(loFila.Casilla)}</td>
                                <td>${escaparHtml(resumir(loFila.Producto, 28))}</td>
                                <td>${formatearNumero(loFila.StockActual)}</td>
                                <td>${formatearNumero(loFila.StockMaximo)}</td>
                                <td>${escaparHtml(loFila.Lote)}</td>
                                <td>${escaparHtml(loFila.FechaCaducidad)}</td>
                                <td>${escaparHtml(loFila.FechaProyectadaSoldOut)}</td>
                                <td>${escaparHtml(loFila.PrioridadABC)}</td>
                                <td>${escaparHtml(loFila.EsStockFugaz)}</td>
                                <td>${formatearMoneda(loFila.CostoUnitario)}</td>
                                <td>${formatearMoneda(loFila.PrecioUnitario)}</td>
                                <td>${escaparHtml(loFila.AlertaStockBajo)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderizarTablaHistorialReposicion(loBloqueHistorial) {
        const laFilas = extraerFilasBloque(loBloqueHistorial).map((loFila) => mapearHistorialReposicionTablero(loFila));
        loEstado.filasHistorial = laFilas;
        const loMeta = extraerMetaBloque(loBloqueHistorial);
        loResumenHistorial.textContent = construirResumenBloque(loMeta, laFilas.length);

        if (!laFilas.length) {
            loContenedorHistorial.innerHTML = '<p class="text-sm text-slate-500">Sin historial de reposiciones para los filtros aplicados.</p>';
            return;
        }

        loContenedorHistorial.innerHTML = `
            <div class="erp-tabla-container">
                <table class="erp-tabla">
                    <thead>
                        <tr>
                            <th>Fecha reposicion</th>
                            <th>Maquina</th>
                            <th>Casilla</th>
                            <th>Reponedor</th>
                            <th>Cantidad antes</th>
                            <th>Cantidad recargada</th>
                            <th>Cantidad despues</th>
                            <th>Lote</th>
                            <th>Motivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${laFilas.map((loFila) => `
                            <tr>
                                <td>${escaparHtml(loFila.FechaReposicion)}</td>
                                <td>${escaparHtml(loFila.Maquina)}</td>
                                <td>${escaparHtml(loFila.Casilla)}</td>
                                <td>${escaparHtml(loFila.Reponedor)}</td>
                                <td>${formatearNumero(loFila.CantidadAntes)}</td>
                                <td>${formatearNumero(loFila.CantidadRecargada)}</td>
                                <td>${formatearNumero(loFila.CantidadDespues)}</td>
                                <td>${escaparHtml(loFila.Lote)}</td>
                                <td>${escaparHtml(resumir(loFila.Motivo, 34))}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async function renderizarMapa(loResultado) {
        const L = await obtenerLeaflet();
        const laPuntos = toArray(loResultado.datos).map((loFila) => mapearPuntoMapa(loFila));
        const laPuntosConCoordenadas = laPuntos.filter((loPunto) => loPunto.tieneCoordenadas);
        const loNodoMapa = buscar('#tablero-mapa');

        if (!loEstado.mapa) {
            loEstado.mapa = L.map('tablero-mapa', {
                zoomControl: true,
            }).setView([18.5, -69.95], 6);
            agregarCapaBaseMapa(L, loEstado.mapa);

            window.addEventListener('resize', ajustarMapa, { passive: true });
            if (loNodoMapa && 'ResizeObserver' in window) {
                loResizeObserverMapa = new ResizeObserver(() => ajustarMapa());
                loResizeObserverMapa.observe(loNodoMapa);
            }
        }

        if (loEstado.capaMapa) {
            loEstado.capaMapa.clearLayers();
        } else {
            loEstado.capaMapa = L.layerGroup().addTo(loEstado.mapa);
        }

        if (!laPuntosConCoordenadas.length) {
            loMapaEstado.textContent = 'No hay coordenadas disponibles para los filtros seleccionados.';
            loEstado.mapa.setView([18.5, -69.95], 6);
            ajustarMapa();
            return;
        }

        loMapaEstado.textContent = `Maquinas con coordenadas: ${laPuntosConCoordenadas.length}`;

        const laBounds = [];
        laPuntosConCoordenadas.forEach((loPunto) => {
            const loMarker = L.circleMarker([loPunto.Latitud, loPunto.Longitud], {
                radius: 8,
                color: colorBordeAlerta(loPunto.NivelAlerta),
                weight: 2,
                fillColor: colorRellenoOperativo(loPunto.EstadoOperativo),
                fillOpacity: 0.9,
            });

            const tcPopup = `
                <div class="text-xs">
                    <p><strong>${escaparHtml(loPunto.CodigoMaquina)}</strong></p>
                    <p>Estado: ${escaparHtml(loPunto.EstadoOperativo)}</p>
                    <p>Alerta: ${escaparHtml(loPunto.NivelAlerta)}</p>
                    <p>Ventas: ${formatearNumero(loPunto.VentasPeriodo)}</p>
                    <p>Ingresos: ${formatearMoneda(loPunto.IngresosPeriodo)}</p>
                    <button class="erp-btn erp-btn--secundario mt-2 text-[11px]" data-popup-detalle="${loPunto.IdMaquina}">
                        Ver detalle
                    </button>
                </div>
            `;

            loMarker.bindPopup(tcPopup);
            loMarker.on('popupopen', () => {
                const loBoton = document.querySelector(`[data-popup-detalle="${loPunto.IdMaquina}"]`);
                loBoton?.addEventListener('click', async () => {
                    await abrirDetalleMaquina(loPunto.IdMaquina);
                }, { once: true });
            });

            loMarker.addTo(loEstado.capaMapa);
            laBounds.push([loPunto.Latitud, loPunto.Longitud]);
        });

        loEstado.mapa.fitBounds(laBounds, { padding: [24, 24] });
        ajustarMapa();
    }

    async function obtenerLeaflet() {
        if (loLeaflet) return loLeaflet;
        const loModulo = await import('leaflet');
        loLeaflet = loModulo.default ?? loModulo;
        return loLeaflet;
    }

    async function obtenerChartJs() {
        if (loChartJs) return loChartJs;
        const loModulo = await import('chart.js/auto');
        loChartJs = loModulo.default ?? loModulo;
        return loChartJs;
    }

    function destruirGraficas() {
        ['graficaTendencia', 'graficaRanking', 'graficaAlertas', 'graficaIngresos'].forEach((tcClave) => {
            if (loEstado[tcClave] && typeof loEstado[tcClave].destroy === 'function') {
                loEstado[tcClave].destroy();
            }
            loEstado[tcClave] = null;
        });
    }

    async function renderizarGraficas() {
        const Chart = await obtenerChartJs();
        destruirGraficas();

        const loCanvasTendencia = buscar('#chart-tablero-tendencia');
        const loCanvasRanking = buscar('#chart-tablero-ranking');
        const loCanvasAlertas = buscar('#chart-tablero-alertas');
        const loCanvasIngresos = buscar('#chart-tablero-ingresos');

        if (loCanvasTendencia) {
            const loTendencia = construirSerieTendenciaReposicion(loEstado.filasHistorial);
            loEstado.graficaTendencia = new Chart(loCanvasTendencia, {
                type: 'line',
                data: {
                    labels: loTendencia.labels,
                    datasets: [
                        {
                            label: 'Recarga por dia',
                            data: loTendencia.valores,
                            borderColor: '#355D93',
                            backgroundColor: 'rgba(53, 93, 147, 0.14)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.35,
                            pointRadius: 3,
                        },
                    ],
                },
                options: opcionesBaseGrafica('indice'),
            });
        }

        if (loCanvasRanking) {
            const laTopRanking = loEstado.filasRanking.slice(0, 8);
            loEstado.graficaRanking = new Chart(loCanvasRanking, {
                type: 'bar',
                data: {
                    labels: laTopRanking.map((loFila) => loFila.CodigoMaquina || loFila.NombreMaquina || 'Sin codigo'),
                    datasets: [
                        {
                            label: 'Valor ranking',
                            data: laTopRanking.map((loFila) => Number(loFila.Valor || 0)),
                            backgroundColor: '#355D93',
                            borderRadius: 8,
                            maxBarThickness: 28,
                        },
                    ],
                },
                options: opcionesBaseGrafica('indice'),
            });
        }

        if (loCanvasAlertas) {
            const loConteo = contarEstadoCasillas(loEstado.filasCasillas);
            loEstado.graficaAlertas = new Chart(loCanvasAlertas, {
                type: 'doughnut',
                data: {
                    labels: ['Stock normal', 'Stock bajo', 'Stock fugaz'],
                    datasets: [
                        {
                            data: [loConteo.normal, loConteo.bajo, loConteo.fugaz],
                            backgroundColor: ['#355D93', '#F28E1B', '#ef4444'],
                            borderWidth: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                color: '#334155',
                            },
                        },
                    },
                    cutout: '68%',
                },
            });
        }

        if (loCanvasIngresos) {
            const laTopIngresos = [...loEstado.filasMaquinas]
                .sort((a, b) => Number(b.IngresosPeriodo || 0) - Number(a.IngresosPeriodo || 0))
                .slice(0, 6);

            loEstado.graficaIngresos = new Chart(loCanvasIngresos, {
                type: 'bar',
                data: {
                    labels: laTopIngresos.map((loFila) => loFila.CodigoMaquina || loFila.NombreMaquina || 'N/D'),
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: laTopIngresos.map((loFila) => Number(loFila.IngresosPeriodo || 0)),
                            backgroundColor: '#F28E1B',
                            borderRadius: 8,
                            maxBarThickness: 26,
                        },
                    ],
                },
                options: {
                    ...opcionesBaseGrafica('dinero'),
                    indexAxis: 'y',
                },
            });
        }
    }

    function opcionesBaseGrafica(tcModo = 'indice') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#334155',
                        boxWidth: 10,
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (loContexto) => {
                            const tnValor = Number(loContexto.parsed?.y ?? loContexto.parsed?.x ?? loContexto.raw ?? 0);
                            if (tcModo === 'dinero') {
                                return `${loContexto.dataset.label}: ${formatearMoneda(tnValor)}`;
                            }
                            return `${loContexto.dataset.label}: ${formatearNumero(tnValor)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.18)',
                    },
                    ticks: {
                        color: '#475569',
                        maxRotation: 0,
                    },
                },
                y: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.18)',
                    },
                    ticks: {
                        color: '#475569',
                        callback: (tnValor) => (tcModo === 'dinero' ? formatearMoneda(tnValor) : formatearNumero(tnValor)),
                    },
                },
            },
        };
    }

    function construirSerieTendenciaReposicion(laHistorial = []) {
        const loMap = {};
        laHistorial.forEach((loFila) => {
            const tcFechaCruda = String(loFila.FechaReposicion || '').split(' ')[0];
            if (!tcFechaCruda) return;
            loMap[tcFechaCruda] = Number(loMap[tcFechaCruda] || 0) + Number(loFila.CantidadRecargada || 0);
        });

        const laFechas = Object.keys(loMap).sort((a, b) => (a < b ? -1 : 1));
        const laUltimas = laFechas.slice(-10);
        const laLabels = laUltimas.map((tcFecha) => formatearFechaCorta(tcFecha));
        const laValores = laUltimas.map((tcFecha) => Number(loMap[tcFecha] || 0));

        return {
            labels: laLabels.length ? laLabels : ['Sin datos'],
            valores: laValores.length ? laValores : [0],
        };
    }

    function contarEstadoCasillas(laCasillas = []) {
        let tnBajo = 0;
        let tnFugaz = 0;
        let tnNormal = 0;
        laCasillas.forEach((loCasilla) => {
            const lbBajo = String(loCasilla.AlertaStockBajo || '').toUpperCase() === 'SI';
            const lbFugaz = String(loCasilla.EsStockFugaz || '').toUpperCase() === 'SI';
            if (lbFugaz) {
                tnFugaz += 1;
                return;
            }
            if (lbBajo) {
                tnBajo += 1;
                return;
            }
            tnNormal += 1;
        });

        if (tnNormal + tnBajo + tnFugaz === 0) {
            tnNormal = 1;
        }
        return { normal: tnNormal, bajo: tnBajo, fugaz: tnFugaz };
    }

    function formatearFechaCorta(tcFechaIso) {
        if (!tcFechaIso) return 'N/D';
        const loFecha = new Date(`${tcFechaIso}T00:00:00`);
        if (Number.isNaN(loFecha.getTime())) return tcFechaIso;
        return loFecha.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' });
    }

    function agregarCapaBaseMapa(L, loMapa) {
        const laFuentes = [
            {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap',
                },
            },
            {
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                options: {
                    maxZoom: 19,
                    subdomains: 'abcd',
                    attribution: '&copy; OpenStreetMap &copy; CARTO',
                },
            },
        ];

        let tnIndiceFuente = 0;
        let tnErroresConsecutivos = 0;
        let loCapa = L.tileLayer(laFuentes[tnIndiceFuente].url, laFuentes[tnIndiceFuente].options).addTo(loMapa);

        const fnConectarEventos = () => {
            loCapa.on('load', () => {
                tnErroresConsecutivos = 0;
            });

            loCapa.on('tileerror', () => {
                tnErroresConsecutivos += 1;
                if (tnErroresConsecutivos < 4) return;
                if (tnIndiceFuente >= laFuentes.length - 1) return;

                tnIndiceFuente += 1;
                tnErroresConsecutivos = 0;
                loMapa.removeLayer(loCapa);
                loCapa = L.tileLayer(laFuentes[tnIndiceFuente].url, laFuentes[tnIndiceFuente].options).addTo(loMapa);
                loMapaEstado.textContent = 'Mapa alterno cargado por conectividad.';
                fnConectarEventos();
            });
        };

        fnConectarEventos();
    }

    async function abrirDetalleMaquina(tnMaquina) {
        if (!tnMaquina) return;

        let loDetalle = loEstado.detalleUnificadoPorMaquina[tnMaquina];
        if (!loDetalle) {
            const loResultado = await tableroService.detalleMaquinaEjecutivo(tnMaquina, {
                FechaDesde: loEstado.filtros.FechaDesde,
                FechaHasta: loEstado.filtros.FechaHasta,
            });

            if (!loResultado.ok) {
                renderizarMensaje(loMensajeApi, loResultado);
                return;
            }
            loDetalle = mapearDetalleMaquina(loResultado.datos ?? {});
        }

        abrirDrawerDetalle({
            titulo: `Detalle maquina #${tnMaquina}`,
            secciones: [
                {
                    id: 'resumen-maquina',
                    titulo: 'Resumen',
                    tipo: 'resumen',
                    datos: {
                        Codigo: loDetalle.Maquina?.CodigoMaquina ?? loDetalle.Maquina?.Codigo ?? 'N/D',
                        Maquina: loDetalle.Maquina?.NombreMaquina ?? loDetalle.Maquina?.Nombre ?? 'N/D',
                        Tipo: loDetalle.Maquina?.TipoMaquina ?? loDetalle.Maquina?.Tipo ?? 'N/D',
                        TipoInternet: loDetalle.Maquina?.NombreTipoInternet ?? loDetalle.Maquina?.TipoInternet ?? loDetalle.Maquina?.CodigoTipoInternet ?? 'N/D',
                        TipoLugarInstalacion: loDetalle.Maquina?.NombreTipoLugar ?? loDetalle.Maquina?.TipoLugarInstalacion ?? loDetalle.Maquina?.CodigoTipoLugar ?? 'N/D',
                        ConsumoKwhMensual: formatearDecimal(loDetalle.Maquina?.ConsumoKwhMensual, 'N/D'),
                        Estado: loDetalle.Maquina?.EstadoMaquina ?? loDetalle.Maquina?.Estado ?? 'N/D',
                        EstadoOperativo: loDetalle.Maquina?.EstadoOperativo ?? 'N/D',
                    },
                },
                {
                    id: 'responsables',
                    titulo: 'Responsables',
                    tipo: 'tabla',
                    datos: toArray(loDetalle.Responsables),
                },
                {
                    id: 'rendimiento',
                    titulo: 'Rendimiento',
                    tipo: 'resumen',
                    datos: loDetalle.VentasResumen,
                },
                {
                    id: 'top-productos',
                    titulo: 'Top productos',
                    tipo: 'tabla',
                    datos: toArray(loDetalle.TopProductos),
                },
                {
                    id: 'alertas',
                    titulo: 'Alertas',
                    tipo: 'tabla',
                    datos: toArray(loDetalle.AlertasActivas.length ? loDetalle.AlertasActivas : loDetalle.Alertas),
                },
                {
                    id: 'movimientos',
                    titulo: 'Ultimos movimientos de stock',
                    tipo: 'tabla',
                    datos: toArray(loDetalle.UltimosMovimientosStock),
                },
            ],
        });
    }

    function cachearDetalleUnificado(loDetalleBloque) {
        const loDetalle = mapearDetalleMaquina(loDetalleBloque ?? {});
        const tnIdMaquina = Number(loDetalle.Maquina?.IdMaquina ?? loDetalle.Maquina?.Maquina ?? 0);
        if (tnIdMaquina > 0) {
            loEstado.detalleUnificadoPorMaquina[tnIdMaquina] = loDetalle;
        }
    }

    function pintarKpis(loResumen) {
        pintarKpi('kpi-total-maquinas', formatearNumero(loResumen.TotalMaquinas));
        pintarKpi('kpi-maquinas-activas', formatearNumero(loResumen.MaquinasActivas));
        pintarKpi('kpi-maquinas-alerta', formatearNumero(loResumen.MaquinasConAlerta));
        pintarKpi('kpi-ventas-periodo', formatearNumero(loResumen.VentasTotal));
        pintarKpi('kpi-ingresos-periodo', formatearMoneda(loResumen.IngresosTotal));
        pintarKpi('kpi-maquina-top', loResumen.MaquinaTopVentas || 'N/D');
        pintarKpi('kpi-producto-top', loResumen.ProductoTopGlobal || 'N/D');
    }

    function pintarKpi(tcId, txValor) {
        const loNodo = buscar(`#${tcId}`);
        if (!loNodo) return;
        loNodo.textContent = txValor ?? '--';
    }

    function obtenerFiltros() {
        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);
        const tnEmpresaGlobal = obtenerEmpresaActivaId();
        const tnMaquinaGlobal = obtenerMaquinaActivaId();
        const tnMaquina = Number(tnMaquinaGlobal || 0);
        const loFiltrosUnificados = {
            Empresa: tnEmpresaGlobal || loFiltros.Empresa || undefined,
            Maquina: tnMaquina > 0 ? tnMaquina : undefined,
            Estado: loFiltros.Estado || undefined,
            FechaDesde: loFiltros.FechaDesde || undefined,
            FechaHasta: loFiltros.FechaHasta || undefined,
            Busqueda: loFiltros.Busqueda || undefined,
            Orden: loFiltros.Orden || 'ingresos',
            Por: loFiltros.Por || 'ingresos',
            Top: Number(loFiltros.Top || 10),
            Pagina: Number(loFiltros.Pagina || 1),
            TamanoPagina: Number(loFiltros.TamanoPagina || 20),
            IncluirCasillas: 1,
            IncluirHistorialReposicion: 1,
        };

        if (tnMaquina > 0) {
            loFiltrosUnificados.IncluirDetalle = 1;
        }

        return loFiltrosUnificados;
    }

    function aplicarFechasPorDefecto() {
        const loHoy = new Date();
        const loInicioMes = new Date(loHoy.getFullYear(), loHoy.getMonth(), 1);

        const tcHoy = aIsoFecha(loHoy);
        const tcInicioMes = aIsoFecha(loInicioMes);
        const loFechaDesde = loFormularioFiltros.querySelector('input[name="FechaDesde"]');
        const loFechaHasta = loFormularioFiltros.querySelector('input[name="FechaHasta"]');

        if (!loFechaDesde.value) loFechaDesde.value = tcInicioMes;
        if (!loFechaHasta.value) loFechaHasta.value = tcHoy;
    }

    async function cargarEstados() {
        const loResultado = await catalogoService.listarEstados('MAQUINA');
        if (!loResultado.ok) return;

        const laEstados = toArray(loResultado.datos?.items ?? loResultado.datos);
        const loSelect = buscar('#filtro-estado-tablero');
        if (!loSelect) return;

        const tcOpciones = laEstados.map((loEstadoItem) => {
            const tnId = loEstadoItem.IdEstado ?? loEstadoItem.Estado ?? loEstadoItem.id;
            const tcNombre = loEstadoItem.NombreEstado ?? loEstadoItem.Nombre ?? loEstadoItem.EstadoNombre ?? `Estado ${tnId}`;
            return `<option value="${tnId}">${escaparHtml(tcNombre)}</option>`;
        }).join('');
        loSelect.innerHTML = `<option value="">Todos los estados</option>${tcOpciones}`;
    }

    function construirResumenBloque(loMeta, tnFilas) {
        const tnRegistros = Number(loMeta?.TotalRegistros ?? tnFilas);
        const tnPagina = Number(loMeta?.PaginaActual ?? 1);
        const tnPaginas = Number(loMeta?.TotalPaginas ?? 1);
        return `Registros: ${tnRegistros} | Pagina ${tnPagina} de ${tnPaginas}`;
    }

    function aIsoFecha(loFecha) {
        return loFecha.toISOString().split('T')[0];
    }

    function formatearNumero(tnValor) {
        const tnNumero = Number(tnValor);
        if (!Number.isFinite(tnNumero)) return '0';
        return tnNumero.toLocaleString('es-DO');
    }

    function formatearMoneda(tnValor) {
        const tnNumero = Number(tnValor);
        if (!Number.isFinite(tnNumero)) return 'N/D';
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            maximumFractionDigits: 2,
        }).format(tnNumero);
    }

    function formatearDecimal(tnValor, tcDefecto = '0') {
        const tnNumero = Number(tnValor);
        if (!Number.isFinite(tnNumero)) return tcDefecto;
        return tnNumero.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function resumir(tcTexto, tnMaximo = 36) {
        const tcValor = String(tcTexto ?? '');
        return tcValor.length > tnMaximo ? `${tcValor.slice(0, tnMaximo)}...` : tcValor;
    }

    function colorBordeAlerta(tcNivelAlerta) {
        const tcNivel = String(tcNivelAlerta || '').toUpperCase();
        if (tcNivel.includes('ALTO')) return '#be123c';
        if (tcNivel.includes('MEDIO')) return '#F28E1B';
        return '#355D93';
    }

    function colorRellenoOperativo(tcEstadoOperativo) {
        const tcEstado = String(tcEstadoOperativo || '').toUpperCase();
        if (tcEstado.includes('OFFLINE')) return '#64748b';
        if (tcEstado.includes('MANTEN')) return '#F28E1B';
        if (tcEstado.includes('ACTIVO') || tcEstado.includes('ONLINE')) return '#355D93';
        return '#94a3b8';
    }

    function escaparHtml(tcTexto) {
        return String(tcTexto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function esErrorServidor(loBloque) {
        return !loBloque?.ok && Number(loBloque?.status) >= 500;
    }

    function ajustarMapa() {
        if (!loEstado.mapa) return;
        window.requestAnimationFrame(() => {
            loEstado.mapa.invalidateSize(true);
            window.setTimeout(() => {
                loEstado.mapa?.invalidateSize(false);
            }, 140);
        });
    }

    async function refrescarPorContextoGlobal() {
        loFormularioFiltros.querySelector('input[name="Pagina"]').value = 1;
        await cargarTodoTablero();
    }

    window.addEventListener('erp:empresa-activa', refrescarPorContextoGlobal);
    window.addEventListener('erp:maquina-activa', refrescarPorContextoGlobal);

    Promise.all([cargarEstados()])
        .then(() => cargarTodoTablero())
        .catch(() => {
            mostrarToast('No se pudieron cargar catalogos del tablero.', 'error');
            void cargarTodoTablero();
        });
}
