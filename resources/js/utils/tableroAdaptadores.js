/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * Adaptadores para normalizar payloads del tablero ejecutivo y analitica.
 */

export function mapearResumenEjecutivo(loDatos = {}) {
    return {
        TotalMaquinas: aNumero(loDatos.TotalMaquinas ?? loDatos.total_maquinas),
        MaquinasActivas: aNumero(loDatos.MaquinasActivas ?? loDatos.maquinas_activas),
        MaquinasConAlerta: aNumero(loDatos.MaquinasConAlerta ?? loDatos.maquinas_con_alerta),
        VentasTotal: aNumero(loDatos.VentasTotal ?? loDatos.ventas_total),
        IngresosTotal: aNumero(loDatos.IngresosTotal ?? loDatos.ingresos_total),
        MaquinaTopVentas: textoSeguro(
            loDatos.MaquinaTopVentas?.CodigoMaquina ??
            loDatos.MaquinaTopVentas?.NombreMaquina ??
            loDatos.MaquinaTopVentas
        ),
        ProductoTopGlobal: textoSeguro(
            loDatos.ProductoTopGlobal?.NombreProducto ??
            loDatos.ProductoTopGlobal?.Producto ??
            loDatos.ProductoTopGlobal
        ),
    };
}

export function mapearMaquinaEjecutiva(loMaquina = {}) {
    const txResponsables = normalizarResponsables(loMaquina.Responsables);
    const txUbicacion = normalizarUbicacion(loMaquina.Ubicacion);

    return {
        IdMaquina: aNumero(loMaquina.IdMaquina ?? loMaquina.Maquina ?? loMaquina.id),
        CodigoMaquina: textoSeguro(loMaquina.CodigoMaquina ?? loMaquina.Codigo),
        NombreMaquina: textoSeguro(loMaquina.NombreMaquina ?? loMaquina.Nombre),
        TipoMaquina: textoSeguro(loMaquina.TipoMaquina ?? loMaquina.Tipo),
        EstadoMaquina: textoSeguro(loMaquina.EstadoMaquina ?? loMaquina.Estado),
        EstadoOperativo: textoSeguro(loMaquina.EstadoOperativo),
        ConsumoKwhMensual: aNumero(loMaquina.ConsumoKwhMensual, NaN),
        TipoInternet: textoSeguro(
            loMaquina.NombreTipoInternet ??
            loMaquina.TipoInternet ??
            loMaquina.CodigoTipoInternet
        ),
        TipoLugarInstalacion: textoSeguro(
            loMaquina.NombreTipoLugar ??
            loMaquina.TipoLugarInstalacion ??
            loMaquina.CodigoTipoLugar
        ),
        Ubicacion: txUbicacion,
        Responsables: txResponsables,
        VentasPeriodo: aNumero(loMaquina.VentasPeriodo),
        IngresosPeriodo: aNumero(loMaquina.IngresosPeriodo),
        ProductoEstrella: textoSeguro(
            loMaquina.ProductoEstrella?.NombreProducto ??
            loMaquina.ProductoEstrella?.Producto ??
            loMaquina.ProductoEstrella
        ),
        Alertas: aNumero(loMaquina.Alertas ?? loMaquina.AlertasActivas),
        Version: textoSeguro(loMaquina.Version),
        UsrFecha: textoSeguro(loMaquina.UsrFecha),
        UsrHora: textoSeguro(loMaquina.UsrHora),
        raw: loMaquina,
    };
}

export function mapearPuntoMapa(loPunto = {}) {
    const tnLatitud = aNumeroFlexible(
        loPunto.Latitud ??
        loPunto.lat ??
        loPunto.latitude ??
        loPunto.Lat ??
        loPunto.GpsLatitud ??
        loPunto.LatitudGps ??
        loPunto.Ubicacion?.Latitud ??
        loPunto.Ubicacion?.lat ??
        loPunto.Coordenadas?.Latitud ??
        loPunto.Coordenadas?.lat
    );
    const tnLongitud = aNumeroFlexible(
        loPunto.Longitud ??
        loPunto.lng ??
        loPunto.longitude ??
        loPunto.Lon ??
        loPunto.GpsLongitud ??
        loPunto.LongitudGps ??
        loPunto.Ubicacion?.Longitud ??
        loPunto.Ubicacion?.lng ??
        loPunto.Coordenadas?.Longitud ??
        loPunto.Coordenadas?.lng
    );

    const tlCoordenadasValidas = Number.isFinite(tnLatitud)
        && Number.isFinite(tnLongitud)
        && Math.abs(tnLatitud) <= 90
        && Math.abs(tnLongitud) <= 180;

    return {
        IdMaquina: aNumero(loPunto.IdMaquina ?? loPunto.Maquina ?? loPunto.id),
        CodigoMaquina: textoSeguro(loPunto.CodigoMaquina ?? loPunto.Codigo),
        Latitud: tnLatitud,
        Longitud: tnLongitud,
        EstadoOperativo: textoSeguro(loPunto.EstadoOperativo),
        NivelAlerta: textoSeguro(loPunto.NivelAlerta ?? loPunto.Alerta),
        IngresosPeriodo: aNumero(loPunto.IngresosPeriodo),
        VentasPeriodo: aNumero(loPunto.VentasPeriodo),
        tieneCoordenadas: tlCoordenadasValidas,
        raw: loPunto,
    };
}

export function mapearRanking(loFila = {}) {
    return {
        IdMaquina: aNumero(loFila.IdMaquina ?? loFila.Maquina ?? loFila.id),
        CodigoMaquina: textoSeguro(loFila.CodigoMaquina ?? loFila.Codigo),
        NombreMaquina: textoSeguro(loFila.NombreMaquina ?? loFila.Nombre),
        Valor: aNumero(loFila.Valor),
        raw: loFila,
    };
}

export function mapearDetalleMaquina(loDatos = {}) {
    return {
        Maquina: loDatos.Maquina ?? {},
        Responsables: loDatos.Responsables ?? [],
        VentasResumen: loDatos.VentasResumen ?? {},
        ProductoEstrella: loDatos.ProductoEstrella ?? {},
        TopProductos: toArray(loDatos.TopProductos),
        AlertasActivas: toArray(loDatos.AlertasActivas),
        VentasPorDia: toArray(loDatos.VentasPorDia),
        MermasResumen: loDatos.MermasResumen ?? {},
        UltimosMovimientosStock: toArray(loDatos.UltimosMovimientosStock),
        Alertas: toArray(loDatos.Alertas),
    };
}

export function mapearCasillaTablero(loCasilla = {}) {
    return {
        IdMaquina: aNumero(loCasilla.IdMaquina ?? loCasilla.Maquina ?? loCasilla.id_maquina),
        Maquina: textoSeguro(loCasilla.CodigoMaquina ?? loCasilla.MaquinaNombre ?? loCasilla.Maquina),
        Casilla: textoSeguro(loCasilla.NumeroCasilla ?? loCasilla.Casilla ?? loCasilla.SlotNumber),
        Producto: textoSeguro(
            loCasilla.NombreProducto ??
            loCasilla.ProductoNombre ??
            loCasilla.Producto ??
            loCasilla.IdProducto
        ),
        StockActual: aNumero(loCasilla.StockActual ?? loCasilla.stock_actual),
        StockMaximo: aNumero(loCasilla.StockMaximo ?? loCasilla.stock_maximo),
        Lote: textoSeguro(loCasilla.CodigoLote ?? loCasilla.Lote ?? loCasilla.lote),
        FechaCaducidad: textoSeguro(loCasilla.FechaCaducidad ?? loCasilla.fecha_caducidad),
        FechaProyectadaSoldOut: textoSeguro(
            loCasilla.FechaProyectadaSoldOut ??
            loCasilla.FechaSoldOut ??
            loCasilla.fecha_soldout
        ),
        PrioridadABC: textoSeguro(loCasilla.PrioridadABC ?? loCasilla.StockABC ?? loCasilla.stock_abc),
        EsStockFugaz: normalizarBooleano(loCasilla.EsStockFugaz ?? loCasilla.StockFugaz ?? loCasilla.stock_fugaz),
        CostoUnitario: aNumero(loCasilla.CostoUnitario ?? loCasilla.Costo ?? loCasilla.costos, NaN),
        PrecioUnitario: aNumero(loCasilla.PrecioUnitario ?? loCasilla.Precio ?? loCasilla.precios, NaN),
        AlertaStockBajo: normalizarBooleano(
            loCasilla.AlertaStockBajo ??
            loCasilla.StockMenorAlerta ??
            loCasilla['stock<=x_alert']
        ),
        raw: loCasilla,
    };
}

export function mapearHistorialReposicionTablero(loEvento = {}) {
    return {
        IdReposicion: aNumero(loEvento.IdReposicion ?? loEvento.Reposicion ?? loEvento.id),
        FechaReposicion: textoSeguro(
            loEvento.FechaReposicion ??
            loEvento.Fecha ??
            [loEvento.UsrFecha, loEvento.UsrHora].filter(Boolean).join(' ')
        ),
        Maquina: textoSeguro(
            loEvento.CodigoMaquina ??
            loEvento.MaquinaNombre ??
            loEvento.Maquina
        ),
        Casilla: textoSeguro(loEvento.NumeroCasilla ?? loEvento.Celda ?? loEvento.slot_number),
        Reponedor: textoSeguro(
            loEvento.UsuarioReponedor ??
            loEvento.Reponedor ??
            loEvento.NombreUsuario ??
            loEvento.Usr
        ),
        CantidadAntes: aNumero(loEvento.CantidadAntes),
        CantidadRecargada: aNumero(loEvento.CantidadRecargada ?? loEvento.CantidadDelta ?? loEvento.Cantidad),
        CantidadDespues: aNumero(loEvento.CantidadDespues),
        Lote: textoSeguro(loEvento.CodigoLote ?? loEvento.Lote),
        Motivo: textoSeguro(loEvento.Motivo),
        raw: loEvento,
    };
}

export function mapearResultadoAnalitica(loDatos = {}) {
    if (Array.isArray(loDatos)) {
        return {
            resumen: { Registros: loDatos.length },
            filas: loDatos,
        };
    }

    const laFilas = toArray(loDatos.items ?? loDatos.data ?? loDatos.lista ?? loDatos.rows ?? loDatos.resultados);
    const loResumen = loDatos.Resumen ?? loDatos.resumen ?? {};

    if (laFilas.length > 0) {
        return {
            resumen: {
                ...loResumen,
                Registros: laFilas.length,
            },
            filas: laFilas,
        };
    }

    if (typeof loDatos === 'object' && Object.keys(loDatos).length > 0) {
        return {
            resumen: loResumen,
            filas: [loDatos],
        };
    }

    return {
        resumen: loResumen,
        filas: [],
    };
}

export function toArray(lxValor) {
    if (Array.isArray(lxValor)) return lxValor;
    if (!lxValor || typeof lxValor !== 'object') return [];
    return [lxValor];
}

export function extraerFilasBloque(lxBloque) {
    if (Array.isArray(lxBloque)) return lxBloque;
    if (!lxBloque || typeof lxBloque !== 'object') return [];
    return toArray(lxBloque.Rows ?? lxBloque.rows ?? lxBloque.items ?? lxBloque.data ?? lxBloque.lista ?? lxBloque.resultados ?? lxBloque);
}

export function extraerMetaBloque(lxBloque) {
    if (!lxBloque || typeof lxBloque !== 'object') return {};
    return lxBloque.Meta ?? lxBloque.meta ?? {};
}

function normalizarResponsables(lxValor) {
    const laValores = toArray(lxValor).flatMap((loItem) => {
        if (typeof loItem === 'string') return [loItem];
        if (!loItem || typeof loItem !== 'object') return [];
        return [loItem.NombreUsuario, loItem.Nombres, loItem.Nombre, loItem.Usuario]
            .filter(Boolean)
            .map((txValor) => String(txValor));
    });
    return laValores.length ? laValores.join(', ') : 'Sin responsables';
}

function normalizarUbicacion(lxValor) {
    if (!lxValor) return 'Sin ubicacion';
    if (typeof lxValor === 'string') return lxValor;
    if (typeof lxValor !== 'object') return String(lxValor);

    return textoSeguro(
        lxValor.Direccion ??
        lxValor.Nombre ??
        lxValor.Ubicacion ??
        `${lxValor.Latitud ?? ''}, ${lxValor.Longitud ?? ''}`.trim()
    );
}

function textoSeguro(lxValor, tcDefecto = 'N/D') {
    if (lxValor === null || lxValor === undefined || lxValor === '') return tcDefecto;
    return String(lxValor);
}

function aNumero(lxValor, tnDefecto = 0) {
    const tnNumero = Number(lxValor);
    return Number.isFinite(tnNumero) ? tnNumero : tnDefecto;
}

function aNumeroFlexible(lxValor, tnDefecto = NaN) {
    if (lxValor === null || lxValor === undefined || lxValor === '') {
        return tnDefecto;
    }

    if (typeof lxValor === 'number') {
        return Number.isFinite(lxValor) ? lxValor : tnDefecto;
    }

    const tcTexto = String(lxValor).trim();
    if (!tcTexto) return tnDefecto;

    const tnDirecto = Number(tcTexto);
    if (Number.isFinite(tnDirecto)) {
        return tnDirecto;
    }

    const tcNormalizado = tcTexto
        .replace(/\s+/g, '')
        .replace(/\.(?=\d{3}(?:\D|$))/g, '')
        .replace(',', '.');

    const tnNormalizado = Number(tcNormalizado);
    return Number.isFinite(tnNormalizado) ? tnNormalizado : tnDefecto;
}

function normalizarBooleano(lxValor) {
    if (typeof lxValor === 'boolean') return lxValor ? 'Si' : 'No';
    const tcValor = String(lxValor ?? '').trim().toLowerCase();
    if (!tcValor) return 'N/D';
    if (['1', 'si', 'sí', 'true', 'activo', 'encendido', 'alto'].includes(tcValor)) return 'Si';
    if (['0', 'no', 'false', 'inactivo', 'apagado', 'bajo'].includes(tcValor)) return 'No';
    return textoSeguro(lxValor);
}
