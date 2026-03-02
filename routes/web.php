<?php

use App\Http\Controllers\Frontend\AccesoController;
use App\Http\Controllers\Frontend\FrontendController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/tablero');

Route::get('/acceso', [AccesoController::class, 'Formulario'])->name('acceso.formulario');
Route::post('/acceso', [AccesoController::class, 'Iniciar'])->name('acceso.iniciar');

Route::middleware('erp.sesion')->group(function () {
    Route::post('/salir', [AccesoController::class, 'Cerrar'])->name('acceso.cerrar');

    Route::get('/sin-acceso', [FrontendController::class, 'Denegado'])->name('acceso.denegado');

    Route::get('/tablero', [FrontendController::class, 'Tablero'])
        ->middleware('erp.permiso:tablero.ver')
        ->name('tablero');

    Route::get('/maquinas-celdas', [FrontendController::class, 'MaquinasCeldas'])
        ->middleware('erp.permiso:maquinas_celdas.ver')
        ->name('maquinas_celdas');

    Route::get('/productos', [FrontendController::class, 'Productos'])
        ->middleware('erp.permiso:productos.ver')
        ->name('productos');

    Route::get('/diseno-producto', [FrontendController::class, 'DisenoProducto'])
        ->middleware('erp.permiso:diseno_producto.ver')
        ->name('diseno_producto');

    Route::get('/deposito', [FrontendController::class, 'Deposito'])
        ->middleware('erp.permiso:deposito.ver')
        ->name('deposito');

    Route::get('/catalogos', [FrontendController::class, 'Catalogos'])
        ->middleware('erp.permiso:catalogos.ver')
        ->name('catalogos');

    Route::get('/stock', [FrontendController::class, 'Stock'])
        ->middleware('erp.permiso:stock.ver')
        ->name('stock');

    Route::get('/reservas', [FrontendController::class, 'Reservas'])
        ->middleware('erp.permiso:reservas.ver')
        ->name('reservas');

    Route::get('/ventas', [FrontendController::class, 'Ventas'])
        ->middleware('erp.permiso:ventas.ver')
        ->name('ventas');

    Route::get('/reposiciones', [FrontendController::class, 'Reposiciones'])
        ->middleware('erp.permiso:reposiciones.ver')
        ->name('reposiciones');

    Route::get('/usuarios', [FrontendController::class, 'Usuarios'])
        ->middleware('erp.permiso:usuarios.ver')
        ->name('usuarios');

    Route::get('/ubicaciones', [FrontendController::class, 'Ubicaciones'])
        ->middleware('erp.permiso:ubicaciones.ver')
        ->name('ubicaciones');

    Route::get('/catalogo-avanzado', [FrontendController::class, 'CatalogoAvanzado'])
        ->middleware('erp.permiso:catalogo_avanzado.ver')
        ->name('catalogo_avanzado');

    Route::get('/anuncios', [FrontendController::class, 'Anuncios'])
        ->middleware('erp.permiso:anuncios.ver')
        ->name('anuncios');

    Route::redirect('/campanias', '/anuncios');

    Route::get('/mermas', [FrontendController::class, 'Mermas'])
        ->middleware('erp.permiso:mermas.ver')
        ->name('mermas');

    Route::get('/alertas', [FrontendController::class, 'Alertas'])
        ->middleware('erp.permiso:alertas.ver')
        ->name('alertas');

    Route::get('/reportes', [FrontendController::class, 'Reportes'])
        ->middleware('erp.permiso:reportes.ver')
        ->name('reportes');

    Route::get('/integracion-iot', [FrontendController::class, 'IntegracionIot'])
        ->middleware('erp.permiso:iot.ver')
        ->name('integracion_iot');

    Route::get('/analitica', [FrontendController::class, 'Analitica'])
        ->middleware('erp.permiso:analitica.ver')
        ->name('analitica');
});
