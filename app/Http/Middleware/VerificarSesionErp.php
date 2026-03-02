<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * SYSCOOP
 * category: Middleware
 * package: App\Http\Middleware
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Verifica existencia de sesion ERP para rutas protegidas.
 */
class VerificarSesionErp
{
    /**
     * SYSCOOP
     * category: Middleware
     * package: App\Http\Middleware
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: \Illuminate\Http\Request $request
     * param: \Closure $next
     * return: mixed
     *
     * Redirige a acceso cuando no existe token en sesion.
     */
    public function handle(Request $request, Closure $next)
    {
        if (!$request->session()->has('erp_sesion.Token')) {
            return redirect()->route('acceso.formulario');
        }

        return $next($request);
    }
}
