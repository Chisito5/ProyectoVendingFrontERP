<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;

/**
 * SYSCOOP
 * category: Controller
 * package: App\Http\Controllers\Frontend
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Controlador de vistas del frontend ERP Vending.
 */
class FrontendController extends Controller
{
    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra el tablero operativo principal.
     */
    public function Tablero()
    {
        return view('pages.tablero');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la pantalla de catalogos base.
     */
    public function Catalogos()
    {
        return view('pages.catalogos');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la pantalla de consultas de stock.
     */
    public function Stock()
    {
        return view('pages.stock');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la pantalla de operaciones de reserva.
     */
    public function Reservas()
    {
        return view('pages.reservas');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la pantalla de venta y reversa.
     */
    public function Ventas()
    {
        return view('pages.ventas');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la pantalla de reposiciones.
     */
    public function Reposiciones()
    {
        return view('pages.reposiciones');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la gestion de usuarios y asignaciones por maquina.
     */
    public function Usuarios()
    {
        return view('pages.usuarios');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la gestion de ubicaciones y estado operativo de maquina.
     */
    public function Ubicaciones()
    {
        return view('pages.ubicaciones');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra el catalogo avanzado (familia, grupo, subgrupo, imagenes).
     */
    public function CatalogoAvanzado()
    {
        return view('pages.catalogo_avanzado');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la gestion de anuncios comerciales.
     */
    public function Anuncios()
    {
        return view('pages.anuncios');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la gestion de mermas y aprobaciones.
     */
    public function Mermas()
    {
        return view('pages.mermas');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra el modulo de alertas operativas.
     */
    public function Alertas()
    {
        return view('pages.alertas');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la generacion y descarga de reportes.
     */
    public function Reportes()
    {
        return view('pages.reportes');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra el monitor de integracion IoT.
     */
    public function IntegracionIot()
    {
        return view('pages.integracion_iot');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra consultas de analitica ejecutiva.
     */
    public function Analitica()
    {
        return view('pages.analitica');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la operacion de maquinas y celdas inteligentes (matriz 6x9).
     */
    public function MaquinasCeldas()
    {
        return view('pages.maquinas_celdas');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la gestion operativa de productos con dimensiones y galeria.
     */
    public function Productos()
    {
        return view('pages.productos');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra el editor visual de producto por capas 2D.
     */
    public function DisenoProducto()
    {
        return view('pages.diseno_producto');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 28-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra la gestion de deposito operativo y transferencias a maquina.
     */
    public function Deposito()
    {
        return view('pages.deposito');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Contracts\View\View
     *
     * Muestra pantalla de acceso denegado por permisos.
     */
    public function Denegado()
    {
        return view('pages.denegado');
    }
}
