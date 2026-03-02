import { reposicionService } from '../services/reposicionService';
import { obtenerSesion } from '../core/sesionErp';
import { aplicarEmpresaMaquinaEnFormulario, reaccionarCambiosContexto } from '../core/contextoPagina';
import { convertirAArreglo, extraerMetaPaginacion } from '../utils/datos';
import { buscar, renderizarMensaje, setBotonCargando } from '../utils/dom';
import { iniciarCanalesTiempoReal } from '../tiempoReal/canalesErp';
import { confirmarAccion } from '../ui/confirmacion';
import { abrirDrawerDetalle } from '../ui/drawerDetalle';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { TablaPaginada } from '../ui/tablaPaginada';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 * return: void
 *
 * Inicializa la pagina de operaciones de reposicion.
 */
export function iniciarPaginaReposiciones() {
    const loFormularioCrear = buscar('#form-create-restock');
    const loFormularioDetalle = buscar('#form-restock-detail');
    const loFormularioFiltros = buscar('#form-filtros-reposicion');

    const loMensajeCrear = buscar('#restock-message');
    const loMensajeConsulta = buscar('#restock-query-message');

    const loBotonCrear = buscar('#btn-create-restock');
    const loBotonPrevalidar = buscar('#btn-prevalidar-restock');
    const loBotonListar = buscar('#btn-load-restocks');
    const loBotonFiltrar = buscar('#btn-load-restocks-machine');

    const loTabla = new TablaPaginada({
        selectorContenedor: '#restock-table',
        onCambiarPagina: async (tnPagina) => {
            if (loFormularioFiltros) {
                const loInputPagina = loFormularioFiltros.querySelector('input[name="Pagina"]');
                if (loInputPagina) loInputPagina.value = tnPagina;
            }
            await cargarListado();
        },
    });
    aplicarEmpresaMaquinaEnFormulario(loFormularioCrear, { maquina: true, empresa: false });
    aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: false });

    let loSuscriptor = { detener: () => {} };

    loBotonPrevalidar?.addEventListener('click', async () => {
        const loPayload = construirPayloadCrear();
        if (!loPayload) return;

        setBotonCargando(loBotonPrevalidar, true, 'Validando...');
        const loResultado = await reposicionService.prevalidar(loPayload);
        renderizarMensaje(loMensajeCrear, loResultado);
        if (loResultado.ok) {
            mostrarToast('Prevalidacion correcta. Puedes confirmar reposicion.', 'ok');
        }
        setBotonCargando(loBotonPrevalidar, false);
    });

    loFormularioCrear?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();

        const loPayload = construirPayloadCrear();
        if (!loPayload) return;

        const tlConfirmado = await confirmarAccion({
            titulo: 'Confirmar reposicion',
            mensaje: 'Se registrara movimiento de stock y auditoria. Deseas continuar?',
            textoConfirmar: 'Si, reposicionar',
        });

        if (!tlConfirmado) return;

        setBotonCargando(loBotonCrear, true, 'Registrando...');
        const loResultado = await reposicionService.crear(loPayload);
        renderizarMensaje(loMensajeCrear, loResultado);

        if (loResultado.ok) {
            mostrarToast('Reposicion registrada correctamente.', 'ok');
            loFormularioCrear.reset();
            await cargarListado();
        } else {
            mostrarToast(loResultado.mensaje || 'Error al registrar reposicion.', 'error');
        }

        setBotonCargando(loBotonCrear, false);
    });

    loBotonListar?.addEventListener('click', async () => {
        await cargarListado();
    });

    loBotonFiltrar?.addEventListener('click', async () => {
        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);
        if (!loFiltros.Maquina) {
            renderizarMensaje(loMensajeConsulta, { ok: false, mensaje: 'Selecciona una maquina para filtrar.' });
            return;
        }
        await cargarListado();
    });

    loFormularioDetalle?.addEventListener('submit', async (loEvento) => {
        loEvento.preventDefault();
        const loBoton = loFormularioDetalle.querySelector('button[type="submit"]');
        setBotonCargando(loBoton, true, 'Consultando...');

        const tnReposicion = Number(new FormData(loFormularioDetalle).get('reposicionId'));
        if (!tnReposicion) {
            renderizarMensaje(loMensajeConsulta, { ok: false, mensaje: 'Ingresa un Id de reposicion valido.' });
            setBotonCargando(loBoton, false);
            return;
        }

        const loResultado = await reposicionService.obtener(tnReposicion);
        renderizarMensaje(loMensajeConsulta, loResultado);
        if (loResultado.ok) {
            abrirDrawerDetalle({
                titulo: `Detalle reposicion #${tnReposicion}`,
                datos: loResultado.datos,
            });
        }

        setBotonCargando(loBoton, false);
    });

    async function cargarListado() {
        setBotonCargando(loBotonListar, true, 'Cargando...');

        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);
        const tnMaquina = loFiltros.Maquina || null;

        const loResultado = tnMaquina
            ? await reposicionService.listarPorMaquina(tnMaquina, loFiltros)
            : await reposicionService.listar(loFiltros);

        if (loResultado.ok) {
            const laDatos = convertirAArreglo(loResultado.datos?.items ?? loResultado.datos?.Rows ?? loResultado.datos);
            loTabla.renderizar(laDatos, extraerMetaPaginacion(loResultado));
        }

        renderizarMensaje(loMensajeConsulta, loResultado);
        setBotonCargando(loBotonListar, false);
    }

    function construirPayloadCrear() {
        if (!loFormularioCrear) return null;

        const loPayload = Object.fromEntries(new FormData(loFormularioCrear).entries());

        if (!loPayload.Maquina || !loPayload.CodigoSeleccion || !loPayload.Cantidad || !loPayload.ProductoEmpresa || !loPayload.Lote) {
            renderizarMensaje(loMensajeCrear, { ok: false, mensaje: 'Completa los campos obligatorios de reposicion.' });
            return null;
        }

        loPayload.Maquina = Number(loPayload.Maquina);
        loPayload.Cantidad = Number(loPayload.Cantidad);
        loPayload.UsuarioOperador = Number(loPayload.UsuarioOperador);
        loPayload.ProductoEmpresa = Number(loPayload.ProductoEmpresa);
        loPayload.Lote = Number(loPayload.Lote);

        return loPayload;
    }

    async function suscribirEventos() {
        const loSesion = obtenerSesion();
        const txEmpresa = loSesion.empresaDefault;
        const laCanales = txEmpresa ? [`empresa.${txEmpresa}`] : [];

        if (!laCanales.length) {
            return;
        }

        loSuscriptor.detener();
        loSuscriptor = await iniciarCanalesTiempoReal({
            canales: laCanales,
            eventos: ['reposicion.creada', 'stock.actualizado'],
            onEvento: (tcEvento) => {
                mostrarToast(`Evento recibido: ${tcEvento}`, 'ok', 2200);
                void cargarListado();
            },
        });
    }

    reaccionarCambiosContexto(() => {
        aplicarEmpresaMaquinaEnFormulario(loFormularioCrear, { maquina: true, empresa: false });
        aplicarEmpresaMaquinaEnFormulario(loFormularioFiltros, { maquina: true, empresa: false });
        void cargarListado();
    });

    void cargarListado();
    void suscribirEventos();
}
