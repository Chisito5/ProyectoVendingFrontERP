import { buscar } from '../utils/dom';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/ui
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Dialogo de confirmacion reutilizable para acciones criticas.
 */
export function confirmarAccion({ titulo = 'Confirmar accion', mensaje = 'Deseas continuar?', textoConfirmar = 'Confirmar' } = {}) {
    return new Promise((resolve) => {
        const loNodo = buscar('#erp-confirm-dialog');
        if (!loNodo) {
            resolve(false);
            return;
        }

        loNodo.className = 'erp-dialogo-capa';
        loNodo.innerHTML = `
            <div class="erp-dialogo">
                <h3 class="text-base font-bold">${titulo}</h3>
                <p class="mt-2 text-sm text-slate-600">${mensaje}</p>
                <div class="mt-4 flex justify-end gap-2">
                    <button data-cancelar class="erp-btn erp-btn--secundario">Cancelar</button>
                    <button data-confirmar class="erp-btn erp-btn--primario">${textoConfirmar}</button>
                </div>
            </div>
        `;

        const limpiar = (tlConfirmado) => {
            loNodo.className = 'hidden';
            loNodo.innerHTML = '';
            resolve(tlConfirmado);
        };

        loNodo.querySelector('[data-cancelar]')?.addEventListener('click', () => limpiar(false));
        loNodo.querySelector('[data-confirmar]')?.addEventListener('click', () => limpiar(true));
        loNodo.addEventListener('click', (loEvento) => {
            if (loEvento.target === loNodo) {
                limpiar(false);
            }
        }, { once: true });
    });
}
