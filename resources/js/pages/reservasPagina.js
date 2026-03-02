import { reservaService } from '../services/reservaService';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { confirmarAccion } from '../ui/confirmacion';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa la pagina de flujo de reservas con UX robusta.
 */
export function iniciarPaginaReservas() {
    const loFormularioCrear = buscar('#form-create-reservation');
    const loBotonCrear = buscar('#btn-create-reservation');
    const loBotonConfirmar = buscar('#btn-confirm-reservation');
    const loBotonCancelar = buscar('#btn-cancel-reservation');

    const loMensajeCrear = buscar('#reservation-message');
    const loMensajeAccion = buscar('#reservation-action-message');
    const loContenedorReserva = buscar('#reservation-current');
    const loInputMotivo = buscar('#reservation-cancel-reason');

    let loReservaActual = null;
    let lnTemporizador = null;
    aplicarEmpresaMaquinaEnFormulario(loFormularioCrear, { maquina: true, empresa: false });

    loFormularioCrear?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        setBotonCargando(loBotonCrear, true, 'Creando...');

        const loPayload = Object.fromEntries(new FormData(loFormularioCrear).entries());
        loPayload.Maquina = Number(loPayload.Maquina);
        loPayload.Cantidad = Number(loPayload.Cantidad);
        loPayload.ExpiraSegundos = Number(loPayload.ExpiraSegundos);

        const loResultado = await reservaService.crear(loPayload);
        renderizarMensaje(loMensajeCrear, loResultado);

        if (loResultado.ok) {
            loReservaActual = loResultado.datos;
            actualizarReservaActual();
            habilitarAcciones(true);
            mostrarToast('Reserva creada.', 'ok');
        } else {
            mostrarToast(loResultado.mensaje || 'Error en reserva.', 'error');
        }

        setBotonCargando(loBotonCrear, false);
    });

    loBotonConfirmar?.addEventListener('click', async () => {
        if (!loReservaActual?.Reserva) {
            renderizarMensaje(loMensajeAccion, { ok: false, mensaje: 'No hay reserva para confirmar.' });
            return;
        }

        const tlConfirmado = await confirmarAccion({
            titulo: 'Confirmar reserva',
            mensaje: 'Se convertira en venta final. Deseas continuar?',
            textoConfirmar: 'Si, confirmar',
        });
        if (!tlConfirmado) return;

        setBotonCargando(loBotonConfirmar, true, 'Confirmando...');
        const loResultado = await reservaService.confirmar({ Reserva: loReservaActual.Reserva });
        renderizarMensaje(loMensajeAccion, loResultado);
        if (loResultado.ok) {
            mostrarToast('Reserva confirmada.', 'ok');
        } else {
            mostrarToast(loResultado.mensaje || 'No se pudo confirmar.', 'error');
        }
        setBotonCargando(loBotonConfirmar, false);
    });

    loBotonCancelar?.addEventListener('click', async () => {
        if (!loReservaActual?.Reserva) {
            renderizarMensaje(loMensajeAccion, { ok: false, mensaje: 'No hay reserva para cancelar.' });
            return;
        }

        const tcMotivo = loInputMotivo?.value?.trim() || 'Cancelada desde frontend';

        const tlConfirmado = await confirmarAccion({
            titulo: 'Cancelar reserva',
            mensaje: `Motivo: ${tcMotivo}. Se liberara stock reservado. Continuar?`,
            textoConfirmar: 'Si, cancelar',
        });

        if (!tlConfirmado) return;

        setBotonCargando(loBotonCancelar, true, 'Cancelando...');
        const loResultado = await reservaService.cancelar({
            Reserva: loReservaActual.Reserva,
            Motivo: tcMotivo,
        });
        renderizarMensaje(loMensajeAccion, loResultado);
        if (loResultado.ok) {
            mostrarToast('Reserva cancelada.', 'ok');
        } else {
            mostrarToast(loResultado.mensaje || 'No se pudo cancelar.', 'error');
        }
        setBotonCargando(loBotonCancelar, false);
    });

    function habilitarAcciones(tlHabilitar) {
        if (loBotonConfirmar) loBotonConfirmar.disabled = !tlHabilitar;
        if (loBotonCancelar) loBotonCancelar.disabled = !tlHabilitar;
    }

    function actualizarReservaActual() {
        if (!loReservaActual) {
            loContenedorReserva.textContent = 'Sin reserva activa en pantalla.';
            if (lnTemporizador) {
                window.clearInterval(lnTemporizador);
                lnTemporizador = null;
            }
            return;
        }

        const { Reserva, ReservaExterna, Maquina, Celda, CodigoSeleccion, Cantidad, ExpiraEn } = loReservaActual;
        loContenedorReserva.innerHTML = `
            <div class="erp-tabla-container p-3">
                <div><strong>Reserva:</strong> ${Reserva ?? '-'}</div>
                <div><strong>ReservaExterna:</strong> ${ReservaExterna ?? '-'}</div>
                <div><strong>Maquina/Celda:</strong> ${Maquina ?? '-'} / ${Celda ?? '-'}</div>
                <div><strong>Seleccion:</strong> ${CodigoSeleccion ?? '-'}</div>
                <div><strong>Cantidad:</strong> ${Cantidad ?? '-'}</div>
                <div><strong>ExpiraEn:</strong> ${ExpiraEn ?? '-'} (<span id="reserva-contador">--</span>)</div>
            </div>
        `;

        if (lnTemporizador) {
            window.clearInterval(lnTemporizador);
        }

        lnTemporizador = window.setInterval(() => {
            const loContador = buscar('#reserva-contador');
            if (!loContador) return;
            if (!ExpiraEn) {
                loContador.textContent = 'sin tiempo';
                return;
            }

            const ldObjetivo = new Date(ExpiraEn.replace(' ', 'T'));
            if (Number.isNaN(ldObjetivo.getTime())) {
                loContador.textContent = 'fecha invalida';
                return;
            }

            const lnDiferencia = ldObjetivo.getTime() - Date.now();
            if (lnDiferencia <= 0) {
                loContador.textContent = 'expirada';
                return;
            }

            loContador.textContent = `${Math.floor(lnDiferencia / 1000)}s`;
        }, 1000);
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioCrear, { maquina: true, empresa: false });
    });
}
