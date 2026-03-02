import { disenoProductoService } from '../services/disenoProductoService';
import { buscar, renderizarMensaje } from '../utils/dom';
import { mostrarToast } from '../ui/toast';

/**
 * SYSCOOP
 * category: Frontend
 * package: resources/js/pages
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 * return: void
 *
 * Inicializa editor de producto por capas 2D.
 */
export function iniciarPaginaDisenoProducto() {
    const loFormulario = buscar('#form-diseno-producto');
    const loFormularioCapa = buscar('#form-capa-propiedades');
    const loCanvas = buscar('#diseno-canvas');
    const loMensaje = buscar('#diseno-mensaje');
    const loListaCapas = buscar('#diseno-lista-capas');
    const loCtx = loCanvas?.getContext('2d');

    const loEstado = {
        capas: [],
        capaActiva: null,
    };

    buscar('#btn-diseno-cargar')?.addEventListener('click', async () => {
        await cargarDiseno();
    });

    buscar('#btn-diseno-guardar')?.addEventListener('click', async () => {
        await guardarDiseno();
    });

    buscar('#btn-diseno-preview')?.addEventListener('click', async () => {
        await renderPreview();
    });

    buscar('#btn-capa-fondo')?.addEventListener('click', () => agregarCapa('FONDO'));
    buscar('#btn-capa-oferta')?.addEventListener('click', () => agregarCapa('OFERTA'));
    buscar('#btn-capa-texto')?.addEventListener('click', () => agregarCapa('TEXTO'));
    buscar('#btn-capa-eliminar')?.addEventListener('click', eliminarCapaActiva);
    buscar('#btn-capa-aplicar')?.addEventListener('click', aplicarPropiedadesCapa);

    function agregarCapa(tcTipo) {
        const tnOrden = loEstado.capas.length + 1;
        const tcId = `CAPA-${Date.now()}-${tnOrden}`;
        loEstado.capas.push({
            Id: tcId,
            Tipo: tcTipo,
            Orden: tnOrden,
            X: 40,
            Y: 40,
            Ancho: tcTipo === 'TEXTO' ? 280 : 220,
            Alto: tcTipo === 'TEXTO' ? 56 : 180,
            Opacidad: 1,
            Rotacion: 0,
            Fuente: 'Arial',
            Texto: tcTipo === 'TEXTO' ? 'Nuevo texto' : '',
            Color: '#111827',
            Recurso: '',
        });
        loEstado.capaActiva = tcId;
        pintarCapas();
        repintarCanvas();
    }

    function eliminarCapaActiva() {
        if (!loEstado.capaActiva) return;
        loEstado.capas = loEstado.capas.filter((loCapa) => loCapa.Id !== loEstado.capaActiva);
        loEstado.capaActiva = loEstado.capas[0]?.Id ?? null;
        pintarCapas();
        repintarCanvas();
    }

    function aplicarPropiedadesCapa() {
        const loDatos = Object.fromEntries(new FormData(loFormularioCapa).entries());
        const tcId = loDatos.CapaId || loEstado.capaActiva;
        if (!tcId) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Seleccione una capa.' });
            return;
        }

        const loCapa = loEstado.capas.find((loItem) => loItem.Id === tcId);
        if (!loCapa) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'La capa indicada no existe.' });
            return;
        }

        loCapa.Recurso = loDatos.Recurso || loCapa.Recurso;
        loCapa.Texto = loDatos.Texto || loCapa.Texto;
        loCapa.X = loDatos.X !== '' ? Number(loDatos.X) : loCapa.X;
        loCapa.Y = loDatos.Y !== '' ? Number(loDatos.Y) : loCapa.Y;
        loCapa.Ancho = loDatos.Ancho !== '' ? Number(loDatos.Ancho) : loCapa.Ancho;
        loCapa.Alto = loDatos.Alto !== '' ? Number(loDatos.Alto) : loCapa.Alto;
        loCapa.Opacidad = loDatos.Opacidad !== '' ? Number(loDatos.Opacidad) : loCapa.Opacidad;
        loCapa.Rotacion = loDatos.Rotacion !== '' ? Number(loDatos.Rotacion) : loCapa.Rotacion;
        loCapa.Color = loDatos.Color || loCapa.Color;

        repintarCanvas();
        pintarCapas();
    }

    async function cargarDiseno() {
        const loDatos = Object.fromEntries(new FormData(loFormulario).entries());
        const tnProducto = Number(loDatos.IdProducto || 0);
        if (!tnProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingrese el ID de producto.' });
            return;
        }

        const loResultado = await disenoProductoService.obtener(tnProducto);
        if (!loResultado.ok) {
            renderizarMensaje(loMensaje, loResultado);
            return;
        }

        const loDiseno = loResultado.datos ?? {};
        const loLienzo = loDiseno.Lienzo ?? {};
        const laCapas = Array.isArray(loDiseno.Capas) ? loDiseno.Capas : [];

        if (loLienzo.Ancho) loCanvas.width = Number(loLienzo.Ancho);
        if (loLienzo.Alto) loCanvas.height = Number(loLienzo.Alto);
        loEstado.capas = laCapas.map((loCapa, tnIndice) => ({
            ...loCapa,
            Id: loCapa.Id ?? `CAPA-${tnIndice + 1}`,
            Orden: Number(loCapa.Orden ?? tnIndice + 1),
        }));
        loEstado.capaActiva = loEstado.capas[0]?.Id ?? null;

        pintarCapas();
        await repintarCanvas();
        renderizarMensaje(loMensaje, loResultado);
    }

    async function guardarDiseno() {
        const loDatos = Object.fromEntries(new FormData(loFormulario).entries());
        const tnProducto = Number(loDatos.IdProducto || 0);
        if (!tnProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingrese el ID de producto.' });
            return;
        }

        loCanvas.width = Number(loDatos.AnchoLienzo || loCanvas.width);
        loCanvas.height = Number(loDatos.AltoLienzo || loCanvas.height);

        const loPayload = {
            Lienzo: {
                Ancho: loCanvas.width,
                Alto: loCanvas.height,
            },
            Capas: loEstado.capas,
            Version: loDatos.Version || undefined,
            Motivo: loDatos.Motivo || undefined,
        };

        let loResultado = await disenoProductoService.actualizar(tnProducto, loPayload);
        if (!loResultado.ok) {
            loResultado = await disenoProductoService.crear(tnProducto, loPayload);
        }

        renderizarMensaje(loMensaje, loResultado);
        if (loResultado.ok) {
            mostrarToast('Diseno guardado.', 'ok');
        }
    }

    async function renderPreview() {
        const loDatos = Object.fromEntries(new FormData(loFormulario).entries());
        const tnProducto = Number(loDatos.IdProducto || 0);
        if (!tnProducto) {
            renderizarMensaje(loMensaje, { ok: false, mensaje: 'Ingrese el ID de producto.' });
            return;
        }

        const loPayload = {
            Lienzo: { Ancho: loCanvas.width, Alto: loCanvas.height },
            Capas: loEstado.capas,
        };
        const loResultado = await disenoProductoService.renderizarPreview(tnProducto, loPayload);
        renderizarMensaje(loMensaje, loResultado);
    }

    function pintarCapas() {
        if (!loEstado.capas.length) {
            loListaCapas.innerHTML = '<p class="text-xs text-slate-500">Sin capas.</p>';
            return;
        }

        loListaCapas.innerHTML = `
            <div class="space-y-2">
                ${loEstado.capas
                    .sort((a, b) => Number(a.Orden) - Number(b.Orden))
                    .map((loCapa) => `
                        <button
                            type="button"
                            class="w-full rounded border px-2 py-1 text-left text-xs ${loCapa.Id === loEstado.capaActiva ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}"
                            data-capa="${escapar(loCapa.Id)}"
                        >
                            <strong>${escapar(loCapa.Tipo)}</strong> | ${escapar(loCapa.Id)}
                        </button>
                    `).join('')}
            </div>
        `;

        loListaCapas.querySelectorAll('[data-capa]').forEach((loBoton) => {
            loBoton.addEventListener('click', () => {
                loEstado.capaActiva = loBoton.getAttribute('data-capa');
                cargarFormularioCapaActiva();
                pintarCapas();
            });
        });
    }

    function cargarFormularioCapaActiva() {
        const loCapa = loEstado.capas.find((loItem) => loItem.Id === loEstado.capaActiva);
        if (!loCapa) return;
        const loCampos = Object.fromEntries(new FormData(loFormularioCapa).entries());
        Object.keys(loCampos).forEach((tcCampo) => {
            const loControl = loFormularioCapa.querySelector(`[name="${tcCampo}"]`);
            if (!loControl) return;
            loControl.value = loCapa[tcCampo] ?? '';
        });
    }

    async function repintarCanvas() {
        if (!loCtx || !loCanvas) return;
        loCtx.clearRect(0, 0, loCanvas.width, loCanvas.height);
        loCtx.fillStyle = '#f8fafc';
        loCtx.fillRect(0, 0, loCanvas.width, loCanvas.height);

        const laOrdenadas = [...loEstado.capas].sort((a, b) => Number(a.Orden) - Number(b.Orden));
        for (const loCapa of laOrdenadas) {
            await pintarCapa(loCapa);
        }
    }

    async function pintarCapa(loCapa) {
        loCtx.save();
        loCtx.globalAlpha = Number(loCapa.Opacidad ?? 1);
        loCtx.translate(Number(loCapa.X ?? 0), Number(loCapa.Y ?? 0));
        loCtx.rotate((Number(loCapa.Rotacion ?? 0) * Math.PI) / 180);

        const tnAncho = Number(loCapa.Ancho ?? 120);
        const tnAlto = Number(loCapa.Alto ?? 80);

        if (loCapa.Tipo === 'TEXTO') {
            loCtx.fillStyle = loCapa.Color || '#111827';
            loCtx.font = `700 28px ${loCapa.Fuente || 'Arial'}`;
            loCtx.fillText(loCapa.Texto || 'Texto', 0, Math.max(30, tnAlto / 2));
            loCtx.restore();
            return;
        }

        if (loCapa.Recurso) {
            const loImg = await cargarImagen(loCapa.Recurso);
            if (loImg) {
                loCtx.drawImage(loImg, 0, 0, tnAncho, tnAlto);
                loCtx.restore();
                return;
            }
        }

        loCtx.fillStyle = loCapa.Tipo === 'FONDO' ? '#cbd5e1' : '#f59e0b';
        loCtx.fillRect(0, 0, tnAncho, tnAlto);
        loCtx.fillStyle = '#0f172a';
        loCtx.font = '600 14px Arial';
        loCtx.fillText(loCapa.Tipo, 8, 22);
        loCtx.restore();
    }

    function cargarImagen(tcUrl) {
        return new Promise((resolve) => {
            const loImg = new Image();
            loImg.crossOrigin = 'anonymous';
            loImg.onload = () => resolve(loImg);
            loImg.onerror = () => resolve(null);
            loImg.src = tcUrl;
        });
    }

    function escapar(tcTexto) {
        return String(tcTexto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
