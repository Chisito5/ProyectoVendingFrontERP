<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\Erp\AutenticacionErpService;
use Illuminate\Http\Request;

/**
 * SYSCOOP
 * category: Controller
 * package: App\Http\Controllers\Frontend
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Controlador de acceso y sesion del frontend.
 */
class AccesoController extends Controller
{
    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: \Illuminate\Http\Request $request
     * return: \Illuminate\Contracts\View\View|\Illuminate\Http\RedirectResponse
     *
     * Muestra formulario de acceso ERP.
     */
    public function Formulario(Request $request)
    {
        if ($request->boolean('forzar')) {
            $request->session()->forget('erp_sesion');
            $request->session()->regenerate();
            return view('auth.acceso');
        }

        if ($request->session()->has('erp_sesion.Token')) {
            return redirect()->route('tablero');
        }

        return view('auth.acceso');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez1
     * fecha: 27-02-2026
     * param: \Illuminate\Http\Request $request
     * param: \App\Services\Erp\AutenticacionErpService $service
     * return: \Illuminate\Http\RedirectResponse
     *
     * Procesa autenticacion del usuario contra API ERP.
     */
    public function Iniciar(Request $request, AutenticacionErpService $service)
    {
        $loDatos = $request->validate([
            'Usuario' => ['required', 'string', 'min:2', 'max:120'],
            'Clave' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $loResultado = $service->IniciarSesion($loDatos['Usuario'], $loDatos['Clave']);

        if (!$loResultado['ok']) {
            return back()
                ->withInput(['Usuario' => $loDatos['Usuario']])
                ->withErrors(['acceso' => $loResultado['mensaje']]);
        }

        $loSesion = $this->ConstruirSesion($loResultado['datos'] ?? []);

        if (empty($loSesion['Token'])) {
            return back()
                ->withInput(['Usuario' => $loDatos['Usuario']])
                ->withErrors(['acceso' => 'La API no devolvio token de sesion.']);
        }

        $request->session()->put('erp_sesion', $loSesion);
        $request->session()->regenerate();

        return redirect()->intended(route('tablero'));
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: \Illuminate\Http\Request $request
     * param: \App\Services\Erp\AutenticacionErpService $service
     * return: \Illuminate\Http\RedirectResponse
     *
     * Cierra sesion de usuario en frontend y backend ERP.
     */
    public function Cerrar(Request $request, AutenticacionErpService $service)
    {
        $tcToken = (string) ($request->session()->get('erp_sesion.Token') ?? '');

        if ($tcToken !== '') {
            $service->CerrarSesion($tcToken);
        }

        $request->session()->forget('erp_sesion');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('acceso.formulario');
    }

    /**
     * SYSCOOP
     * category: Controller
     * package: App\Http\Controllers\Frontend
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: array $taDatos
     * return: array
     *
     * Normaliza datos de sesion segun contrato esperado.
     */
    protected function ConstruirSesion(array $taDatos): array
    {
        $taPermisos = $taDatos['Permisos'] ?? [];

        return [
            'Token' => $taDatos['Token'] ?? $taDatos['token'] ?? null,
            'RefreshToken' => $taDatos['RefreshToken'] ?? $taDatos['refresh_token'] ?? null,
            'Rol' => $taDatos['Rol'] ?? $taDatos['rol'] ?? 'Operador',
            'Permisos' => is_array($taPermisos) ? $taPermisos : [],
            'Usuario' => $taDatos['Usuario'] ?? $taDatos['usuario'] ?? null,
            'EmpresaDefault' => $taDatos['EmpresaDefault'] ?? $taDatos['empresa_default'] ?? null,
        ];
    }
}
