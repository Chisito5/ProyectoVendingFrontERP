import { ventaService } from '../services/ventaService';
import { analiticaService } from '../services/analiticaService';
import { maquinaService } from '../services/maquinaService';
import { productoService } from '../services/productoService';
import { tableroService } from '../services/tableroService';
import { obtenerEmpresaActivaId } from '../core/contextoEmpresa';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { confirmarAccion } from '../ui/confirmacion';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { mostrarToast } from '../ui/toast';

const goContextoTableroVentas = {
    idsMaquinaValidos: new Set(),
    idMaquinaACodigo: new Map(),
    idMaquinaANombre: new Map(),
    casillaAIdMaquinaUnico: new Map(),
    casillaAProductoUnico: new Map(),
    maquinaCasillaAProducto: new Map(),
    idProductoANombre: new Map(),
    codigoProductoANombre: new Map(),
    catalogoProductosCargado: false,
};
const gcZonaHorariaDestino = String(window.__ERP_FRONTEND_CONFIG__?.apiTimezoneTarget || 'America/La_Paz');
const gcZonaHorariaOrigen = String(window.__ERP_FRONTEND_CONFIG__?.apiTimezoneSource || gcZonaHorariaDestino || 'America/La_Paz');
const gnOffsetOrigenMinutos = Number(window.__ERP_FRONTEND_CONFIG__?.apiTimeOffsetMinutes);

export function iniciarPaginaVentas() {
    const loFormularioVenta = buscar('#form-create-sale');
    const loFormularioReversa = buscar('#form-reverse-sale');
    const loFormularioFiltros = buscar('#form-filtros-ventas');

    const loMensajeVenta = buscar('#sale-message');
    const loMensajeReversa = buscar('#sale-reverse-message');
    const loKpiTransacciones = buscar('#ventas-kpi-transacciones');
    const loKpiMonto = buscar('#ventas-kpi-monto');
    const loKpiTicket = buscar('#ventas-kpi-ticket');

    const loBotonCrear = buscar('#btn-create-sale');
    const loBotonReversa = buscar('#btn-reverse-sale');
    const loBotonActualizar = buscar('#btn-load-sales');
    const loBotonFiltrar = buscar('#btn-load-sales-machine');
    const loInputBuscar = buscar('#sales-search-input');
    const loBodyTabla = buscar('#sales-transacciones-body');
    const loPageInfo = buscar('#sales-page-info');
    const loPageFirst = buscar('#sales-page-first');
    const loPagePrev = buscar('#sales-page-prev');
    const loPageNext = buscar('#sales-page-next');
    const loPageLast = buscar('#sales-page-last');

    const loEstado = {
        filas: [],
        filasFiltradas: [],
        fuente: 'venta',
        meta: { PaginaActual: 1, TotalPaginas: 1, TamanoPagina: 20, TotalRegistros: 0 },
    };

    aplicarEmpresaMaquinaEnFormulario(loFormularioVenta, { maquina: true, empresa: true });
    aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: true });
    limpiarFiltroMaquina(loFormularioFiltros);

    loFormularioVenta?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        setBotonCargando(loBotonCrear, true, 'Procesando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioVenta).entries());
        loPayload.Maquina = Number(loPayload.Maquina);
        loPayload.Cantidad = Number(loPayload.Cantidad);

        const loResultado = await ventaService.crear(loPayload);
        renderizarMensaje(loMensajeVenta, loResultado);

        if (loResultado.ok) {
            mostrarToast('Venta procesada correctamente.', 'ok');
            loFormularioVenta.reset();
            await cargarListado(1);
        } else {
            mostrarToast(loResultado.mensaje || 'Error al crear venta.', 'error');
        }

        setBotonCargando(loBotonCrear, false);
    });

    loFormularioReversa?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();

        const tlConfirmado = await confirmarAccion({
            titulo: 'Confirmar reversa de venta',
            mensaje: 'Se anulara la venta y se ajustara stock. Deseas continuar?',
            textoConfirmar: 'Si, reversar',
        });
        if (!tlConfirmado) return;

        setBotonCargando(loBotonReversa, true, 'Reversando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioReversa).entries());
        loPayload.Venta = Number(loPayload.Venta);

        const loResultado = await ventaService.reversar(loPayload);
        renderizarMensaje(loMensajeReversa, loResultado);

        if (loResultado.ok) {
            mostrarToast('Reversa aplicada.', 'ok');
            loFormularioReversa.reset();
            await cargarListado(loEstado.meta.PaginaActual || 1);
        } else {
            mostrarToast(loResultado.mensaje || 'No se pudo reversar.', 'error');
        }

        setBotonCargando(loBotonReversa, false);
    });

    loBotonActualizar?.addEventListener('click', async () => {
        await cargarListado(loEstado.meta.PaginaActual || 1);
    });

    loBotonFiltrar?.addEventListener('click', async () => {
        await cargarListado(1);
    });

    loInputBuscar?.addEventListener('input', () => {
        aplicarBusquedaLocal(loEstado, loInputBuscar?.value || '');
        renderizarTabla(loEstado, loBodyTabla);
        renderizarPaginacion(loEstado, loPageInfo, loPageFirst, loPagePrev, loPageNext, loPageLast);
    });

    loPageFirst?.addEventListener('click', async () => await cargarListado(1));
    loPagePrev?.addEventListener('click', async () => {
        const tnActual = Number(loEstado.meta.PaginaActual || 1);
        if (tnActual > 1) await cargarListado(tnActual - 1);
    });
    loPageNext?.addEventListener('click', async () => {
        const tnActual = Number(loEstado.meta.PaginaActual || 1);
        const tnTotal = Number(loEstado.meta.TotalPaginas || 1);
        if (tnActual < tnTotal) await cargarListado(tnActual + 1);
    });
    loPageLast?.addEventListener('click', async () => {
        const tnTotal = Number(loEstado.meta.TotalPaginas || 1);
        await cargarListado(tnTotal);
    });

    async function cargarListado(tnPagina = 1) {
        setBotonCargando(loBotonActualizar, true, 'Cargando...');

        const loFiltrosBase = obtenerFiltrosDeFormulario(loFormularioFiltros);
        loFiltrosBase.Busqueda = (loInputBuscar?.value || '').trim() || undefined;
        loFiltrosBase.Pagina = tnPagina;
        const loInputPagina = loFormularioFiltros?.querySelector('input[name="Pagina"]');
        if (loInputPagina) loInputPagina.value = tnPagina;

        const loFiltros = construirFiltrosVentas(loFiltrosBase);
        const loResultado = await consultarVentasSincronizadas(loFiltros);

        renderizarMensaje(loMensajeVenta, loResultado);
        if (!loResultado.ok) {
            setBotonCargando(loBotonActualizar, false);
            return;
        }

        loEstado.fuente = loResultado.fuente || 'venta';
        loEstado.filas = ordenarTransaccionesPorLlegada(Array.isArray(loResultado.filas) ? loResultado.filas : []);
        await cargarCatalogoMaquinasSiFalta();
        loEstado.filas = await enriquecerFilasConDetalleVenta(loEstado.filas);
        await cargarCatalogoProductosSiFalta();
        loEstado.filas = normalizarFilasConContextoTablero(loEstado.filas);
        loEstado.filas = await enriquecerProductosDesdeCeldas(loEstado.filas);
        loEstado.meta = loResultado.meta ?? extraerMetaPaginacion(loResultado);
        if (!Number.isFinite(Number(loEstado.meta.TotalRegistros)) || Number(loEstado.meta.TotalRegistros) < 1) {
            loEstado.meta.TotalRegistros = loEstado.filas.length;
        }
        if (!Number.isFinite(Number(loEstado.meta.TotalPaginas)) || Number(loEstado.meta.TotalPaginas) < 1) {
            loEstado.meta.TotalPaginas = 1;
        }

        actualizarResumenTransacciones(loEstado.filas, loKpiTransacciones, loKpiMonto, loKpiTicket);
        aplicarBusquedaLocal(loEstado, loInputBuscar?.value || '');
        renderizarTabla(loEstado, loBodyTabla);
        renderizarPaginacion(loEstado, loPageInfo, loPageFirst, loPagePrev, loPageNext, loPageLast);

        setBotonCargando(loBotonActualizar, false);
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioVenta, { maquina: true, empresa: true });
        aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: true });
        limpiarFiltroMaquina(loFormularioFiltros);
        void cargarListado(1);
    });

    void cargarListado(1);
}

function limpiarFiltroMaquina(loFormulario) {
    const loInputMaquina = loFormulario?.querySelector('[name="Maquina"]');
    if (!loInputMaquina) return;
    loInputMaquina.value = '';
}

async function consultarVentasSincronizadas(loFiltros) {
    const tnMaquina = Number(loFiltros.Maquina || 0);

    const loResultadoVenta = tnMaquina
        ? await ventaService.listarPorMaquina(tnMaquina, loFiltros)
        : await ventaService.listar(loFiltros);
    const loNormalizadoVenta = normalizarResultadoConsulta(loResultadoVenta, 'venta');
    if (loNormalizadoVenta.ok && Array.isArray(loNormalizadoVenta.filas) && loNormalizadoVenta.filas.length > 0) {
        return loNormalizadoVenta;
    }

    const laFilasTablero = await obtenerFilasTableroParaTransacciones(loFiltros);
    if (Array.isArray(laFilasTablero) && laFilasTablero.length > 0) {
        return {
            ok: true,
            mensaje: loNormalizadoVenta.ok
                ? 'Transacciones obtenidas desde tablero (fallback).'
                : (loNormalizadoVenta.mensaje || 'Transacciones obtenidas desde tablero (fallback).'),
            errores: loNormalizadoVenta.errores || [],
            status: loNormalizadoVenta.status || 200,
            fuente: 'tablero',
            filas: laFilasTablero,
            meta: {
                TotalRegistros: laFilasTablero.length,
                TotalPaginas: 1,
                PaginaActual: 1,
                TamanoPagina: Math.max(Number(loFiltros.TamanoPagina || 20), 1),
            },
        };
    }

    if (loNormalizadoVenta.ok) {
        return {
            ...loNormalizadoVenta,
            ok: true,
        };
    }

    return {
        ok: false,
        mensaje: loNormalizadoVenta.mensaje || 'No se encontraron transacciones en backend de ventas.',
        errores: loNormalizadoVenta.errores || [],
        status: loNormalizadoVenta.status || 404,
        fuente: 'venta',
        filas: [],
        meta: loNormalizadoVenta.meta ?? {
            TotalRegistros: 0,
            TotalPaginas: 1,
            PaginaActual: 1,
            TamanoPagina: Math.max(Number(loFiltros.TamanoPagina || 20), 1),
        },
    };
}

async function obtenerFilasTableroParaTransacciones(loFiltros) {
    const loResultadoTablero = await tableroService.unificado({
        Empresa: loFiltros.Empresa,
        Maquina: loFiltros.Maquina,
        FechaDesde: loFiltros.FechaDesde,
        FechaHasta: loFiltros.FechaHasta,
        Busqueda: loFiltros.Busqueda,
        Orden: loFiltros.Orden,
        Por: loFiltros.Por,
        Top: loFiltros.Top,
        Pagina: loFiltros.Pagina,
        TamanoPagina: loFiltros.TamanoPagina,
        IncluirDetalle: 1,
        IncluirVentas: 1,
        IncluirTransacciones: 1,
        IncluirCasillas: 1,
    });
    if (!loResultadoTablero?.ok) return [];

    actualizarContextoTableroVentas(loResultadoTablero?.datos ?? {});
    await cargarCatalogoMaquinasSiFalta();
    const loNormalizadoTablero = normalizarResultadoConsulta(loResultadoTablero, 'tablero');
    const laFilasDetalleMaquina = await consultarHistorialMaquinasDesdeTablero(loResultadoTablero?.datos, loFiltros);
    return deduplicarFilasPorClave([
        ...loNormalizadoTablero.filas,
        ...laFilasDetalleMaquina,
    ]);
}

async function cargarCatalogoMaquinasSiFalta() {
    if (goContextoTableroVentas.idMaquinaACodigo.size > 0) return;

    const loResultado = await maquinaService.listar({ Pagina: 1, TamanoPagina: 200 });
    if (!loResultado?.ok) return;

    const laMaquinas = convertirAArreglo(
        loResultado?.datos?.items ??
        loResultado?.datos?.Rows ??
        loResultado?.datos?.rows ??
        loResultado?.datos?.data ??
        loResultado?.datos
    );

    laMaquinas.forEach((loMaquina) => {
        const tnId = extraerIdEstricto(loMaquina, ['IdMaquina', 'Maquina', 'id']);
        if (!tnId) return;

        goContextoTableroVentas.idsMaquinaValidos.add(tnId);
        const tcCodigo = String(extraerValor(loMaquina, ['CodigoMaquina', 'Codigo']) || '').trim();
        const tcNombre = String(extraerValor(loMaquina, ['NombreMaquina', 'Nombre']) || '').trim();
        if (tcCodigo) goContextoTableroVentas.idMaquinaACodigo.set(tnId, tcCodigo);
        if (tcNombre) goContextoTableroVentas.idMaquinaANombre.set(tnId, tcNombre);
    });
}

async function cargarCatalogoProductosSiFalta() {
    if (goContextoTableroVentas.catalogoProductosCargado) return;

    const loResultado = await productoService.listar({ Pagina: 1, TamanoPagina: 500 });
    if (!loResultado?.ok) return;

    const laProductos = convertirAArreglo(
        loResultado?.datos?.items ??
        loResultado?.datos?.Rows ??
        loResultado?.datos?.rows ??
        loResultado?.datos?.data ??
        loResultado?.datos
    );

    laProductos.forEach((loProducto) => {
        const tnIdProducto = extraerIdEstricto(loProducto, ['IdProducto', 'Producto', 'id']);
        const tcCodigo = String(extraerValor(loProducto, ['CodigoProducto', 'Codigo']) || '').trim();
        const tcNombre = String(extraerValor(loProducto, ['NombreProducto', 'ProductoNombre', 'Nombre']) || '').trim();
        if (!tcNombre) return;

        if (tnIdProducto) goContextoTableroVentas.idProductoANombre.set(tnIdProducto, tcNombre);
        if (tcCodigo) goContextoTableroVentas.codigoProductoANombre.set(tcCodigo.toUpperCase(), tcNombre);
    });

    goContextoTableroVentas.catalogoProductosCargado = true;
}

function combinarFilasVentas(laPrimarias = [], laSecundarias = []) {
    if (!Array.isArray(laPrimarias) || !laPrimarias.length) return Array.isArray(laSecundarias) ? laSecundarias : [];
    if (!Array.isArray(laSecundarias) || !laSecundarias.length) return laPrimarias;

    const loSecByVenta = new Map();
    laSecundarias.forEach((loFila) => {
        const tnId = extraerIdVenta(loFila) || 0;
        if (!tnId) return;
        if (!loSecByVenta.has(tnId)) loSecByVenta.set(tnId, loFila);
    });

    return laPrimarias.map((loFila) => {
        const tnId = extraerIdVenta(loFila) || 0;
        const loSec = loSecByVenta.get(tnId);
        if (!loSec) return loFila;
        return enriquecerFilaConSecundaria(loFila, loSec);
    });
}

function enriquecerFilaConSecundaria(loBase, loSec) {
    const loResultado = { ...loBase };
    const laClaves = [
        'IdMaquina', 'Maquina', 'CodigoMaquina', 'NombreMaquina',
        'NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda',
        'Productos', 'DetalleProductos', 'Items', 'Detalle',
        'NombreProducto', 'ProductoNombre', 'Producto', 'DescripcionProducto',
        'Cantidad', 'CantidadVendida', 'PrecioUnitario', 'Precio', 'PrecioUnitarioFinal',
        'Monto', 'MontoTotal', 'Total', 'Importe', 'ValorTotal', 'MontoRecibido', 'MontoNeto', 'DineroEntrante',
        'FechaHora', 'FechaVenta', 'FechaTransaccion', 'FechaRegistro', 'CreatedAt',
    ];

    laClaves.forEach((tcClave) => {
        if (valorSignificativo(loResultado[tcClave])) return;
        if (valorSignificativo(loSec?.[tcClave])) {
            loResultado[tcClave] = loSec[tcClave];
        }
    });

    return loResultado;
}

function valorSignificativo(lxValor) {
    if (lxValor === null || lxValor === undefined) return false;
    if (typeof lxValor === 'string') {
        const tc = lxValor.trim();
        return tc !== '' && tc !== '-';
    }
    if (Array.isArray(lxValor)) return lxValor.length > 0;
    if (typeof lxValor === 'number') return Number.isFinite(lxValor) && lxValor !== 0;
    if (typeof lxValor === 'object') return Object.keys(lxValor).length > 0;
    return true;
}

function actualizarContextoTableroVentas(loDatos = {}) {
    goContextoTableroVentas.idsMaquinaValidos = new Set();
    goContextoTableroVentas.idMaquinaACodigo = new Map();
    goContextoTableroVentas.idMaquinaANombre = new Map();
    goContextoTableroVentas.casillaAIdMaquinaUnico = new Map();
    goContextoTableroVentas.casillaAProductoUnico = new Map();
    goContextoTableroVentas.maquinaCasillaAProducto = new Map();

    const laMaquinas = convertirAArreglo(
        loDatos?.Maquinas?.Rows ??
        loDatos?.Maquinas?.rows ??
        loDatos?.Maquinas?.items ??
        loDatos?.Maquinas?.data ??
        loDatos?.Maquinas
    );
    laMaquinas.forEach((loMaquina) => {
        const tnId = extraerIdEstricto(loMaquina, ['IdMaquina', 'Maquina', 'id']);
        if (!tnId) return;
        goContextoTableroVentas.idsMaquinaValidos.add(tnId);

        const tcCodigo = String(extraerValor(loMaquina, ['CodigoMaquina', 'Codigo']) || '').trim();
        const tcNombre = String(extraerValor(loMaquina, ['NombreMaquina', 'Nombre']) || '').trim();
        if (tcCodigo) goContextoTableroVentas.idMaquinaACodigo.set(tnId, tcCodigo);
        if (tcNombre) goContextoTableroVentas.idMaquinaANombre.set(tnId, tcNombre);
    });

    const laCasillas = convertirAArreglo(
        loDatos?.Casillas?.Rows ??
        loDatos?.Casillas?.rows ??
        loDatos?.Casillas?.items ??
        loDatos?.Casillas?.data ??
        loDatos?.Casillas
    );

    const loCasillaAIds = new Map();
    const loCasillaAProductos = new Map();
    laCasillas.forEach((loCasilla) => {
        const tnIdMaquina = extraerIdEstricto(loCasilla, ['IdMaquina', 'Maquina', 'id_maquina']);
        const tcCasilla = String(extraerValor(loCasilla, ['NumeroCasilla', 'Casilla', 'SlotNumber', 'Celda']) || '').trim();
        const tcProducto = String(extraerValor(loCasilla, ['NombreProducto', 'ProductoNombre', 'Producto']) || '').trim();
        if (!tcCasilla) return;

        if (!loCasillaAIds.has(tcCasilla)) loCasillaAIds.set(tcCasilla, new Set());
        if (tnIdMaquina) loCasillaAIds.get(tcCasilla).add(tnIdMaquina);

        if (!loCasillaAProductos.has(tcCasilla)) loCasillaAProductos.set(tcCasilla, new Set());
        if (tcProducto) loCasillaAProductos.get(tcCasilla).add(tcProducto);

        if (tnIdMaquina && tcProducto) {
            goContextoTableroVentas.maquinaCasillaAProducto.set(`${tnIdMaquina}|${tcCasilla}`, tcProducto);
        }
    });

    loCasillaAIds.forEach((loSet, tcCasilla) => {
        if (loSet.size === 1) {
            goContextoTableroVentas.casillaAIdMaquinaUnico.set(tcCasilla, [...loSet][0]);
        }
    });

    loCasillaAProductos.forEach((loSet, tcCasilla) => {
        if (loSet.size === 1) {
            goContextoTableroVentas.casillaAProductoUnico.set(tcCasilla, [...loSet][0]);
        }
    });
}

function normalizarFilasConContextoTablero(laFilas = []) {
    if (!Array.isArray(laFilas) || !laFilas.length) return [];

    return laFilas.map((loFila) => {
        const loNormalizada = { ...loFila };
        const tnIdMaquinaActual = resolverIdMaquinaConContexto(loNormalizada) || 0;
        const tcCasilla = String(extraerValor(loNormalizada, ['NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda', 'IdCasilla']) || '').trim();
        const tlIdValido = esIdMaquinaValido(tnIdMaquinaActual);

        if (!tlIdValido && tcCasilla) {
            const tnIdDesdeCasilla = goContextoTableroVentas.casillaAIdMaquinaUnico.get(tcCasilla);
            if (tnIdDesdeCasilla) {
                loNormalizada.IdMaquina = tnIdDesdeCasilla;
            }
        }

        if (formatearProductos(loNormalizada) === '-' && tcCasilla) {
            const tnIdFinal = extraerIdMaquina(loNormalizada) || 0;
            const tcProductoPorMaquinaCasilla = tnIdFinal > 0
                ? goContextoTableroVentas.maquinaCasillaAProducto.get(`${tnIdFinal}|${tcCasilla}`)
                : '';
            const tcProducto = tcProductoPorMaquinaCasilla || goContextoTableroVentas.casillaAProductoUnico.get(tcCasilla) || '';
            if (tcProducto) {
                loNormalizada.NombreProducto = tcProducto;
            }
        }

        return loNormalizada;
    });
}

async function enriquecerProductosDesdeCeldas(laFilas = []) {
    if (!Array.isArray(laFilas) || !laFilas.length) return [];

    const loCeldasPorMaquina = new Map();
    const laPendientes = laFilas.filter((loFila) => {
        const tnIdMaquina = resolverIdMaquinaConContexto(loFila) || 0;
        const tcCasilla = String(extraerValor(loFila, ['NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda', 'IdCasilla']) || '').trim();
        if (!tnIdMaquina || !tcCasilla) return false;
        return formatearProductos(loFila) === '-';
    });

    if (!laPendientes.length) return laFilas;

    const laMaquinas = [...new Set(laPendientes.map((loFila) => resolverIdMaquinaConContexto(loFila)).filter(Boolean))];
    await Promise.all(laMaquinas.map(async (tnIdMaquina) => {
        const loResultado = await maquinaService.listarCeldas(tnIdMaquina, { Pagina: 1, TamanoPagina: 500 });
        if (!loResultado?.ok) return;
        const laCeldas = convertirAArreglo(
            loResultado?.datos?.items ??
            loResultado?.datos?.Rows ??
            loResultado?.datos?.rows ??
            loResultado?.datos?.data ??
            loResultado?.datos
        );

        const loMapCasillaProducto = new Map();
        laCeldas.forEach((loCelda) => {
            const tcCasilla = String(extraerValor(loCelda, ['NumeroCasilla', 'Casilla', 'SlotNumber', 'Celda', 'Numero']) || '').trim();
            const tcProducto = resolverNombreProducto(loCelda);
            if (!tcCasilla || !tcProducto) return;
            loMapCasillaProducto.set(tcCasilla, tcProducto);
        });

        if (loMapCasillaProducto.size > 0) {
            loCeldasPorMaquina.set(Number(tnIdMaquina), loMapCasillaProducto);
        }
    }));

    return laFilas.map((loFila) => {
        if (formatearProductos(loFila) !== '-') return loFila;
        const tnIdMaquina = resolverIdMaquinaConContexto(loFila) || 0;
        const tcCasilla = String(extraerValor(loFila, ['NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda', 'IdCasilla']) || '').trim();
        if (!tnIdMaquina || !tcCasilla) {
            const tcProductoDirecto = resolverNombreProducto(loFila);
            if (!tcProductoDirecto) return loFila;
            return {
                ...loFila,
                NombreProducto: tcProductoDirecto,
            };
        }

        const loMapCasillaProducto = loCeldasPorMaquina.get(Number(tnIdMaquina));
        const tcProducto = loMapCasillaProducto?.get(tcCasilla);
        if (!tcProducto) {
            const tcProductoDirecto = resolverNombreProducto(loFila);
            if (!tcProductoDirecto) return loFila;
            return {
                ...loFila,
                NombreProducto: tcProductoDirecto,
            };
        }

        return {
            ...loFila,
            NombreProducto: tcProducto,
        };
    });
}

function resolverIdMaquinaConContexto(loFila) {
    const tnIdDirecto = extraerIdMaquina(loFila) || 0;
    if (esIdMaquinaValido(tnIdDirecto)) return tnIdDirecto;

    const tnIdDesdeMaquina = extraerIdEstricto(loFila, ['Maquina']);
    if (esIdMaquinaValido(tnIdDesdeMaquina || 0)) return tnIdDesdeMaquina;

    const tcCasilla = String(extraerValor(loFila, ['NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda', 'IdCasilla']) || '').trim();
    if (tcCasilla && goContextoTableroVentas.casillaAIdMaquinaUnico.has(tcCasilla)) {
        return goContextoTableroVentas.casillaAIdMaquinaUnico.get(tcCasilla);
    }

    return 0;
}

function esIdMaquinaValido(tnId) {
    const tn = Number(tnId || 0);
    if (!Number.isInteger(tn) || tn <= 0) return false;
    if (goContextoTableroVentas.idsMaquinaValidos.size === 0) return true;
    return goContextoTableroVentas.idsMaquinaValidos.has(tn);
}

function construirFiltrosVentas(loFiltrosBase = {}) {
    const tnEmpresaContexto = Number(obtenerEmpresaActivaId() || 0);
    const tnEmpresaFormulario = Number(loFiltrosBase.Empresa || loFiltrosBase.IdEmpresa || 0);
    const tnMaquinaFormulario = Number(loFiltrosBase.Maquina || loFiltrosBase.IdMaquina || 0);

    return {
        ...loFiltrosBase,
        Empresa: tnEmpresaFormulario > 0 ? tnEmpresaFormulario : (tnEmpresaContexto > 0 ? tnEmpresaContexto : undefined),
        Maquina: tnMaquinaFormulario > 0 ? tnMaquinaFormulario : undefined,
        Busqueda: loFiltrosBase.Busqueda || undefined,
        Orden: loFiltrosBase.Orden || undefined,
        Por: loFiltrosBase.Por || undefined,
        Top: loFiltrosBase.Top ? Number(loFiltrosBase.Top) : undefined,
        Pagina: Math.max(1, Number(loFiltrosBase.Pagina || 1)),
        TamanoPagina: Math.max(1, Number(loFiltrosBase.TamanoPagina || 20)),
    };
}

async function enriquecerFilasConDetalleVenta(laFilas = []) {
    if (!Array.isArray(laFilas) || !laFilas.length) return [];

    const laNecesitanDetalle = laFilas.filter((loFila) => {
        const tnIdVenta = extraerIdVenta(loFila) || 0;
        if (!tnIdVenta) return false;

        const tlSinProducto = formatearProductos(loFila) === '-';
        const tlSinMonto = !montoValido(extraerMontoNumerico(loFila)) && !montoValido(extraerMontoRecibido(loFila));
        const tlSinMaquina = (extraerIdMaquina(loFila) || 0) <= 0;
        return tlSinProducto || tlSinMonto || tlSinMaquina;
    });

    if (!laNecesitanDetalle.length) return laFilas;

    const loDetallePorVenta = new Map();
    const laRespuestas = await Promise.all(laNecesitanDetalle.map(async (loFila) => {
        const tnIdVenta = extraerIdVenta(loFila) || 0;
        const loResultado = await ventaService.obtener(tnIdVenta);
        if (!loResultado?.ok) return null;
        return { IdVenta: tnIdVenta, Datos: loResultado.datos };
    }));

    laRespuestas.forEach((loItem) => {
        if (!loItem?.IdVenta || !loItem?.Datos) return;
        loDetallePorVenta.set(loItem.IdVenta, normalizarDetalleVenta(loItem.Datos));
    });

    return laFilas.map((loFila) => {
        const tnIdVenta = extraerIdVenta(loFila) || 0;
        const loDetalle = loDetallePorVenta.get(tnIdVenta);
        if (!loDetalle) return loFila;

        const loCombinada = { ...loFila };
        if (!valorSignificativo(loCombinada.IdMaquina) && valorSignificativo(loDetalle.base.IdMaquina)) {
            loCombinada.IdMaquina = loDetalle.base.IdMaquina;
        }
        if (!valorSignificativo(loCombinada.IdProducto) && valorSignificativo(loDetalle.base.IdProducto)) {
            loCombinada.IdProducto = loDetalle.base.IdProducto;
        }
        if (!valorSignificativo(loCombinada.CodigoSeleccion) && valorSignificativo(loDetalle.base.CodigoSeleccion)) {
            loCombinada.CodigoSeleccion = loDetalle.base.CodigoSeleccion;
        }
        if (!valorSignificativo(loCombinada.NombreProducto) && valorSignificativo(loDetalle.base.NombreProducto)) {
            loCombinada.NombreProducto = loDetalle.base.NombreProducto;
        }
        if ((!Array.isArray(loCombinada.Productos) || loCombinada.Productos.length === 0) && loDetalle.productos.length) {
            loCombinada.Productos = loDetalle.productos;
        }
        aplicarMontoDeDetalle(loCombinada, loDetalle.base, { sobrescribirConDetalle: true });
        return loCombinada;
    });
}

function normalizarDetalleVenta(loDatos = {}) {
    const loContenedor = (loDatos && typeof loDatos === 'object') ? loDatos : {};
    const loBaseVenta = loContenedor.Venta ?? loContenedor.venta ?? loContenedor.Transaccion ?? loContenedor.transaccion ?? loContenedor;
    const laProductos = convertirAArreglo(
        loContenedor.DetalleProductos ??
        loContenedor.Detalles ??
        loContenedor.Detalle ??
        loContenedor.Items ??
        loContenedor.Productos ??
        loBaseVenta?.DetalleProductos ??
        loBaseVenta?.Detalle ??
        loBaseVenta?.Items ??
        loBaseVenta?.Productos
    );

    return {
        base: {
            IdMaquina: loBaseVenta.IdMaquina ?? loBaseVenta.MaquinaId ?? loBaseVenta.Maquina ?? loBaseVenta.IdMachine,
            IdProducto: loBaseVenta.IdProducto ?? loBaseVenta.ProductoId ?? loBaseVenta.Producto ?? loBaseVenta.ProductoEmpresa,
            Monto: loBaseVenta.Monto ?? loBaseVenta.MontoTotal ?? loBaseVenta.Total ?? loBaseVenta.Importe ?? loBaseVenta.ValorTotal,
            MontoEnviado: loBaseVenta.MontoEnviado ?? loBaseVenta.Monto,
            MontoRecibido: loBaseVenta.MontoRecibido ?? loBaseVenta.MontoNeto ?? loBaseVenta.MontoPagado ?? loBaseVenta.DineroEntrante,
            Cantidad: loBaseVenta.Cantidad ?? loBaseVenta.CantidadVendida,
            PrecioUnitario: loBaseVenta.PrecioUnitario ?? loBaseVenta.Precio ?? loBaseVenta.PrecioUnitarioFinal,
            CodigoSeleccion: loBaseVenta.CodigoSeleccion ?? loBaseVenta.CodigoProducto ?? '',
            NombreProducto: resolverNombreProducto(loBaseVenta) || '',
        },
        productos: laProductos,
    };
}

function normalizarResultadoConsulta(loResultado, tcFuente) {
    const laFilas = extraerFilasDesdeResultado(loResultado?.datos, tcFuente);
    const loMeta = construirMetaConsulta(loResultado, laFilas.length);

    return {
        ok: Boolean(loResultado?.ok),
        mensaje: loResultado?.mensaje || '',
        errores: loResultado?.errores || [],
        status: loResultado?.status || 0,
        fuente: tcFuente,
        filas: laFilas,
        meta: loMeta,
        datos: loResultado?.datos,
    };
}

function extraerFilasDesdeResultado(loDatos, tcFuente) {
    if (!loDatos) return [];

    if (tcFuente === 'tablero') {
        return extraerFilasTablero(loDatos);
    }

    const laFilas = convertirAArreglo(
        loDatos?.items ??
        loDatos?.Rows ??
        loDatos?.rows ??
        loDatos?.data ??
        loDatos?.lista ??
        loDatos
    );

    if (tcFuente === 'venta') {
        return Array.isArray(laFilas) ? laFilas : [];
    }

    const laBase = depurarFilasTransaccion(Array.isArray(laFilas) ? laFilas : []);
    if (laBase.length > 0) {
        return laBase;
    }
    return depurarFilasTransaccion(explorarBloquesVentas(loDatos));
}

function extraerFilasTablero(loDatos = {}) {
    const laBloques = [
        loDatos.Transacciones,
        loDatos.Ventas,
        loDatos.VentasDetalle,
        loDatos.HistorialVentas,
        loDatos.UltimasVentas,
        loDatos.ListadoVentas,
        loDatos.DetalleVentas,
        loDatos.DetalleMaquina?.Ventas,
        loDatos.DetalleMaquina?.Transacciones,
        loDatos.DetalleMaquina?.HistorialVentas,
    ];

    const laFilas = [];
    laBloques.forEach((lxBloque) => {
        laFilas.push(...convertirAArreglo(
            lxBloque?.items ??
            lxBloque?.Rows ??
            lxBloque?.rows ??
            lxBloque?.data ??
            lxBloque?.lista ??
            lxBloque
        ));
    });
    laFilas.push(...explorarBloquesVentas(loDatos));

    const laValidas = depurarFilasTransaccion(laFilas);
    return deduplicarFilasPorClave(laValidas);
}

function explorarBloquesVentas(loNodo, tnNivel = 0, loVisitados = new WeakSet()) {
    if (!loNodo || typeof loNodo !== 'object') return [];
    if (tnNivel > 5) return [];
    if (loVisitados.has(loNodo)) return [];
    loVisitados.add(loNodo);

    const laFilas = [];
    if (Array.isArray(loNodo)) {
        loNodo.forEach((loItem) => {
            laFilas.push(...explorarBloquesVentas(loItem, tnNivel + 1, loVisitados));
        });
        return laFilas;
    }

    Object.entries(loNodo).forEach(([tcClave, lxValor]) => {
        if (!lxValor || typeof lxValor !== 'object') return;

        const tlClaveVenta = /(venta|transaccion|operacion|historial)/i.test(tcClave);
        if (tlClaveVenta) {
            laFilas.push(...convertirAArreglo(
                lxValor?.items ??
                lxValor?.Rows ??
                lxValor?.rows ??
                lxValor?.data ??
                lxValor?.lista ??
                lxValor
            ));
        }

        laFilas.push(...explorarBloquesVentas(lxValor, tnNivel + 1, loVisitados));
    });

    return laFilas;
}

function filtrarFilasConAparienciaDeVenta(laFilas = []) {
    return (Array.isArray(laFilas) ? laFilas : []).filter((loFila) => {
        if (!loFila || typeof loFila !== 'object') return false;
        return Boolean(
            extraerValor(loFila, ['IdVenta', 'Venta', 'IdTransaccion', 'Transaccion', 'Id', 'CodigoOperacion']) ||
            extraerValor(loFila, ['Monto', 'MontoTotal', 'Total', 'Importe', 'ValorTotal']) ||
            extraerValor(loFila, ['FechaHora', 'FechaVenta', 'FechaTransaccion', 'FechaRegistro', 'CreatedAt']) ||
            extraerValor(loFila, ['Productos', 'DetalleProductos', 'Items', 'Detalle'])
        );
    });
}

function depurarFilasTransaccion(laFilas = []) {
    const laEntrada = Array.isArray(laFilas) ? laFilas : [];
    if (!laEntrada.length) return [];

    const laFiltradas = laEntrada.filter((loFila) => {
        if (!loFila || typeof loFila !== 'object') return false;

        const tlTieneId = tieneCampoIdTransaccion(loFila);
        const tlTieneFecha = tieneCampoFecha(loFila);
        const tlTieneProducto = tieneCampoProducto(loFila);
        const tlTieneMonto = extraerMontoNumerico(loFila) > 0;

        if (tlTieneId && (tlTieneFecha || tlTieneProducto || tlTieneMonto)) return true;
        if (tlTieneMonto && tlTieneFecha) return true;
        return false;
    });

    return laFiltradas.length ? laFiltradas : filtrarFilasConAparienciaDeVenta(laEntrada);
}

function tieneCampoIdTransaccion(loFila) {
    const laClavesDirectas = ['IdVenta', 'Venta', 'IdTransaccion', 'Transaccion', 'Id', 'CodigoOperacion', 'NroOperacion', 'Operacion'];
    if (extraerValor(loFila, laClavesDirectas)) return true;

    return Object.keys(loFila).some((tcClave) => /(id.*(venta|transaccion|operacion)|venta|transaccion|operacion|nro|numero)/i.test(tcClave));
}

function tieneCampoFecha(loFila) {
    const laClavesDirectas = ['FechaHora', 'FechaVenta', 'FechaTransaccion', 'CreadoEn', 'Fecha', 'FechaRegistro', 'CreatedAt', 'UsrFecha', 'UsrHora'];
    if (extraerValor(loFila, laClavesDirectas)) return true;

    return Object.keys(loFila).some((tcClave) => /(fecha|hora|created|creado)/i.test(tcClave));
}

function tieneCampoProducto(loFila) {
    const laClavesDirectas = ['Productos', 'DetalleProductos', 'Items', 'Detalle', 'producto', 'Producto', 'ProductoNombre', 'NombreProducto'];
    if (extraerValor(loFila, laClavesDirectas)) return true;

    return Object.keys(loFila).some((tcClave) => /(producto|item|detalle|articulo)/i.test(tcClave));
}

function construirKeyFila(loFila) {
    const tcId = String(extraerIdVenta(loFila) || '').trim();
    const tcFecha = String(extraerValor(loFila, ['FechaHora', 'FechaVenta', 'FechaTransaccion', 'FechaRegistro', 'CreatedAt']) || '').trim();
    const tcMonto = String(extraerValor(loFila, ['Monto', 'MontoTotal', 'Total', 'Importe', 'ValorTotal']) || '').trim();
    const tcProductos = String(formatearProductos(loFila) || '').trim();
    return [tcId, tcFecha, tcMonto, tcProductos].join('|');
}

function deduplicarFilasPorClave(laFilas = []) {
    const loIds = new Set();
    return (Array.isArray(laFilas) ? laFilas : []).filter((loFila) => {
        const tcKey = construirKeyFila(loFila);
        if (loIds.has(tcKey)) return false;
        loIds.add(tcKey);
        return true;
    });
}

async function consultarHistorialMaquinasDesdeTablero(loDatosTablero, loFiltros) {
    const laMaquinas = extraerMaquinasDesdeUnificado(loDatosTablero, loFiltros);
    if (!laMaquinas.length) return [];

    const laResultados = await Promise.all(laMaquinas.map(async (loMaquina) => {
        const loDetalle = await tableroService.detalleMaquinaEjecutivo(loMaquina.IdMaquina, {
            FechaDesde: loFiltros.FechaDesde,
            FechaHasta: loFiltros.FechaHasta,
            Pagina: 1,
            TamanoPagina: Math.max(50, Number(loFiltros.TamanoPagina || 20)),
            IncluirVentas: 1,
            IncluirTransacciones: 1,
        });

        if (!loDetalle?.ok) return [];
        const laFilas = depurarFilasTransaccion(explorarBloquesVentas(loDetalle?.datos ?? {}));
        return laFilas.map((loFila) => ({
            ...loFila,
            IdMaquina: loFila.IdMaquina ?? loFila.Maquina ?? loMaquina.IdMaquina,
            CodigoMaquina: loFila.CodigoMaquina ?? loMaquina.CodigoMaquina ?? loMaquina.NombreMaquina ?? '',
            NombreMaquina: loFila.NombreMaquina ?? loMaquina.NombreMaquina ?? loMaquina.CodigoMaquina ?? '',
        }));
    }));

    return laResultados.flat();
}

function extraerMaquinasDesdeUnificado(loDatosTablero = {}, loFiltros = {}) {
    const tnMaquina = Number(loFiltros.Maquina || 0);
    if (tnMaquina > 0) {
        return [{ IdMaquina: tnMaquina, CodigoMaquina: '', NombreMaquina: '' }];
    }

    const laFilas = convertirAArreglo(
        loDatosTablero?.Maquinas?.Rows ??
        loDatosTablero?.Maquinas?.rows ??
        loDatosTablero?.Maquinas?.items ??
        loDatosTablero?.Maquinas?.data ??
        loDatosTablero?.Maquinas ??
        []
    );

    const loMap = new Map();
    laFilas.forEach((loFila) => {
        const tnId = extraerIdEstricto(loFila, ['IdMaquina', 'MaquinaId', 'IdMachine', 'MachineId', 'id']) || 0;
        if (tnId <= 0) return;
        if (loMap.has(tnId)) return;
        loMap.set(tnId, {
            IdMaquina: tnId,
            CodigoMaquina: loFila?.CodigoMaquina ?? loFila?.Codigo ?? '',
            NombreMaquina: loFila?.NombreMaquina ?? loFila?.Nombre ?? '',
        });
    });

    return [...loMap.values()].slice(0, 20);
}

function construirMetaConsulta(loResultado = {}, tnFilas = 0) {
    const loMetaBase = extraerMetaPaginacion(loResultado);
    const tnPaginaActual = Number(loMetaBase.PaginaActual || 1);
    const tnTamanoPagina = Number(loMetaBase.TamanoPagina || Math.max(tnFilas, 1));
    const tnTotalRegistros = Number(loMetaBase.TotalRegistros || tnFilas);
    const tnTotalPaginas = Number(loMetaBase.TotalPaginas || Math.max(1, Math.ceil(tnTotalRegistros / tnTamanoPagina)));

    return {
        PaginaActual: tnPaginaActual > 0 ? tnPaginaActual : 1,
        TamanoPagina: tnTamanoPagina > 0 ? tnTamanoPagina : Math.max(tnFilas, 1),
        TotalRegistros: tnTotalRegistros >= 0 ? tnTotalRegistros : tnFilas,
        TotalPaginas: tnTotalPaginas > 0 ? tnTotalPaginas : 1,
    };
}

function tieneFilas(laFilas) {
    return Array.isArray(laFilas) && laFilas.length > 0;
}

function ordenarTransaccionesPorLlegada(laFilas = []) {
    return [...(Array.isArray(laFilas) ? laFilas : [])].sort((loA, loB) => {
        const tnFechaA = extraerTimestampLlegada(loA);
        const tnFechaB = extraerTimestampLlegada(loB);
        if (tnFechaB !== tnFechaA) return tnFechaB - tnFechaA;

        const tnIdA = extraerIdVenta(loA) || 0;
        const tnIdB = extraerIdVenta(loB) || 0;
        if (tnIdB !== tnIdA) return tnIdB - tnIdA;

        return 0;
    });
}

function extraerTimestampLlegada(loFila) {
    const txFechaDirecta = extraerValor(loFila, [
        'FechaHora',
        'FechaVenta',
        'FechaTransaccion',
        'CreadoEn',
        'Fecha',
        'FechaRegistro',
        'CreatedAt',
        'UsrFechaHora',
    ]);
    const tnDirecta = aTimestamp(txFechaDirecta);
    if (tnDirecta > 0) return tnDirecta;

    const tcUsrFecha = String(extraerValor(loFila, ['UsrFecha']) || '').trim();
    const tcUsrHora = String(extraerValor(loFila, ['UsrHora']) || '').trim();
    if (tcUsrFecha) {
        const tnCompuesta = aTimestamp(`${tcUsrFecha} ${tcUsrHora || '00:00:00'}`);
        if (tnCompuesta > 0) return tnCompuesta;
    }

    return 0;
}

function aTimestamp(txFecha) {
    if (txFecha === null || txFecha === undefined || txFecha === '') return 0;
    const tc = String(txFecha).trim();
    if (!tc) return 0;

    const tnNumerico = Number(tc);
    if (Number.isFinite(tnNumerico) && tnNumerico > 0) {
        return tnNumerico > 10_000_000_000 ? tnNumerico : tnNumerico * 1000;
    }

    const loFecha = new Date(tc);
    if (Number.isFinite(loFecha.getTime())) return loFecha.getTime();

    const tcNormalizada = tc.replace(' ', 'T');
    const loFechaNormalizada = new Date(tcNormalizada);
    if (Number.isFinite(loFechaNormalizada.getTime())) return loFechaNormalizada.getTime();

    return 0;
}

function aplicarFechasPorDefecto(loFormulario) {
    if (!loFormulario) return;
    const loFechaDesde = loFormulario.querySelector('input[name="FechaDesde"]');
    const loFechaHasta = loFormulario.querySelector('input[name="FechaHasta"]');
    if (!loFechaDesde || !loFechaHasta) return;

    const loHoy = new Date();
    const loInicioMes = new Date(loHoy.getFullYear(), loHoy.getMonth(), 1);
    if (!loFechaDesde.value) loFechaDesde.value = aIsoFecha(loInicioMes);
    if (!loFechaHasta.value) loFechaHasta.value = aIsoFecha(loHoy);
}

function aIsoFecha(loFecha) {
    return loFecha.toISOString().split('T')[0];
}

function aplicarBusquedaLocal(loEstado, tcBusqueda) {
    const tcQuery = String(tcBusqueda || '').trim().toLowerCase();
    if (!tcQuery) {
        loEstado.filasFiltradas = [...loEstado.filas];
        return;
    }

    loEstado.filasFiltradas = loEstado.filas.filter((loFila) => {
        const tcEmisor = String(extraerValor(loFila, ['ClienteEmisor', 'Emisor', 'Usuario', 'Cliente', 'UsuarioEmisor']) || '').toLowerCase();
        const tcReceptor = String(extraerValor(loFila, ['ClienteReceptor', 'Receptor', 'Destinatario', 'ClienteDestino']) || '').toLowerCase();
        const tcReferencia = String(extraerValor(loFila, ['Referencia', 'CodigoOperacion', 'NroOperacion', 'Operacion']) || '').toLowerCase();
        const tcMaquina = String(extraerValor(loFila, ['CodigoMaquina', 'NombreMaquina', 'Maquina', 'IdMaquina']) || '').toLowerCase();
        const tcCasilla = String(extraerValor(loFila, ['NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda', 'IdCasilla']) || '').toLowerCase();
        const tcMonto = String(extraerValor(loFila, ['Monto', 'MontoTotal', 'Total', 'Importe', 'ValorTotal']) || '').toLowerCase();

        return tcEmisor.includes(tcQuery) || tcReceptor.includes(tcQuery) || tcReferencia.includes(tcQuery) || tcMaquina.includes(tcQuery) || tcCasilla.includes(tcQuery) || tcMonto.includes(tcQuery);
    });
}

function renderizarTabla(loEstado, loBodyTabla) {
    if (!loBodyTabla) return;
    const laFilas = Array.isArray(loEstado.filasFiltradas) ? loEstado.filasFiltradas : [];

    if (!laFilas.length) {
        loBodyTabla.innerHTML = '<tr><td colspan="13">No se encontraron transacciones.</td></tr>';
        return;
    }

    const tnOffset = (Number(loEstado.meta.PaginaActual || 1) - 1) * Number(loEstado.meta.TamanoPagina || 20);
    loBodyTabla.innerHTML = laFilas.map((loFila, tnIndice) => {
        const tnId = extraerIdVenta(loFila) || 0;
        const tnIdMaquina = resolverIdMaquinaConContexto(loFila) || 0;
        const tcCodigoMaquina = resolverCodigoMaquina(loFila, tnIdMaquina);
        const tcCasilla = extraerValor(loFila, ['NumeroCasilla', 'Casilla', 'Slot', 'SlotNumber', 'Celda', 'IdCasilla']) || '-';
        const tcEmisor = extraerValor(loFila, ['ClienteEmisor', 'Emisor', 'Usuario', 'Cliente', 'UsuarioEmisor']) || '-';
        const tcReceptor = extraerValor(loFila, ['ClienteReceptor', 'Receptor', 'Destinatario', 'ClienteDestino']) || '-';
        const tcMetodo = extraerValor(loFila, ['MetodoPago', 'Metodo', 'FormaPago', 'CanalPago']) || '-';
        const tcEstado = normalizarEstado(extraerValor(loFila, ['Estado', 'EstadoVenta', 'Situacion']) || 'Registrada');
        const loFecha = extraerFechaHora(loFila);
        const tcProducto = formatearProductos(loFila);
        const tnMontoEnviado = extraerMontoNumerico(loFila);
        const tnMontoRecibido = extraerMontoRecibido(loFila);

        return `
            <tr>
                <td>${tnOffset + tnIndice + 1}</td>
                <td>${tnId || '-'}</td>
                <td>${escapeHtml(tcCodigoMaquina)}</td>
                <td>${escapeHtml(tcCasilla)}</td>
                <td>${escapeHtml(tcEmisor)}</td>
                <td>${escapeHtml(tcReceptor)}</td>
                <td>${escapeHtml(tcMetodo)}</td>
                <td>${escapeHtml(tcEstado)}</td>
                <td>${escapeHtml(loFecha.fecha)}</td>
                <td>${escapeHtml(loFecha.hora)}</td>
                <td>${escapeHtml(tcProducto)}</td>
                <td>${formatearMonto(tnMontoEnviado)}</td>
                <td>${formatearMonto(tnMontoRecibido)}</td>
            </tr>
        `;
    }).join('');
}

function resolverCodigoMaquina(loFila, tnIdMaquina = 0) {
    const tcDirecto = String(extraerValor(loFila, ['CodigoMaquina', 'Codigo']) || '').trim();
    if (tcDirecto) return tcDirecto;
    if (tnIdMaquina > 0 && goContextoTableroVentas.idMaquinaACodigo.has(tnIdMaquina)) {
        return goContextoTableroVentas.idMaquinaACodigo.get(tnIdMaquina);
    }
    return '-';
}

function resolverNombreMaquina(loFila, tnIdMaquina = 0, tcCodigo = '-') {
    const tcDirecto = String(extraerValor(loFila, ['NombreMaquina', 'Nombre']) || '').trim();
    if (tcDirecto) return tcDirecto;
    if (tnIdMaquina > 0 && goContextoTableroVentas.idMaquinaANombre.has(tnIdMaquina)) {
        return goContextoTableroVentas.idMaquinaANombre.get(tnIdMaquina);
    }
    return tcCodigo !== '-' ? tcCodigo : '-';
}

function renderizarPaginacion(loEstado, loPageInfo, loFirst, loPrev, loNext, loLast) {
    const tnActual = Number(loEstado.meta.PaginaActual || 1);
    const tnTotal = Number(loEstado.meta.TotalPaginas || 1);
    if (loPageInfo) loPageInfo.textContent = `Pagina ${tnActual} de ${tnTotal}`;
    if (loFirst) loFirst.disabled = tnActual <= 1;
    if (loPrev) loPrev.disabled = tnActual <= 1;
    if (loNext) loNext.disabled = tnActual >= tnTotal;
    if (loLast) loLast.disabled = tnActual >= tnTotal;
}

function extraerValor(loFila, laClaves) {
    for (const tcClave of laClaves) {
        if (loFila?.[tcClave] !== undefined && loFila?.[tcClave] !== null && loFila?.[tcClave] !== '') {
            return loFila[tcClave];
        }
    }
    return '';
}

function extraerIdVenta(loFila) {
    return extraerIdEstricto(loFila, [
        'IdVenta',
        'Venta',
        'IdTransaccion',
        'Transaccion',
        'IdOperacionVenta',
        'IdMovimientoVenta',
        'Id',
    ]);
}

function extraerIdMaquina(loFila) {
    return extraerIdEstricto(loFila, [
        'IdMaquina',
        'MaquinaId',
        'IdMachine',
        'MachineId',
        'IdDispositivo',
        'DispositivoId',
    ]);
}

function extraerIdEstricto(loFila, laClaves = []) {
    for (const tcClave of laClaves) {
        if (!loFila || loFila[tcClave] === undefined || loFila[tcClave] === null || loFila[tcClave] === '') continue;
        const tnValor = Number(String(loFila[tcClave]).trim());
        if (Number.isInteger(tnValor) && tnValor > 0) return tnValor;
    }
    return null;
}

function formatearMonto(txMonto) {
    const tnMonto = Number(txMonto);
    if (!Number.isFinite(tnMonto)) return '-';
    return `Bs ${tnMonto.toFixed(2)}`;
}

function extraerMontoNumerico(loFila) {
    const tnMontoDirecto = convertirNumeroSeguro(extraerValorFlexible(loFila, [
        'MontoEnviado',
        'Monto',
        'MontoTotal',
        'MontoFinal',
        'MontoVenta',
        'TotalPagado',
        'Subtotal',
        'Total',
        'Importe',
        'ValorTotal',
        'MontoPagado',
        'MontoCobrado',
        'DineroEntrante',
        'monto_total',
        'monto_enviado',
    ]));
    if (Number.isFinite(tnMontoDirecto)) return tnMontoDirecto;

    // Fallback de backend: cuando solo llega precio unitario y cantidad.
    const tnPrecioUnitario = convertirNumeroSeguro(extraerValorFlexible(loFila, [
        'PrecioUnitario',
        'Precio',
        'PrecioUnitarioFinal',
        'precio_unitario',
    ]));
    const tnCantidad = convertirNumeroSeguro(extraerValorFlexible(loFila, [
        'Cantidad',
        'CantidadVendida',
        'Unidades',
        'cantidad',
    ]));
    if (Number.isFinite(tnPrecioUnitario)) {
        const tnCant = Number.isFinite(tnCantidad) && tnCantidad > 0 ? tnCantidad : 1;
        return tnPrecioUnitario * tnCant;
    }

    return NaN;
}

function normalizarEstado(txEstado) {
    const tc = String(txEstado || '').trim();
    if (!tc) return 'Registrada';
    return tc.replace(/_/g, ' ').replace(/\s+/g, ' ').replace(/\b\w/g, (tcLetra) => tcLetra.toUpperCase());
}

function extraerFechaHora(loFila) {
    const tcUsrFecha = String(extraerValorFlexible(loFila, ['UsrFecha', 'usr_fecha']) || '').trim();
    const tcUsrHora = String(extraerValorFlexible(loFila, ['UsrHora', 'usr_hora']) || '').trim();
    if (tcUsrFecha) {
        const tcCompuesta = `${tcUsrFecha}${tcUsrHora ? ` ${tcUsrHora}` : ''}`.trim();
        const loConvertida = convertirFechaBackendALocal(tcCompuesta);
        if (loConvertida) return loConvertida;
        return { fecha: tcUsrFecha, hora: tcUsrHora || '-' };
    }

    const txFecha = extraerValorFlexible(loFila, [
        'FechaHora',
        'FechaHoraVenta',
        'FechaHoraTransaccion',
        'FechaHoraOperacion',
        'UsrFechaHora',
        'FechaVenta',
        'FechaTransaccion',
        'CreadoEn',
        'Fecha',
        'FechaRegistro',
        'CreatedAt',
        'fecha_hora_venta',
        'fecha_hora_transaccion',
    ]);
    const tcTexto = String(txFecha || '').trim();
    if (!tcTexto) return { fecha: '-', hora: '-' };

    const loConvertida = convertirFechaBackendALocal(tcTexto);
    if (loConvertida) return loConvertida;

    const tcSinZona = tcTexto.replace(/[+-]\d{2}:?\d{2}$/i, '').replace(/Z$/i, '');
    const laPartes = tcSinZona.split(/[T ]/).filter(Boolean);
    return {
        fecha: laPartes[0] || '-',
        hora: (laPartes[1] || '-').replace(/\.\d+$/, ''),
    };
}

function convertirFechaBackendALocal(txFecha) {
    const tcTexto = String(txFecha || '').trim();
    if (!tcTexto) return null;

    const tnNumerico = Number(tcTexto);
    if (Number.isFinite(tnNumerico) && tnNumerico > 0) {
        const tnMs = tnNumerico > 10_000_000_000 ? tnNumerico : tnNumerico * 1000;
        return formatearFechaHoraEnZona(new Date(tnMs), gcZonaHorariaDestino);
    }

    const tlTieneZona = /(Z|[+\-]\d{2}:?\d{2})$/i.test(tcTexto);
    if (tlTieneZona) {
        const loFecha = new Date(tcTexto);
        if (Number.isFinite(loFecha.getTime())) {
            return formatearFechaHoraEnZona(loFecha, gcZonaHorariaDestino);
        }
    }

    const loPartes = parsearFechaHoraSinZona(tcTexto);
    if (!loPartes) return null;

    const tnUtcMs = Number.isFinite(gnOffsetOrigenMinutos)
        ? construirUtcDesdePartesConOffset(loPartes, gnOffsetOrigenMinutos)
        : construirUtcDesdePartesConZona(loPartes, gcZonaHorariaOrigen);

    if (!Number.isFinite(tnUtcMs)) return null;
    return formatearFechaHoraEnZona(new Date(tnUtcMs), gcZonaHorariaDestino);
}

function parsearFechaHoraSinZona(tcTexto) {
    const tc = String(tcTexto || '').trim().replace(/\s+/g, ' ');
    if (!tc) return null;

    const loIso = tc.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2})(?::(\d{2})(?::(\d{2}))?)?)?(?:\.\d+)?$/i
    );
    if (loIso) {
        return {
            anio: Number(loIso[1]),
            mes: Number(loIso[2]),
            dia: Number(loIso[3]),
            hora: Number(loIso[4] || 0),
            minuto: Number(loIso[5] || 0),
            segundo: Number(loIso[6] || 0),
        };
    }

    const loLatino = tc.match(
        /^(\d{2})\/(\d{2})\/(\d{4})(?:[T ](\d{2})(?::(\d{2})(?::(\d{2}))?)?)?(?:\.\d+)?$/i
    );
    if (loLatino) {
        return {
            anio: Number(loLatino[3]),
            mes: Number(loLatino[2]),
            dia: Number(loLatino[1]),
            hora: Number(loLatino[4] || 0),
            minuto: Number(loLatino[5] || 0),
            segundo: Number(loLatino[6] || 0),
        };
    }

    return null;
}

function construirUtcDesdePartesConOffset(loPartes, tnOffsetMinutos) {
    const tnBaseUtc = Date.UTC(
        loPartes.anio,
        loPartes.mes - 1,
        loPartes.dia,
        loPartes.hora,
        loPartes.minuto,
        loPartes.segundo
    );
    return tnBaseUtc - (Number(tnOffsetMinutos) * 60_000);
}

function construirUtcDesdePartesConZona(loPartes, tcZona) {
    const tnBaseUtc = Date.UTC(
        loPartes.anio,
        loPartes.mes - 1,
        loPartes.dia,
        loPartes.hora,
        loPartes.minuto,
        loPartes.segundo
    );

    let tnEstimado = tnBaseUtc;
    for (let i = 0; i < 3; i += 1) {
        const tnOffset = obtenerOffsetMinutosZona(new Date(tnEstimado), tcZona);
        if (!Number.isFinite(tnOffset)) return NaN;
        const tnCorregido = tnBaseUtc - (tnOffset * 60_000);
        if (tnCorregido === tnEstimado) break;
        tnEstimado = tnCorregido;
    }
    return tnEstimado;
}

function obtenerOffsetMinutosZona(loFechaUtc, tcZona) {
    try {
        const loFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: tcZona,
            timeZoneName: 'shortOffset',
            hour: '2-digit',
        });
        const tcOffset = loFmt.formatToParts(loFechaUtc).find((loParte) => loParte.type === 'timeZoneName')?.value || '';
        const loMatch = tcOffset.match(/GMT([+\-]\d{1,2})(?::?(\d{2}))?/i);
        if (!loMatch) return NaN;

        const tnHoras = Number(loMatch[1]);
        const tnMin = Number(loMatch[2] || 0);
        const tnSigno = tnHoras < 0 ? -1 : 1;
        return (Math.abs(tnHoras) * 60 + tnMin) * tnSigno;
    } catch {
        return NaN;
    }
}

function formatearFechaHoraEnZona(loFecha, tcZona) {
    if (!loFecha || !Number.isFinite(loFecha.getTime())) return null;
    try {
        return {
            fecha: loFecha.toLocaleDateString('es-BO', { timeZone: tcZona }),
            hora: loFecha.toLocaleTimeString('es-BO', {
                timeZone: tcZona,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }),
        };
    } catch {
        return null;
    }
}

function extraerValorFlexible(loFila, laClaves) {
    const txDirecto = extraerValor(loFila, laClaves);
    if (txDirecto !== '') return txDirecto;
    if (!loFila || typeof loFila !== 'object') return '';

    const laKeys = Object.keys(loFila);
    for (const tcClave of laClaves) {
        const tcMatch = laKeys.find((tcKey) => tcKey.toLowerCase() === String(tcClave).toLowerCase());
        if (tcMatch && loFila[tcMatch] !== undefined && loFila[tcMatch] !== null && loFila[tcMatch] !== '') {
            return loFila[tcMatch];
        }
    }
    return '';
}

function formatearFechaHoraBolivia(txFecha) {
    if (txFecha === null || txFecha === undefined || txFecha === '') return null;
    const tcTexto = String(txFecha).trim();
    if (!tcTexto) return null;

    const loFecha = new Date(tcTexto);
    if (!Number.isFinite(loFecha.getTime())) return null;

    return {
        fecha: loFecha.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' }),
        hora: loFecha.toLocaleTimeString('es-BO', {
            timeZone: 'America/La_Paz',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }),
    };
}

function formatearProductos(loFila) {
    const laProductos = extraerProductosTransaccion(loFila);
    const tcDirecto = resolverNombreProducto(loFila);
    if (!laProductos.length && tcDirecto) return String(tcDirecto);
    if (!laProductos.length) return '-';
    return laProductos
        .slice(0, 3)
        .map((loProducto) => `${loProducto.nombre} x${loProducto.cantidad}`)
        .join(', ');
}

function extraerProductosTransaccion(loFila) {
    const laFuentes = [
        loFila?.Productos,
        loFila?.DetalleProductos,
        loFila?.Items,
        loFila?.Detalle,
        loFila?.detalle,
        loFila?.producto,
        loFila?.Producto,
        loFila?.ProductoDetalle,
        loFila?.DetalleVenta,
    ];

    const laResultado = [];
    laFuentes.forEach((lxFuente) => recolectarProductos(lxFuente, laResultado));
    return laResultado.filter((loProducto) => loProducto.nombre);
}

function recolectarProductos(lxFuente, laResultado) {
    if (!lxFuente) return;

    if (Array.isArray(lxFuente)) {
        lxFuente.forEach((lxItem) => recolectarProductos(lxItem, laResultado));
        return;
    }

    if (typeof lxFuente === 'string') {
        const tcNombre = lxFuente.trim();
        if (tcNombre) laResultado.push({ nombre: tcNombre, cantidad: 1 });
        return;
    }

    if (typeof lxFuente !== 'object') return;

    const tcNombre = resolverNombreProducto(lxFuente) || String(
        lxFuente.NombreProducto ??
        lxFuente.ProductoNombre ??
        lxFuente.Producto ??
        lxFuente.NombreItem ??
        lxFuente.Item ??
        lxFuente.Articulo ??
        lxFuente.Nombre ??
        lxFuente.Descripcion ??
        lxFuente.Detalle ??
        lxFuente?.Producto?.Nombre ??
        lxFuente?.Producto?.Descripcion ??
        ''
    ).trim();

    const tnCantidad = Number(
        lxFuente.Cantidad ??
        lxFuente.Cant ??
        lxFuente.Unidades ??
        lxFuente.CantidadProducto ??
        1
    );

    if (tcNombre) {
        laResultado.push({ nombre: tcNombre, cantidad: Number.isFinite(tnCantidad) ? tnCantidad : 1 });
    }

    ['Producto', 'Productos', 'Items', 'Detalle', 'detalle'].forEach((tcClave) => {
        if (lxFuente[tcClave] && lxFuente[tcClave] !== lxFuente) {
            recolectarProductos(lxFuente[tcClave], laResultado);
        }
    });
}

function resolverNombreProducto(loFila = {}) {
    const tcDirecto = String(extraerValor(loFila, [
        'NombreProducto',
        'ProductoNombre',
        'Producto',
        'DescripcionProducto',
        'DetalleProducto',
        'ProductoActual',
        'CodigoSeleccion',
    ]) || '').trim();
    if (tcDirecto && tcDirecto !== '-') {
        const tnIdDesdeTexto = Number(tcDirecto);
        if (Number.isInteger(tnIdDesdeTexto) && tnIdDesdeTexto > 0 && goContextoTableroVentas.idProductoANombre.has(tnIdDesdeTexto)) {
            return goContextoTableroVentas.idProductoANombre.get(tnIdDesdeTexto);
        }
        const tcNormalizado = tcDirecto.toUpperCase();
        if (goContextoTableroVentas.codigoProductoANombre.has(tcNormalizado)) {
            return goContextoTableroVentas.codigoProductoANombre.get(tcNormalizado);
        }
        return tcDirecto;
    }

    const tnIdProducto = extraerIdEstricto(loFila, ['IdProducto', 'ProductoId', 'Producto', 'IdProductoEmpresa', 'ProductoEmpresa']);
    if (tnIdProducto && goContextoTableroVentas.idProductoANombre.has(tnIdProducto)) {
        return goContextoTableroVentas.idProductoANombre.get(tnIdProducto);
    }

    const tcCodigo = String(extraerValor(loFila, ['CodigoProducto', 'CodigoSeleccion', 'Codigo']) || '').trim().toUpperCase();
    if (tcCodigo && goContextoTableroVentas.codigoProductoANombre.has(tcCodigo)) {
        return goContextoTableroVentas.codigoProductoANombre.get(tcCodigo);
    }

    return '';
}

function actualizarResumenTransacciones(laFilas, loKpiTransacciones, loKpiMonto, loKpiTicket) {
    const tnTotalTransacciones = Array.isArray(laFilas) ? laFilas.length : 0;
    const tnMontoTotal = (Array.isArray(laFilas) ? laFilas : []).reduce((tnAcum, loFila) => {
        const tnMonto = extraerMontoNumerico(loFila);
        return tnAcum + (Number.isFinite(tnMonto) ? tnMonto : 0);
    }, 0);
    const tnTicket = tnTotalTransacciones > 0 ? tnMontoTotal / tnTotalTransacciones : 0;

    if (loKpiTransacciones) loKpiTransacciones.textContent = String(tnTotalTransacciones);
    if (loKpiMonto) loKpiMonto.textContent = `Bs ${tnMontoTotal.toFixed(2)}`;
    if (loKpiTicket) loKpiTicket.textContent = `Bs ${tnTicket.toFixed(2)}`;
}

function extraerMontoRecibido(loFila) {
    const tnDirecto = convertirNumeroSeguro(extraerValorFlexible(loFila, [
        'MontoRecibido',
        'Recibido',
        'MontoNeto',
        'DineroEntrante',
        'monto_recibido',
        'monto_neto',
    ]));
    if (Number.isFinite(tnDirecto)) return tnDirecto;
    const tnEnviado = extraerMontoNumerico(loFila);
    return Number.isFinite(tnEnviado) ? tnEnviado : NaN;
}

function aplicarMontoDeDetalle(loFila, loBaseDetalle = {}, loOpciones = {}) {
    const tlSobrescribirConDetalle = Boolean(loOpciones?.sobrescribirConDetalle);
    const tnActual = extraerMontoNumerico(loFila);
    const tnRecibidoActual = extraerMontoRecibido(loFila);
    const tlTieneActual = montoValido(tnActual) || montoValido(tnRecibidoActual);
    if (tlTieneActual && !tlSobrescribirConDetalle) return;

    const tnMontoDetalle = convertirNumeroSeguro(
        loBaseDetalle.Monto ??
        loBaseDetalle.MontoEnviado ??
        loBaseDetalle.MontoTotal ??
        loBaseDetalle.Total ??
        loBaseDetalle.Importe ??
        loBaseDetalle.ValorTotal
    );
    const tnRecibidoDetalle = convertirNumeroSeguro(
        loBaseDetalle.MontoRecibido ??
        loBaseDetalle.MontoNeto ??
        loBaseDetalle.DineroEntrante
    );
    const tnMontoFinal = montoValido(tnMontoDetalle) ? tnMontoDetalle : NaN;
    const tnRecibidoFinal = montoValido(tnRecibidoDetalle)
        ? tnRecibidoDetalle
        : (tlSobrescribirConDetalle && montoValido(tnMontoFinal) ? tnMontoFinal : NaN);

    if (montoValido(tnMontoFinal)) {
        loFila.MontoEnviado = tnMontoFinal;
        loFila.Monto = tnMontoFinal;
        loFila.MontoTotal = tnMontoFinal;
    }
    if (montoValido(tnRecibidoFinal)) {
        loFila.MontoRecibido = tnRecibidoFinal;
    }
}

function montoValido(txMonto) {
    const tn = Number(txMonto);
    return Number.isFinite(tn) && tn > 0;
}

function convertirNumeroSeguro(txValor) {
    if (txValor === null || txValor === undefined || txValor === '') return NaN;
    if (typeof txValor === 'number') return Number.isFinite(txValor) ? txValor : NaN;
    const tc = String(txValor).trim();
    if (!tc) return NaN;
    const tnNormal = Number(tc);
    if (Number.isFinite(tnNormal)) return tnNormal;
    const tcLimpio = tc.replace(/\s+/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
    const tnLimpio = Number(tcLimpio);
    return Number.isFinite(tnLimpio) ? tnLimpio : NaN;
}

function escapeHtml(tcTexto) {
    return String(tcTexto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
