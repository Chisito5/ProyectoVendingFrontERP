import { obtenerEmpresaActiva, obtenerEmpresaActivaId } from './contextoEmpresa';
import { obtenerMaquinaActiva, obtenerMaquinaActivaId } from './contextoMaquina';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/core
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * return: object
 *
 * Devuelve el contexto global activo de empresa y maquina.
 */
export function leerContextoActual() {
    return {
        empresa: obtenerEmpresaActiva(),
        empresaId: obtenerEmpresaActivaId(),
        maquina: obtenerMaquinaActiva(),
        maquinaId: obtenerMaquinaActivaId(),
    };
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/core
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * param: HTMLFormElement loFormulario
 * param: object loOpciones
 * return: void
 *
 * Aplica contexto global a campos de empresa/maquina dentro de un formulario.
 */
export function aplicarEmpresaMaquinaEnFormulario(loFormulario, loOpciones = {}) {
    if (!loFormulario) return;

    const tlEmpresa = loOpciones.empresa !== false;
    const tlMaquina = loOpciones.maquina !== false;

    if (tlEmpresa) {
        aplicarCampoContexto(loFormulario, {
            tipo: 'empresa',
            selectores: ['[name="Empresa"]', '[name="IdEmpresa"]', '[name="empresa"]', '[name="idEmpresa"]'],
            id: leerContextoActual().empresaId,
            nombre: leerContextoActual().empresa?.nombre || 'Todas las empresas',
        });
    }

    if (tlMaquina) {
        aplicarCampoContexto(loFormulario, {
            tipo: 'maquina',
            selectores: ['[name="Maquina"]', '[name="IdMaquina"]', '[name="maquina"]', '[name="idMaquina"]'],
            id: leerContextoActual().maquinaId,
            nombre: leerContextoActual().maquina?.nombre || 'Todas las maquinas',
        });
    }
}

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/core
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * param: Function fnCallback
 * return: Function
 *
 * Suscribe callback a cambios de contexto global.
 */
export function reaccionarCambiosContexto(fnCallback) {
    if (typeof fnCallback !== 'function') {
        return () => {};
    }

    const fnHandler = () => fnCallback(leerContextoActual());
    window.addEventListener('erp:empresa-activa', fnHandler);
    window.addEventListener('erp:maquina-activa', fnHandler);

    return () => {
        window.removeEventListener('erp:empresa-activa', fnHandler);
        window.removeEventListener('erp:maquina-activa', fnHandler);
    };
}

function aplicarCampoContexto(loFormulario, loConfiguracion) {
    const { tipo, selectores, id, nombre } = loConfiguracion;
    const loCampo = loFormulario.querySelector(selectores.join(','));
    if (!loCampo) return;
    if (loCampo.dataset.permitirContextoLocal === 'si') return;

    const tcClave = `${tipo}:${loCampo.name || loCampo.id || tipo}`;
    const loOculto = obtenerOCrearInputOculto(loFormulario, loCampo, tcClave);
    const loVisual = obtenerOCrearInputVisual(loFormulario, loCampo, tcClave);

    loOculto.value = id ? String(id) : '';
    loVisual.value = `${capitalizar(tipo)}: ${nombre}`;

    loCampo.classList.add('hidden');
    loCampo.setAttribute('aria-hidden', 'true');
    loCampo.disabled = true;
}

function obtenerOCrearInputOculto(loFormulario, loCampoOriginal, tcClave) {
    let loInput = loFormulario.querySelector(`input[type="hidden"][data-contexto-hidden="${tcClave}"]`);
    if (!loInput) {
        loInput = document.createElement('input');
        loInput.type = 'hidden';
        loInput.name = loCampoOriginal.name || loCampoOriginal.id;
        loInput.dataset.contextoHidden = tcClave;
        loCampoOriginal.insertAdjacentElement('afterend', loInput);
    }
    return loInput;
}

function obtenerOCrearInputVisual(loFormulario, loCampoOriginal, tcClave) {
    let loInput = loFormulario.querySelector(`input[data-contexto-label="${tcClave}"]`);
    if (!loInput) {
        loInput = document.createElement('input');
        loInput.type = 'text';
        loInput.readOnly = true;
        loInput.className = 'erp-input';
        loInput.dataset.contextoLabel = tcClave;
        loCampoOriginal.insertAdjacentElement('afterend', loInput);
    }
    return loInput;
}

function capitalizar(tcValor) {
    const tcTexto = String(tcValor ?? '');
    if (!tcTexto.length) return '';
    return `${tcTexto[0].toUpperCase()}${tcTexto.slice(1)}`;
}
