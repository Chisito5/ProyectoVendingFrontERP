import { maquinaService } from '../services/maquinaService';
import { celdaService } from '../services/celdaService';
import { loteService } from '../services/loteService';
import { maquinaCeldasService } from '../services/maquinaCeldasService';
import { productoService } from '../services/productoService';
import { catalogoService } from '../services/catalogoService';
import { ubicacionMaquinaService } from '../services/ubicacionMaquinaService';
import { obtenerMaquinaActiva, obtenerMaquinaActivaId } from '../core/contextoMaquina';
import { toArray } from '../utils/tableroAdaptadores';
import { convertirAArreglo } from '../utils/datos';
import { buscar, renderizarMensaje, renderizarTablaDatos, setBotonCargando } from '../utils/dom';
import { obtenerFiltrosDeFormulario } from '../ui/filtros';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 02-03-2026
 * return: void
 *
 * Pantalla de maquinas/celdas con UX por subvista y modal operativo por celda.
 */
export function iniciarPaginaMaquinasCeldas() {
    const loFormularioFiltros = buscar('#form-celdas-filtros');
    const loFormularioAsignacion = buscar('#form-celdas-asignacion');
    const loFormularioMaquina = buscar('#form-maquina-editar');
    const loInputMaquina = buscar('#celdas-maquina');
    const loInputMaquinaLabel = buscar('#celdas-maquina-label');
    const loSelectProducto = buscar('#celdas-producto');
    const loSelectLote = buscar('#celdas-lote');
    const loSelectTipoInternet = buscar('#maquina-tipo-internet');
    const loSelectTipoLugar = buscar('#maquina-tipo-lugar');
    const loMensaje = buscar('#celdas-mensaje');
    const loMatriz = buscar('#celdas-matriz');
    const loSimulacion = buscar('#celdas-simulacion');
    const loConflictos = buscar('#celdas-conflictos');
    const loDetalleMaquina = buscar('#maquina-detalle');
    const loUbicacionMaquina = buscar('#maquina-ubicacion');
    const loFormularioFotosMaquina = buscar('#form-maquina-fotos');
    const loInputFotosArchivo = buscar('input[name="FotosArchivo"]');
    const loFotosMaquinaLista = buscar('#maquina-fotos-lista');
    const loFotosMaquinaMensaje = buscar('#maquina-fotos-mensaje');
    const loFotosMaquinaPreview = buscar('#maquina-fotos-preview');
    const loModalCelda = buscar('#modal-celda');
    const loModalMaquina = buscar('#modal-maquina');

    const loEstado = {
        vista: new URLSearchParams(window.location.search).get('vista') || 'maquinas',
        maquina: null,
        maquinaDetalle: null,
        maquinaUbicacion: null,
        maquinaFotos: [],
        celdas: [],
        simulacion: null,
        celdaActiva: null,
    };
    let lnTimerCargaMatriz = null;
    let lnSecuenciaMatriz = 0;

    buscar('#btn-celdas-conflictos')?.addEventListener('click', async () => {
        await cargarConflictos();
    });
    buscar('#btn-celdas-simular')?.addEventListener('click', async () => {
        await simularOcupacion();
    });
    buscar('#btn-celdas-asignar')?.addEventListener('click', async () => {
        await asignarProducto();
    });
    buscar('#btn-celdas-liberar')?.addEventListener('click', async () => {
        await liberarCeldas();
    });
    buscar('#btn-celda-modal-cerrar')?.addEventListener('click', () => abrirModalCelda(false));

    buscar('#btn-maquina-editar')?.addEventListener('click', () => abrirModalMaquina(true));
    buscar('#btn-maquina-modal-cerrar')?.addEventListener('click', () => abrirModalMaquina(false));
    buscar('#btn-maquina-guardar')?.addEventListener('click', async () => {
        await guardarMaquina();
    });
    buscar('#btn-maquina-fotos-subir')?.addEventListener('click', async () => {
        await subirFotosMaquina();
    });
    loFotosMaquinaLista?.addEventListener('click', async (loEvento) => {
        const loBoton = loEvento.target.closest('[data-foto-eliminar]');
        if (!loBoton) return;
        const tnFoto = Number(loBoton.getAttribute('data-foto-eliminar') || 0);
        if (!tnFoto) return;
        await eliminarFotoMaquina(tnFoto);
    });
    loInputFotosArchivo?.addEventListener('change', () => {
        pintarPreviewArchivosSeleccionados(loInputFotosArchivo.files);
    });
    pintarPreviewArchivosSeleccionados([]);

    loFormularioFiltros?.addEventListener('input', (loEvento) => {
        const loObjetivo = loEvento.target;
        if (!loObjetivo || loObjetivo.name === 'Maquina') return;
        programarCargaMatriz();
    });
    loFormularioFiltros?.addEventListener('change', (loEvento) => {
        const loObjetivo = loEvento.target;
        if (!loObjetivo || loObjetivo.name === 'Maquina') return;
        programarCargaMatriz();
    });

    window.addEventListener('erp:empresa-activa', async () => {
        loEstado.maquina = null;
        loEstado.maquinaDetalle = null;
        loEstado.maquinaUbicacion = null;
        loEstado.maquinaFotos = [];
        loEstado.celdas = [];
        loEstado.celdaActiva = null;
        if (loInputMaquina) loInputMaquina.value = '';
        if (loInputMaquinaLabel) loInputMaquinaLabel.value = 'Maquina: todas (header)';
        limpiarVistaMaquina();
        loMatriz.innerHTML = '';
        loConflictos.innerHTML = '';
        await cargarCatalogos();
    });

    window.addEventListener('erp:maquina-activa', async () => {
        aplicarContextoMaquinaEnFormulario();
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            limpiarVistaMaquina();
            loMatriz.innerHTML = '';
            loConflictos.innerHTML = '';
            return;
        }

        loEstado.maquina = tnMaquina;
        if (loEstado.vista === 'maquinas') {
            await cargarDetalleMaquina();
            return;
        }
        await cargarMatriz();
    });

    async function cargarCatalogos() {
        const [loProductos, loLotes, loTiposInternet, loTiposLugar] = await Promise.all([
            productoService.listar({ Pagina: 1, TamanoPagina: 200 }),
            loteService.listar({ Pagina: 1, TamanoPagina: 200 }),
            catalogoService.listarTiposInternet(),
            catalogoService.listarTiposLugarInstalacion(),
        ]);

        if (loProductos.ok && loSelectProducto) {
            const laProductos = normalizarColeccion(loProductos.datos);
            loSelectProducto.innerHTML = `<option value="">Seleccione producto...</option>${laProductos.map((loProducto) => {
                const tnId = loProducto.IdProducto ?? loProducto.Producto ?? loProducto.id;
                const tcNombre = loProducto.NombreProducto ?? loProducto.ProductoNombre ?? loProducto.Nombre ?? `Producto ${tnId}`;
                return `<option value="${tnId}">${tcNombre}</option>`;
            }).join('')}`;
        } else {
            renderizarMensaje(loMensaje, loProductos);
        }

        if (loLotes.ok && loSelectLote) {
            const laLotes = normalizarColeccion(loLotes.datos);
            loSelectLote.innerHTML = `<option value="">Seleccione lote...</option>${laLotes.map((loLote) => {
                const tnId = loLote.IdLote ?? loLote.Lote ?? loLote.id;
                const tcNombre = loLote.CodigoLote ?? loLote.NombreLote ?? `Lote ${tnId}`;
                return `<option value="${tnId}">${tcNombre}</option>`;
            }).join('')}`;
        } else {
            renderizarMensaje(loMensaje, loLotes);
        }

        if (loTiposInternet.ok && loSelectTipoInternet) {
            const laTiposInternet = normalizarColeccion(loTiposInternet.datos);
            loSelectTipoInternet.innerHTML = `<option value="">Seleccione tipo internet...</option>${laTiposInternet.map((loTipo) => {
                const txValor = loTipo.TipoInternet ?? loTipo.IdTipoInternet ?? loTipo.CodigoTipoInternet ?? loTipo.Codigo ?? loTipo.id;
                const tcNombre = loTipo.NombreTipoInternet ?? loTipo.Nombre ?? loTipo.Descripcion ?? `Tipo ${txValor}`;
                return `<option value="${txValor}">${tcNombre}</option>`;
            }).join('')}`;
        }

        if (loTiposLugar.ok && loSelectTipoLugar) {
            const laTiposLugar = normalizarColeccion(loTiposLugar.datos);
            loSelectTipoLugar.innerHTML = `<option value="">Seleccione tipo lugar...</option>${laTiposLugar.map((loTipo) => {
                const txValor = loTipo.TipoLugarInstalacion ?? loTipo.IdTipoLugarInstalacion ?? loTipo.CodigoTipoLugar ?? loTipo.Codigo ?? loTipo.id;
                const tcNombre = loTipo.NombreTipoLugar ?? loTipo.NombreTipoLugarInstalacion ?? loTipo.Nombre ?? loTipo.Descripcion ?? `Lugar ${txValor}`;
                return `<option value="${txValor}">${tcNombre}</option>`;
            }).join('')}`;
        }
    }

    async function cargarDetalleMaquina() {
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            limpiarVistaMaquina();
            return;
        }

        const loResultado = await maquinaService.obtener(tnMaquina);
        renderizarMensaje(loMensaje, loResultado);
        if (!loResultado.ok) {
            limpiarVistaMaquina();
            return;
        }

        loEstado.maquinaDetalle = loResultado.datos ?? {};
        pintarDetalleMaquina(loEstado.maquinaDetalle);
        precargarFormularioMaquina(loEstado.maquinaDetalle);
        await Promise.all([
            cargarUbicacionMaquina(tnMaquina),
            cargarFotosMaquina(tnMaquina),
        ]);
    }

    async function guardarMaquina() {
        const loBoton = buscar('#btn-maquina-guardar');
        setBotonCargando(loBoton, true, 'Guardando...');

        const loDatos = Object.fromEntries(new FormData(loFormularioMaquina).entries());
        const tnMaquina = Number(loDatos.IdMaquina || 0);
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'No hay maquina seleccionada para editar.' });
            setBotonCargando(loBoton, false);
            return;
        }
        if (!loDatos.Version || !loDatos.Motivo) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Version y motivo son obligatorios para actualizar maquina.' });
            setBotonCargando(loBoton, false);
            return;
        }

        const loPayload = {
            CodigoMaquina: loDatos.CodigoMaquina,
            NumeroSerie: loDatos.NumeroSerie,
            Marca: loDatos.Marca,
            Modelo: loDatos.Modelo,
            IdentificadorConexion: loDatos.IdentificadorConexion,
            TipoInternet: normalizarValorCatalogo(loDatos.TipoInternet),
            ConsumoKwhMensual: loDatos.ConsumoKwhMensual ? Number(loDatos.ConsumoKwhMensual) : undefined,
            TipoLugarInstalacion: normalizarValorCatalogo(loDatos.TipoLugarInstalacion),
            UbicacionActual: loDatos.UbicacionActual,
            FilasMatriz: loDatos.FilasMatriz ? Number(loDatos.FilasMatriz) : undefined,
            ColumnasMatriz: loDatos.ColumnasMatriz ? Number(loDatos.ColumnasMatriz) : undefined,
            Estado: loDatos.Estado,
            Version: loDatos.Version,
            Motivo: loDatos.Motivo,
        };

        const loResultado = await maquinaService.actualizar(tnMaquina, loPayload);
        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Maquina actualizada.', 'ok');
            abrirModalMaquina(false);
            await cargarDetalleMaquina();
        }

        setBotonCargando(loBoton, false);
    }

    async function cargarUbicacionMaquina(tnMaquina) {
        const loResultado = await ubicacionMaquinaService.obtener(tnMaquina);
        if (!loResultado.ok) {
            loEstado.maquinaUbicacion = null;
            if (loUbicacionMaquina) {
                loUbicacionMaquina.innerHTML = `<p class="text-sm text-slate-500">${escapeHtml(loResultado.mensaje || 'Sin ubicacion registrada.')}</p>`;
            }
            return;
        }

        loEstado.maquinaUbicacion = loResultado.datos ?? {};
        pintarUbicacionMaquina(loEstado.maquinaUbicacion);
    }

    async function cargarFotosMaquina(tnMaquina) {
        const loResultado = await maquinaService.listarFotos(tnMaquina, { Pagina: 1, TamanoPagina: 24 });
        renderizarMensaje(loFotosMaquinaMensaje, loResultado);
        if (!loResultado.ok) {
            loEstado.maquinaFotos = [];
            pintarFotosMaquina([]);
            return;
        }

        loEstado.maquinaFotos = normalizarColeccion(loResultado.datos);
        pintarFotosMaquina(loEstado.maquinaFotos);
    }

    async function subirFotosMaquina() {
        const tnMaquina = obtenerMaquinaContexto();
        if (!loFormularioFotosMaquina) return;
        if (!tnMaquina) {
            renderizarMensaje(loFotosMaquinaMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            return;
        }

        const loBoton = buscar('#btn-maquina-fotos-subir');
        setBotonCargando(loBoton, true, 'Subiendo...');

        const loDatos = Object.fromEntries(new FormData(loFormularioFotosMaquina).entries());
        const laUrls = String(loDatos.Urls || '')
            .split(/\r?\n|,/g)
            .map((tcUrl) => tcUrl.trim())
            .filter((tcUrl) => /^https?:\/\//i.test(tcUrl));
        const loFormOriginal = new FormData(loFormularioFotosMaquina);
        const laArchivos = loFormOriginal.getAll('FotosArchivo')
            .filter((loItem) => loItem instanceof File && loItem.size > 0);

        if (!laUrls.length && !laArchivos.length) {
            renderizarMensaje(loFotosMaquinaMensaje, { ok: false, mensaje: 'Debe cargar al menos una URL valida o seleccionar archivos.' });
            setBotonCargando(loBoton, false);
            return;
        }

        const tcMotivo = String(loDatos.Motivo || '').trim() || 'Actualizacion de galeria de maquina';

        const loPayload = new FormData();
        loPayload.append('Motivo', tcMotivo);
        laUrls.forEach((tcUrl) => {
            loPayload.append('Fotos[]', tcUrl);
        });
        if (laArchivos.length === 1) {
            loPayload.append('Archivo', laArchivos[0]);
        } else {
            laArchivos.forEach((loArchivo) => {
                loPayload.append('Archivos[]', loArchivo);
            });
        }

        const loResultado = await maquinaService.subirFotosLote(tnMaquina, loPayload);
        renderizarMensaje(loFotosMaquinaMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Fotos registradas en la maquina.', 'ok');
            loFormularioFotosMaquina?.reset();
            pintarPreviewArchivosSeleccionados([]);
            await cargarFotosMaquina(tnMaquina);
        }

        setBotonCargando(loBoton, false);
    }

    async function eliminarFotoMaquina(tnFoto) {
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            renderizarMensaje(loFotosMaquinaMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            return;
        }

        const tcMotivo = window.prompt('Motivo de eliminacion de la foto:', 'Depuracion de galeria') || '';
        if (!tcMotivo.trim()) {
            return;
        }

        const loFoto = (loEstado.maquinaFotos || []).find((loItem) => Number(
            loItem.IdMaquinaFoto ?? loItem.MaquinaFoto ?? loItem.IdFoto ?? loItem.Foto ?? loItem.id,
        ) === tnFoto);
        const loPayload = {
            Motivo: tcMotivo.trim(),
            Version: loFoto?.Version ?? undefined,
        };

        const loResultado = await maquinaService.eliminarFotoLogico(tnMaquina, tnFoto, loPayload);
        renderizarMensaje(loFotosMaquinaMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Foto eliminada correctamente.', 'ok');
            await cargarFotosMaquina(tnMaquina);
        }
    }

    async function cargarMatriz() {
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            return;
        }

        const tnSecuencia = ++lnSecuenciaMatriz;
        loEstado.maquina = tnMaquina;
        const loFiltros = obtenerFiltrosDeFormulario(loFormularioFiltros);
        const loResultado = await maquinaCeldasService.matriz(tnMaquina, loFiltros);
        if (tnSecuencia !== lnSecuenciaMatriz) {
            return;
        }
        renderizarMensaje(loMensaje, loResultado);
        if (!loResultado.ok) return;

        loEstado.celdas = normalizarCeldas(toArray(loResultado.datos?.items ?? loResultado.datos));
        pintarMatriz(loEstado.celdas);
    }

    async function cargarConflictos() {
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            return;
        }

        const loResultado = await maquinaCeldasService.conflictos(tnMaquina, { Pagina: 1, TamanoPagina: 50 });
        renderizarMensaje(loMensaje, loResultado);
        if (!loResultado.ok) return;

        const laFilas = toArray(loResultado.datos?.items ?? loResultado.datos);
        renderizarTablaDatos(loConflictos, laFilas, {
            columnas: [
                { clave: 'IdConflicto', etiqueta: 'Conflicto' },
                { clave: 'Celda', etiqueta: 'Celda' },
                { clave: 'Tipo', etiqueta: 'Tipo' },
                { clave: 'Detalle', etiqueta: 'Detalle' },
                { clave: 'Fecha', etiqueta: 'Fecha' },
            ],
        });
    }

    async function simularOcupacion() {
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            return;
        }

        const loPayload = construirPayloadAsignacion();
        const tcError = validarPayloadAsignacion(loPayload);
        if (tcError) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: tcError });
            return;
        }

        const loResultado = await maquinaCeldasService.simularOcupacion(tnMaquina, loPayload);
        if (loResultado.ok) {
            loEstado.simulacion = loResultado.datos ?? {};
            pintarSimulacion(loEstado.simulacion);
            renderizarMensaje(loMensaje, loResultado);
            return;
        }

        const loSimulacionLocal = simularLocal(loPayload);
        loEstado.simulacion = loSimulacionLocal;
        pintarSimulacion(loSimulacionLocal);
        renderizarMensaje(loMensaje, {
            ok: true,
            mensaje: 'Simulacion local aplicada (fallback).',
            errores: loSimulacionLocal.Conflictos.map((tcDetalle) => ({ Detalle: tcDetalle })),
        });
    }

    async function asignarProducto() {
        const loBoton = buscar('#btn-celdas-asignar');
        setBotonCargando(loBoton, true, 'Asignando...');
        const loResultado = await ejecutarMutacionCelda((tnMaquina, loPayload) => maquinaCeldasService.asignarProducto(tnMaquina, loPayload));
        if (loResultado?.ok) {
            mostrarToast('Asignacion confirmada.', 'ok');
            await cargarMatriz();
            await cargarConflictos();
        }
        setBotonCargando(loBoton, false);
    }

    async function liberarCeldas() {
        const loBoton = buscar('#btn-celdas-liberar');
        setBotonCargando(loBoton, true, 'Liberando...');
        const loResultado = await ejecutarEliminacionLogicaCelda();
        if (loResultado?.ok) {
            mostrarToast('Celda liberada.', 'ok');
            await cargarMatriz();
            await cargarConflictos();
            abrirModalCelda(false);
        }
        setBotonCargando(loBoton, false);
    }

    async function ejecutarEliminacionLogicaCelda() {
        const loPayload = construirPayloadAsignacion();
        if (!loPayload.CeldaAncla || loPayload.CeldaAncla < 1 || loPayload.CeldaAncla > 54) {
            const loError = { ok: false, mensaje: 'Celda ancla invalida (1 a 54).' };
            renderizarMensaje(loMensaje, loError);
            return loError;
        }
        if (!loPayload.Motivo) {
            const loError = { ok: false, mensaje: 'Motivo es obligatorio para eliminar celda.' };
            renderizarMensaje(loMensaje, loError);
            return loError;
        }

        const tnCelda = Number(loPayload.CeldaAncla);
        const loVersion = await celdaService.obtener(tnCelda);
        if (!loVersion?.ok) {
            renderizarMensaje(loMensaje, loVersion);
            return loVersion;
        }

        const loCelda = loVersion?.datos ?? {};
        const tcVersion = String(
            loCelda.Version ??
            loCelda.version ??
            ''
        ).trim();
        if (!tcVersion) {
            const loError = { ok: false, mensaje: `No se pudo obtener Version para celda ${tnCelda}.` };
            renderizarMensaje(loMensaje, loError);
            return loError;
        }

        const loResultado = await celdaService.eliminarLogico(tnCelda, {
            Version: tcVersion,
            Motivo: loPayload.Motivo,
        });
        renderizarMensaje(loMensaje, loResultado);
        return loResultado;
    }

    async function ejecutarMutacionCelda(fnMutacion) {
        const tnMaquina = obtenerMaquinaContexto();
        if (!tnMaquina) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione una maquina en el header superior.' });
            return null;
        }

        const loPayload = construirPayloadAsignacion();
        const tcError = validarPayloadAsignacion(loPayload);
        if (tcError) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: tcError });
            return null;
        }

        const loResultado = await fnMutacion(tnMaquina, loPayload);
        renderizarMensaje(loMensaje, loResultado);
        return loResultado;
    }

    function normalizarCeldas(laCeldas) {
        if (!Array.isArray(laCeldas) || !laCeldas.length) {
            return construirMatrizVacia();
        }

        const laNormalizadas = laCeldas.map((loCelda, tnIndice) => {
            const tnNumero = Number(loCelda.Celda ?? loCelda.IdCelda ?? loCelda.NumeroCelda ?? tnIndice + 1);
            const tnFila = Number(loCelda.Fila ?? Math.floor((tnNumero - 1) / 9) + 1);
            const tnColumna = Number(loCelda.Columna ?? ((tnNumero - 1) % 9) + 1);
            const tcEstado = String(loCelda.EstadoCelda ?? loCelda.Estado ?? 'DISPONIBLE').toUpperCase();
            return {
                NumeroCelda: tnNumero,
                Fila: tnFila,
                Columna: tnColumna,
                Estado: tcEstado,
                Producto: loCelda.Producto ?? loCelda.ProductoActual ?? loCelda.CodigoSeleccion ?? '',
                Stock: loCelda.CantidadDisponible ?? loCelda.Stock ?? '',
                BloqueadaPor: loCelda.BloqueadaPor ?? '',
            };
        });

        const laBase = construirMatrizVacia();
        laNormalizadas.forEach((loCelda) => {
            const tnIndice = laBase.findIndex((loItem) => loItem.NumeroCelda === loCelda.NumeroCelda);
            if (tnIndice >= 0) {
                laBase[tnIndice] = loCelda;
            }
        });
        return laBase;
    }

    function construirMatrizVacia() {
        const laSalida = [];
        let tnCelda = 1;
        for (let tnFila = 1; tnFila <= 6; tnFila += 1) {
            for (let tnColumna = 1; tnColumna <= 9; tnColumna += 1) {
                laSalida.push({
                    NumeroCelda: tnCelda,
                    Fila: tnFila,
                    Columna: tnColumna,
                    Estado: 'DISPONIBLE',
                    Producto: '',
                    Stock: '',
                    BloqueadaPor: '',
                });
                tnCelda += 1;
            }
        }
        return laSalida;
    }

    function pintarMatriz(laCeldas) {
        if (!Array.isArray(laCeldas) || !laCeldas.length) {
            loMatriz.innerHTML = '<p class="text-sm text-slate-500">Sin datos de matriz.</p>';
            return;
        }

        loMatriz.innerHTML = laCeldas.map((loCelda) => `
            <button
                type="button"
                class="erp-celda ${claseCelda(loCelda.Estado)} ${loEstado.celdaActiva === loCelda.NumeroCelda ? 'erp-celda--seleccionada' : ''}"
                data-celda="${loCelda.NumeroCelda}"
                title="Celda ${loCelda.NumeroCelda} | ${loCelda.Estado}"
            >
                <span class="erp-celda-numero">${loCelda.NumeroCelda}</span>
                <span class="erp-celda-producto">${recortar(loCelda.Producto || loCelda.BloqueadaPor || 'Disponible', 16)}</span>
                <span class="erp-celda-producto">${loCelda.Stock !== '' ? `Stock: ${loCelda.Stock}` : ''}</span>
            </button>
        `).join('');

        loMatriz.querySelectorAll('[data-celda]').forEach((loBoton) => {
            loBoton.addEventListener('click', () => {
                const tnCelda = Number(loBoton.getAttribute('data-celda'));
                seleccionarCelda(tnCelda);
                abrirModalCelda(true);
            });
        });
    }

    function seleccionarCelda(tnCelda) {
        loEstado.celdaActiva = tnCelda;
        loFormularioAsignacion.querySelector('input[name="CeldaAncla"]').value = String(tnCelda);
        pintarMatriz(loEstado.celdas);
    }

    function simularLocal(loPayload) {
        const tnAncla = Number(loPayload.CeldaAncla || 0);
        const tnSpanColumnas = Number(loPayload.SpanColumnas || 1);
        const tnSpanFilas = Number(loPayload.SpanFilas || 1);

        const loAncla = loEstado.celdas.find((loCelda) => loCelda.NumeroCelda === tnAncla);
        if (!loAncla) {
            return { CeldasAfectadas: [], Conflictos: ['Celda ancla invalida.'] };
        }

        const laAfectadas = [];
        const laConflictos = [];
        for (let tnF = 0; tnF < tnSpanFilas; tnF += 1) {
            for (let tnC = 0; tnC < tnSpanColumnas; tnC += 1) {
                const tnFila = loAncla.Fila + tnF;
                const tnColumna = loAncla.Columna + tnC;
                const loCelda = loEstado.celdas.find((loItem) => loItem.Fila === tnFila && loItem.Columna === tnColumna);
                if (!loCelda) {
                    laConflictos.push(`Posicion fuera de rango: fila ${tnFila}, columna ${tnColumna}.`);
                    continue;
                }
                laAfectadas.push(loCelda.NumeroCelda);
                if (loCelda.Estado !== 'DISPONIBLE') {
                    laConflictos.push(`Celda ${loCelda.NumeroCelda} no disponible (${loCelda.Estado}).`);
                }
            }
        }

        return {
            CeldasAfectadas: laAfectadas,
            Conflictos: laConflictos,
        };
    }

    function construirPayloadAsignacion() {
        const loDatos = Object.fromEntries(new FormData(loFormularioAsignacion).entries());
        return {
            CeldaAncla: Number(loDatos.CeldaAncla || 0),
            Producto: Number(loDatos.Producto || 0),
            Lote: Number(loDatos.Lote || 0),
            Cantidad: Number(loDatos.Cantidad || 0),
            SpanColumnas: Number(loDatos.SpanColumnas || 1),
            SpanFilas: Number(loDatos.SpanFilas || 1),
            Version: String(loDatos.Version || '').trim(),
            Motivo: String(loDatos.Motivo || '').trim(),
        };
    }

    function validarPayloadAsignacion(loPayload) {
        if (!loPayload.CeldaAncla || loPayload.CeldaAncla < 1 || loPayload.CeldaAncla > 54) {
            return 'Celda ancla invalida (1 a 54).';
        }
        if (!loPayload.Producto) {
            return 'Debe seleccionar producto.';
        }
        if (!loPayload.Lote) {
            return 'Debe seleccionar lote.';
        }
        if (!loPayload.Cantidad || loPayload.Cantidad < 1) {
            return 'Cantidad invalida.';
        }
        if (!loPayload.SpanColumnas || loPayload.SpanColumnas < 1 || loPayload.SpanColumnas > 9) {
            return 'Span de columnas invalido (1 a 9).';
        }
        if (!loPayload.SpanFilas || loPayload.SpanFilas < 1 || loPayload.SpanFilas > 6) {
            return 'Span de filas invalido (1 a 6).';
        }
        if (!loPayload.Version) {
            return 'Version es obligatoria para mutaciones de celdas.';
        }
        if (!loPayload.Motivo) {
            return 'Motivo es obligatorio para mutaciones de celdas.';
        }
        return '';
    }

    function pintarSimulacion(loSimulacionData) {
        const laAfectadas = toArray(loSimulacionData.CeldasAfectadas ?? loSimulacionData.celdas_afectadas);
        const laConflictos = toArray(loSimulacionData.Conflictos ?? loSimulacionData.conflictos);

        loSimulacion.innerHTML = `
            <div class="rounded border border-slate-200 bg-white p-2 text-xs">
                <p><strong>Celdas afectadas:</strong> ${laAfectadas.length ? laAfectadas.join(', ') : 'Ninguna'}</p>
                <p class="mt-1"><strong>Conflictos:</strong> ${laConflictos.length ? laConflictos.join(' | ') : 'Sin conflictos'}</p>
            </div>
        `;
    }

    function pintarDetalleMaquina(loDetalle) {
        const laDatosPrincipales = [
            ['Codigo', loDetalle.CodigoMaquina],
            ['Nombre', loDetalle.NombreMaquina ?? loDetalle.Nombre],
            ['Serie', loDetalle.NumeroSerie],
            ['Marca', loDetalle.Marca],
            ['Modelo', loDetalle.Modelo ?? loDetalle.TipoMaquina],
            ['Estado', loDetalle.Estado ?? loDetalle.EstadoMaquina],
        ];
        const laDatosTecnicos = [
            ['Tipo internet', loDetalle.NombreTipoInternet ?? loDetalle.TipoInternet ?? loDetalle.CodigoTipoInternet],
            ['Conexion', loDetalle.IdentificadorConexion],
            ['Consumo Kwh/mes', loDetalle.ConsumoKwhMensual],
            ['Tipo lugar', loDetalle.NombreTipoLugar ?? loDetalle.TipoLugarInstalacion ?? loDetalle.CodigoTipoLugar],
            ['Filas', loDetalle.FilasMatriz],
            ['Columnas', loDetalle.ColumnasMatriz],
            ['Version', loDetalle.Version],
            ['Ultima actualizacion', unirFechaHora(loDetalle.UsrFecha, loDetalle.UsrHora)],
        ];

        loDetalleMaquina.innerHTML = `
            <div class="erp-datos-grid">
                ${laDatosPrincipales.map(([tcEtiqueta, txValor]) => renderDatoMaquina(tcEtiqueta, txValor)).join('')}
            </div>
            <h5 class="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Datos tecnicos</h5>
            <div class="erp-datos-grid mt-2">
                ${laDatosTecnicos.map(([tcEtiqueta, txValor]) => renderDatoMaquina(tcEtiqueta, txValor)).join('')}
            </div>
        `;
    }

    function pintarUbicacionMaquina(loUbicacion) {
        if (!loUbicacionMaquina) return;
        const loData = loUbicacion && typeof loUbicacion === 'object' ? loUbicacion : {};
        const laDatos = [
            ['Direccion', loData.Direccion ?? loData.Ubicacion ?? loData.UbicacionActual],
            ['Latitud', loData.Latitud],
            ['Longitud', loData.Longitud],
            ['Tipo instalacion', loData.TipoInstalacion ?? loData.TipoLugarInstalacion ?? loData.NombreTipoLugar],
            ['Plan actual', loData.PlanActual],
            ['Estado instalacion', loData.EstadoInstalacion],
            ['Convenio', loData.Convenio],
            ['Energia propia', loData.TieneEnergiaPropia],
        ];

        loUbicacionMaquina.innerHTML = `
            <div class="erp-datos-grid">
                ${laDatos.map(([tcEtiqueta, txValor]) => renderDatoMaquina(tcEtiqueta, txValor)).join('')}
            </div>
        `;
    }

    function pintarFotosMaquina(laFotos) {
        if (!loFotosMaquinaLista) return;
        if (!Array.isArray(laFotos) || !laFotos.length) {
            loFotosMaquinaLista.innerHTML = '<p class="text-sm text-slate-500">No hay fotos registradas para esta maquina.</p>';
            return;
        }

        loFotosMaquinaLista.innerHTML = `
            <div class="mb-3 text-xs font-semibold text-slate-600">
                Imagenes registradas en backend: ${escapeHtml(String(laFotos.length))}
            </div>
            ${laFotos.map((loFoto) => {
            const tnId = loFoto.IdMaquinaFoto ?? loFoto.MaquinaFoto ?? loFoto.IdFoto ?? loFoto.Foto ?? loFoto.id;
            const tcUrl = obtenerUrlFoto(loFoto);
            const tcTipo = loFoto.TipoFoto ?? loFoto.Tipo ?? 'N/D';
            const tcOrden = loFoto.Orden ?? 'N/D';
            const tcEstado = loFoto.Estado ?? 'N/D';
            const tcFecha = unirFechaHora(loFoto.UsrFecha, loFoto.UsrHora);

            return `
                <article class="erp-foto-card">
                    ${tcUrl ? `<img src="${escapeHtml(tcUrl)}" alt="Foto maquina ${escapeHtml(String(tnId || ''))}" class="erp-foto-imagen" loading="lazy">`
        : '<div class="erp-foto-sin-imagen">Sin previsualizacion</div>'}
                    <div class="erp-foto-meta">
                        <p><strong>Tipo:</strong> ${escapeHtml(String(tcTipo))}</p>
                        <p><strong>Orden:</strong> ${escapeHtml(String(tcOrden))}</p>
                        <p><strong>Estado:</strong> ${escapeHtml(String(tcEstado))}</p>
                        <p><strong>Fecha:</strong> ${escapeHtml(String(tcFecha))}</p>
                        <p class="truncate" title="${escapeHtml(tcUrl || 'Sin URL devuelta por backend')}">
                            <strong>URL:</strong> ${escapeHtml(tcUrl || 'Sin URL devuelta por backend')}
                        </p>
                        ${tcUrl ? '<a href="' + escapeHtml(tcUrl) + '" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-700 underline">Abrir imagen</a>' : ''}
                        <button type="button" class="erp-btn erp-btn--peligro mt-2" data-foto-eliminar="${escapeHtml(String(tnId || ''))}">
                            Eliminar foto
                        </button>
                    </div>
                </article>
            `;
        }).join('')}
        `;

        loFotosMaquinaLista.querySelectorAll('img.erp-foto-imagen').forEach((loImagen) => {
            loImagen.addEventListener('error', () => {
                loImagen.outerHTML = '<div class="erp-foto-sin-imagen">Imagen no disponible</div>';
            }, { once: true });
        });
    }

    function precargarFormularioMaquina(loDetalle) {
        if (!loFormularioMaquina) return;
        loFormularioMaquina.querySelector('[name="IdMaquina"]').value = loDetalle.IdMaquina ?? loDetalle.Maquina ?? '';
        loFormularioMaquina.querySelector('[name="CodigoMaquina"]').value = loDetalle.CodigoMaquina ?? '';
        loFormularioMaquina.querySelector('[name="NumeroSerie"]').value = loDetalle.NumeroSerie ?? '';
        loFormularioMaquina.querySelector('[name="Marca"]').value = loDetalle.Marca ?? '';
        loFormularioMaquina.querySelector('[name="Modelo"]').value = loDetalle.Modelo ?? loDetalle.TipoMaquina ?? '';
        loFormularioMaquina.querySelector('[name="IdentificadorConexion"]').value = loDetalle.IdentificadorConexion ?? '';
        loFormularioMaquina.querySelector('[name="TipoInternet"]').value =
            loDetalle.TipoInternet ?? loDetalle.CodigoTipoInternet ?? '';
        loFormularioMaquina.querySelector('[name="ConsumoKwhMensual"]').value = loDetalle.ConsumoKwhMensual ?? '';
        loFormularioMaquina.querySelector('[name="TipoLugarInstalacion"]').value =
            loDetalle.TipoLugarInstalacion ?? loDetalle.CodigoTipoLugar ?? '';
        loFormularioMaquina.querySelector('[name="UbicacionActual"]').value = loDetalle.UbicacionActual ?? loDetalle.Ubicacion ?? '';
        loFormularioMaquina.querySelector('[name="FilasMatriz"]').value = loDetalle.FilasMatriz ?? '';
        loFormularioMaquina.querySelector('[name="ColumnasMatriz"]').value = loDetalle.ColumnasMatriz ?? '';
        loFormularioMaquina.querySelector('[name="Estado"]').value = loDetalle.Estado ?? loDetalle.EstadoMaquina ?? '';
        loFormularioMaquina.querySelector('[name="Version"]').value = loDetalle.Version ?? '';
        loFormularioMaquina.querySelector('[name="Motivo"]').value = '';
    }

    function abrirModalCelda(tlAbrir) {
        loModalCelda?.classList.toggle('hidden', !tlAbrir);
    }

    function abrirModalMaquina(tlAbrir) {
        loModalMaquina?.classList.toggle('hidden', !tlAbrir);
    }

    function limpiarVistaMaquina() {
        if (loDetalleMaquina) {
            loDetalleMaquina.innerHTML = '<p class="text-sm text-slate-500">Seleccione una maquina en el header superior para ver su detalle.</p>';
        }
        if (loUbicacionMaquina) {
            loUbicacionMaquina.innerHTML = '<p class="text-sm text-slate-500">Seleccione una maquina para ver la ubicacion.</p>';
        }
        if (loFotosMaquinaLista) {
            loFotosMaquinaLista.innerHTML = '<p class="text-sm text-slate-500">Seleccione una maquina para administrar sus fotos.</p>';
        }
        if (loFotosMaquinaMensaje) {
            loFotosMaquinaMensaje.innerHTML = '';
        }
        loFormularioFotosMaquina?.reset();
        pintarPreviewArchivosSeleccionados([]);
    }

    function aplicarContextoMaquinaEnFormulario() {
        const loMaquina = obtenerMaquinaActiva();
        const tnMaquina = obtenerMaquinaActivaId();
        if (loInputMaquina) loInputMaquina.value = tnMaquina ? String(tnMaquina) : '';
        if (!tnMaquina) {
            if (loInputMaquinaLabel) loInputMaquinaLabel.value = 'Maquina: todas (header)';
            return;
        }
        if (loInputMaquinaLabel) {
            loInputMaquinaLabel.value = `Maquina: ${loMaquina?.nombre || `#${tnMaquina}`}`;
        }
    }

    function programarCargaMatriz() {
        if (loEstado.vista !== 'celdas') return;
        if (!obtenerMaquinaContexto()) return;

        if (lnTimerCargaMatriz) {
            window.clearTimeout(lnTimerCargaMatriz);
        }

        lnTimerCargaMatriz = window.setTimeout(() => {
            void cargarMatriz();
        }, 320);
    }

    function obtenerMaquinaContexto() {
        const tnMaquina = Number(obtenerMaquinaActivaId() || 0);
        return tnMaquina > 0 ? tnMaquina : 0;
    }

    function claseCelda(tcEstado) {
        const tc = String(tcEstado || '').toUpperCase();
        if (tc.includes('BLOQ')) return 'erp-celda--bloqueada';
        if (tc.includes('OCUP')) return 'erp-celda--ocupada';
        return 'erp-celda--disponible';
    }

    function recortar(tcTexto, tnMax = 12) {
        const tc = String(tcTexto ?? '');
        return tc.length > tnMax ? `${tc.slice(0, tnMax)}...` : tc;
    }

    function normalizarColeccion(lxDatos) {
        if (!lxDatos) return [];
        if (Array.isArray(lxDatos)) return lxDatos;
        if (typeof lxDatos !== 'object') return [];

        const laClaves = ['Rows', 'rows', 'items', 'lista', 'data', 'Datos', 'Fotos', 'fotos', 'Galeria', 'galeria', 'Imagenes', 'imagenes'];
        for (const tcClave of laClaves) {
            if (Array.isArray(lxDatos[tcClave])) {
                return lxDatos[tcClave];
            }
        }

        const laPrincipal = convertirAArreglo(lxDatos);
        if (laPrincipal.length === 1 && typeof laPrincipal[0] === 'object') {
            for (const tcClave of laClaves) {
                if (Array.isArray(laPrincipal[0]?.[tcClave])) {
                    return laPrincipal[0][tcClave];
                }
            }
        }

        return laPrincipal;
    }

    function obtenerUrlFoto(loFoto) {
        if (!loFoto || typeof loFoto !== 'object') return '';
        const laClaves = [
            'UrlImagen',
            'UrlArchivo',
            'UrlFoto',
            'Url',
            'URL',
            'FotoUrl',
            'RutaFoto',
            'Ruta',
            'Imagen',
            'Enlace',
            'Link',
        ];
        for (const tcClave of laClaves) {
            const tcValor = resolverUrlMultimedia(loFoto[tcClave]);
            if (tcValor) return tcValor;
        }

        const loData = loFoto.Data ?? loFoto.Datos ?? loFoto.Meta ?? null;
        if (loData && typeof loData === 'object') {
            for (const tcClave of laClaves) {
                const tcValor = resolverUrlMultimedia(loData[tcClave]);
                if (tcValor) return tcValor;
            }
        }

        return '';
    }

    function resolverUrlMultimedia(txUrl) {
        const tcUrl = String(txUrl ?? '').trim();
        if (!tcUrl) return '';
        if (/^https?:\/\//i.test(tcUrl)) return tcUrl;
        if (tcUrl.startsWith('//')) return `${window.location.protocol}${tcUrl}`;

        const tcBaseApi = String(window.__ERP_FRONTEND_CONFIG__?.apiBaseUrl || '').trim();
        if (tcUrl.startsWith('/')) {
            if (tcBaseApi) {
                try {
                    return new URL(tcUrl, tcBaseApi).toString();
                } catch {
                    return `${window.location.origin}${tcUrl}`;
                }
            }
            return `${window.location.origin}${tcUrl}`;
        }

        if (tcBaseApi) {
            try {
                return new URL(tcUrl, `${tcBaseApi.replace(/\/+$/, '')}/`).toString();
            } catch {
                return tcUrl;
            }
        }
        return tcUrl;
    }

    function normalizarValorCatalogo(txValor) {
        const tcValor = String(txValor ?? '').trim();
        if (!tcValor) return undefined;
        if (/^\d+$/.test(tcValor)) return Number(tcValor);
        return tcValor;
    }

    function pintarPreviewArchivosSeleccionados(loFiles) {
        if (!loFotosMaquinaPreview) return;
        const laArchivos = Array.from(loFiles || []).filter((loArchivo) => loArchivo instanceof File && loArchivo.size > 0);
        if (!laArchivos.length) {
            loFotosMaquinaPreview.innerHTML = '<p class="text-xs text-slate-500">Sin archivos locales seleccionados.</p>';
            return;
        }

        loFotosMaquinaPreview.innerHTML = `
            <div class="mb-2 text-xs font-semibold text-slate-600">Previsualizacion local (${laArchivos.length})</div>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                ${laArchivos.map((loArchivo) => {
            const tcUrlLocal = URL.createObjectURL(loArchivo);
            return `
                        <article class="rounded border border-slate-200 bg-white p-2">
                            <img src="${escapeHtml(tcUrlLocal)}" alt="${escapeHtml(loArchivo.name)}" class="h-24 w-full rounded object-cover">
                            <p class="mt-1 truncate text-[11px] text-slate-600" title="${escapeHtml(loArchivo.name)}">${escapeHtml(loArchivo.name)}</p>
                        </article>
                    `;
        }).join('')}
            </div>
        `;
    }

    function renderDatoMaquina(tcEtiqueta, txValor) {
        return `
            <article class="erp-dato-card">
                <p class="erp-dato-etiqueta">${escapeHtml(tcEtiqueta)}</p>
                <p class="erp-dato-valor">${formatearValor(txValor)}</p>
            </article>
        `;
    }

    function unirFechaHora(tcFecha, tcHora) {
        const laPartes = [String(tcFecha || '').trim(), String(tcHora || '').trim()].filter(Boolean);
        return laPartes.length ? laPartes.join(' ') : 'N/D';
    }

    function formatearValor(txValor) {
        if (txValor === null || txValor === undefined || txValor === '') return 'N/D';
        if (typeof txValor === 'boolean') return txValor ? 'Si' : 'No';
        return escapeHtml(String(txValor));
    }

    function escapeHtml(tcTexto) {
        return String(tcTexto ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    void cargarCatalogos().then(async () => {
        aplicarContextoMaquinaEnFormulario();
        if (!obtenerMaquinaContexto()) {
            limpiarVistaMaquina();
            return;
        }
        loEstado.maquina = obtenerMaquinaContexto();
        if (loEstado.vista === 'maquinas') {
            await cargarDetalleMaquina();
            return;
        }
        await cargarMatriz();
    });
}
