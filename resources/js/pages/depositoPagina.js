import { depositoService } from '../services/depositoService';
import { loteService } from '../services/loteService';
import { productoService } from '../services/productoService';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { toArray } from '../utils/tableroAdaptadores';
import { buscar, renderizarMensaje, renderizarTablaDatos, setBotonCargando } from '../utils/dom';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa operacion de deposito y transferencia a maquina.
 */
export function iniciarPaginaDeposito() {
    const loFormularioFiltros = buscar('#form-deposito-filtros');
    const loFormularioEntrada = buscar('#form-deposito-entrada');
    const loFormularioSalida = buscar('#form-deposito-salida');
    const loFormularioTransferencia = buscar('#form-deposito-transferencia');

    const loMensaje = buscar('#deposito-mensaje');
    const loStockTabla = buscar('#deposito-stock-tabla');
    const loMovimientosTabla = buscar('#deposito-movimientos-tabla');

    buscar('#btn-deposito-cargar')?.addEventListener('click', async () => {
        await cargarTableros();
    });

    aplicarEmpresaMaquinaEnFormulario(loFormularioTransferencia, { maquina: true, empresa: false });

    loFormularioEntrada?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        await registrarOperacion(loFormularioEntrada, depositoService.entrada, 'Entrada registrada.');
    });

    loFormularioSalida?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        await registrarOperacion(loFormularioSalida, depositoService.salida, 'Salida registrada.');
    });

    loFormularioTransferencia?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        await registrarOperacion(loFormularioTransferencia, depositoService.transferirAMaquina, 'Transferencia registrada.');
    });

    async function cargarCatalogos() {
        const [loDepositos, loProductos, loLotes] = await Promise.all([
            depositoService.listar({ Pagina: 1, TamanoPagina: 200 }),
            productoService.listar({ Pagina: 1, TamanoPagina: 200 }),
            loteService.listar({ Pagina: 1, TamanoPagina: 200 }),
        ]);

        if (loDepositos.ok) {
            const laDepositos = toArray(loDepositos.datos?.items ?? loDepositos.datos);
            const tcOpciones = `<option value="">Seleccione deposito...</option>${laDepositos.map((loDeposito) => {
                const tnId = loDeposito.IdDeposito ?? loDeposito.Deposito ?? loDeposito.id;
                const tcNombre = loDeposito.NombreDeposito ?? loDeposito.Nombre ?? `Deposito ${tnId}`;
                return `<option value="${tnId}">${tcNombre}</option>`;
            }).join('')}`;

            loFormularioFiltros.querySelector('#deposito-select').innerHTML = tcOpciones;
            loFormularioEntrada.querySelector('select[name="Deposito"]').innerHTML = tcOpciones;
            loFormularioSalida.querySelector('select[name="Deposito"]').innerHTML = tcOpciones;
            loFormularioTransferencia.querySelector('select[name="Deposito"]').innerHTML = tcOpciones;
        }

        if (loProductos.ok) {
            const laProductos = toArray(loProductos.datos?.items ?? loProductos.datos);
            const tcOpciones = `<option value="">Seleccione producto...</option>${laProductos.map((loProducto) => {
                const tnId = loProducto.IdProducto ?? loProducto.Producto ?? loProducto.id;
                const tcNombre = loProducto.NombreProducto ?? loProducto.ProductoNombre ?? loProducto.Nombre ?? `Producto ${tnId}`;
                return `<option value="${tnId}">${tcNombre}</option>`;
            }).join('')}`;

            document.querySelectorAll('.deposito-producto').forEach((loNodo) => {
                loNodo.innerHTML = tcOpciones;
            });
        }

        if (loLotes.ok) {
            const laLotes = toArray(loLotes.datos?.items ?? loLotes.datos);
            const tcOpciones = `<option value="">Seleccione lote...</option>${laLotes.map((loLote) => {
                const tnId = loLote.IdLote ?? loLote.Lote ?? loLote.id;
                const tcNombre = loLote.CodigoLote ?? loLote.NombreLote ?? `Lote ${tnId}`;
                return `<option value="${tnId}">${tcNombre}</option>`;
            }).join('')}`;

            document.querySelectorAll('.deposito-lote').forEach((loNodo) => {
                loNodo.innerHTML = tcOpciones;
            });
        }
    }

    async function cargarTableros() {
        const loFiltros = Object.fromEntries(new FormData(loFormularioFiltros).entries());
        const tnDeposito = Number(loFiltros.Deposito || 0);

        if (!tnDeposito) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione un deposito para consultar stock.' });
            return;
        }

        const [loStock, loMovimientos] = await Promise.all([
            depositoService.stock(tnDeposito, loFiltros),
            depositoService.movimientos(loFiltros),
        ]);

        if (loStock.ok) {
            renderizarTablaDatos(loStockTabla, toArray(loStock.datos?.items ?? loStock.datos), {
                columnas: [
                    { clave: 'Deposito', etiqueta: 'Deposito' },
                    { clave: 'Producto', etiqueta: 'Producto' },
                    { clave: 'Lote', etiqueta: 'Lote' },
                    { clave: 'CantidadDisponible', etiqueta: 'Disponible' },
                    { clave: 'CantidadReservada', etiqueta: 'Reservada' },
                    { clave: 'Version', etiqueta: 'Version' },
                ],
            });
        }

        if (loMovimientos.ok) {
            renderizarTablaDatos(loMovimientosTabla, toArray(loMovimientos.datos?.items ?? loMovimientos.datos), {
                columnas: [
                    { clave: 'IdMovimiento', etiqueta: 'Movimiento' },
                    { clave: 'Tipo', etiqueta: 'Tipo' },
                    { clave: 'Deposito', etiqueta: 'Deposito' },
                    { clave: 'Producto', etiqueta: 'Producto' },
                    { clave: 'Lote', etiqueta: 'Lote' },
                    { clave: 'Cantidad', etiqueta: 'Cantidad' },
                    { clave: 'Fecha', etiqueta: 'Fecha' },
                ],
            });
        }

        const loResultadoPrincipal = !loStock.ok ? loStock : (!loMovimientos.ok ? loMovimientos : loStock);
        renderizarMensaje(loMensaje, loResultadoPrincipal);
    }

    async function registrarOperacion(loFormulario, fnOperacion, tcMensajeExito) {
        const loBoton = loFormulario.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Procesando...');

        const loPayload = Object.fromEntries(new FormData(loFormulario).entries());
        const loResultado = await fnOperacion(loPayload);
        renderizarMensaje(loMensaje, loResultado);

        if (loResultado.ok) {
            mostrarToast(tcMensajeExito, 'ok');
            await cargarTableros();
        }

        setBotonCargando(loBoton, false);
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioTransferencia, { maquina: true, empresa: false });
    });

    void cargarCatalogos().then(() => cargarTableros());
}
