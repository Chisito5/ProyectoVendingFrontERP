/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: any lxDatos
 * return: array
 *
 * Convierte payload heterogeneo en arreglo para renderizado.
 */
export function convertirAArreglo(lxDatos) {
    if (Array.isArray(lxDatos)) return lxDatos;
    if (lxDatos && typeof lxDatos === 'object') {
        for (const tcClave of ['items', 'data', 'lista', 'rows']) {
            if (Array.isArray(lxDatos[tcClave])) return lxDatos[tcClave];
        }
        return [lxDatos];
    }
    return [];
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: any txValor
 * param: ?int tnDefecto
 * return: ?int
 *
 * Convierte valor a numero entero seguro.
 */
export function aEntero(txValor, tnDefecto = null) {
    const tnNumero = Number(txValor);
    return Number.isFinite(tnNumero) ? tnNumero : tnDefecto;
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/utils
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * param: object loRespuesta
 * return: object
 *
 * Extrae metadatos de paginacion con tolerancia a distintos contratos.
 */
export function extraerMetaPaginacion(loRespuesta = {}) {
    const loMeta = loRespuesta.meta ?? {};
    const loDatos = loRespuesta.datos ?? {};

    return {
        PaginaActual: Number(loMeta.PaginaActual ?? loMeta.page ?? loDatos.PaginaActual ?? loDatos.page ?? 1),
        TamanoPagina: Number(loMeta.TamanoPagina ?? loMeta.per_page ?? loDatos.TamanoPagina ?? loDatos.per_page ?? 20),
        TotalRegistros: Number(loMeta.TotalRegistros ?? loMeta.total ?? loDatos.TotalRegistros ?? loDatos.total ?? 0),
        TotalPaginas: Number(loMeta.TotalPaginas ?? loMeta.last_page ?? loDatos.TotalPaginas ?? loDatos.last_page ?? 1),
    };
}
