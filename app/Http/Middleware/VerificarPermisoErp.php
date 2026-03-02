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
 * Verifica permiso por ruta segun sesion ERP.
 */
class VerificarPermisoErp
{
    /**
     * SYSCOOP
     * category: Middleware
     * package: App\Http\Middleware
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: \Illuminate\Http\Request $request
     * param: \Closure $next
     * param: string $tcPermiso
     * return: mixed
     *
     * Valida permisos del usuario para la ruta solicitada.
     */
    public function handle(Request $request, Closure $next, string $tcPermiso)
    {
        $taSesion = (array) $request->session()->get('erp_sesion', []);
        $tcRol = (string) ($taSesion['Rol'] ?? '');
        $taPermisos = $this->NormalizarPermisos($taSesion['Permisos'] ?? []);

        if (strcasecmp($tcRol, config('erp_frontend.rol_admin', 'Admin')) === 0) {
            return $next($request);
        }

        if (in_array('*', $taPermisos, true) || in_array($tcPermiso, $taPermisos, true)) {
            return $next($request);
        }

        return redirect()->route('acceso.denegado');
    }

    /**
     * SYSCOOP
     * category: Middleware
     * package: App\Http\Middleware
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: array $taPermisos
     * return: array
     *
     * Convierte permisos de distintos formatos a arreglo de codigos.
     */
    protected function NormalizarPermisos(array $taPermisos): array
    {
        $laSalida = [];

        foreach ($taPermisos as $txPermiso) {
            if (is_string($txPermiso)) {
                $laSalida[] = $txPermiso;
                continue;
            }

            if (is_array($txPermiso)) {
                $laSalida[] = $txPermiso['Codigo'] ?? $txPermiso['Permiso'] ?? $txPermiso['codigo'] ?? $txPermiso['permiso'] ?? null;
            }
        }

        return array_values(array_filter($laSalida));
    }
}
