import './bootstrap';

import { inicializarContextoEmpresa } from './core/contextoEmpresa';
import { inicializarContextoMaquina } from './core/contextoMaquina';
import { inicializarSesion } from './core/sesionErp';

inicializarSesion();
void inicializarContextoEmpresa();
void inicializarContextoMaquina();

const tcPagina = document.body?.dataset?.page;

const loCargadores = {
    tablero: () => import('./pages/tableroPagina').then((loModulo) => loModulo.iniciarPaginaTablero()),
    maquinas_celdas: () => import('./pages/maquinasCeldasPagina').then((loModulo) => loModulo.iniciarPaginaMaquinasCeldas()),
    productos: () => import('./pages/productosPagina').then((loModulo) => loModulo.iniciarPaginaProductos()),
    diseno_producto: () => import('./pages/disenoProductoPagina').then((loModulo) => loModulo.iniciarPaginaDisenoProducto()),
    deposito: () => import('./pages/depositoPagina').then((loModulo) => loModulo.iniciarPaginaDeposito()),
    catalogos: () => import('./pages/catalogosPagina').then((loModulo) => loModulo.iniciarPaginaCatalogos()),
    stock: () => import('./pages/stockPagina').then((loModulo) => loModulo.iniciarPaginaStock()),
    reservas: () => import('./pages/reservasPagina').then((loModulo) => loModulo.iniciarPaginaReservas()),
    ventas: () => import('./pages/ventasPagina').then((loModulo) => loModulo.iniciarPaginaVentas()),
    reposiciones: () => import('./pages/reposicionesPagina').then((loModulo) => loModulo.iniciarPaginaReposiciones()),
    usuarios: () => import('./pages/usuariosPagina').then((loModulo) => loModulo.iniciarPaginaUsuarios()),
    ubicaciones: () => import('./pages/ubicacionesPagina').then((loModulo) => loModulo.iniciarPaginaUbicaciones()),
    catalogo_avanzado: () => import('./pages/catalogoAvanzadoPagina').then((loModulo) => loModulo.iniciarPaginaCatalogoAvanzado()),
    anuncios: () => import('./pages/anunciosPagina').then((loModulo) => loModulo.iniciarPaginaAnuncios()),
    mermas: () => import('./pages/mermasPagina').then((loModulo) => loModulo.iniciarPaginaMermas()),
    alertas: () => import('./pages/alertasPagina').then((loModulo) => loModulo.iniciarPaginaAlertas()),
    reportes: () => import('./pages/reportesPagina').then((loModulo) => loModulo.iniciarPaginaReportes()),
    integracion_iot: () => import('./pages/integracionIotPagina').then((loModulo) => loModulo.iniciarPaginaIntegracionIot()),
    analitica: () => import('./pages/analiticaPagina').then((loModulo) => loModulo.iniciarPaginaAnalitica()),
};

if (tcPagina && loCargadores[tcPagina]) {
    void loCargadores[tcPagina]();
}
