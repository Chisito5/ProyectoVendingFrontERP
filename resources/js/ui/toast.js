import { buscar } from '../utils/dom';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/ui
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Gestion visual de notificaciones toast.
 */
export function mostrarToast(tcMensaje, tcTipo = 'ok', tnTiempoMs = 3200) {
    const loContenedor = buscar('#erp-toast-container');
    if (!loContenedor) return;

    const loToast = document.createElement('article');
    loToast.className = `erp-toast ${tcTipo === 'error' ? 'erp-toast--error' : 'erp-toast--ok'}`;
    loToast.innerHTML = `<strong>${tcTipo === 'error' ? 'Error' : 'OK'}</strong><div class="mt-1">${escaparHtml(tcMensaje)}</div>`;

    loContenedor.appendChild(loToast);

    window.setTimeout(() => {
        loToast.remove();
    }, tnTiempoMs);
}

function escaparHtml(tcTexto) {
    return String(tcTexto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
