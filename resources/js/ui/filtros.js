/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/ui
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Utilitario para extraer filtros de formularios.
 */
export function obtenerFiltrosDeFormulario(loFormulario) {
    if (!loFormulario) return {};

    const loDatos = Object.fromEntries(new FormData(loFormulario).entries());

    return Object.fromEntries(
        Object.entries(loDatos).filter(([, txValor]) => txValor !== null && String(txValor).trim() !== '')
    );
}
