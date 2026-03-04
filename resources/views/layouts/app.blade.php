<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Frontend ERP Vending')</title>
    @php
        $tcFaviconUrl = request()->getBaseUrl() . '/favicon-vending.svg?v=20260302';
    @endphp
    <link rel="icon" type="image/svg+xml" href="{{ $tcFaviconUrl }}">
    <link rel="shortcut icon" type="image/svg+xml" href="{{ $tcFaviconUrl }}">
    <link rel="apple-touch-icon" href="{{ $tcFaviconUrl }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
@php
    $tcRutaActual = (string) (request()->route()?->getName() ?? '');
    $tcVistaMaquinas = request('vista', 'maquinas');
    $loSesion = (array) session('erp_sesion', []);
    $laPermisosBrutos = $loSesion['Permisos'] ?? [];
    $tcRol = (string) ($loSesion['Rol'] ?? 'Operador');
    $tcAdmin = (string) config('erp_frontend.rol_admin', 'Admin');

    $laPermisos = [];
    foreach ($laPermisosBrutos as $txPermiso) {
        if (is_string($txPermiso)) {
            $laPermisos[] = $txPermiso;
            continue;
        }

        if (is_array($txPermiso)) {
            $laPermisos[] = $txPermiso['Codigo'] ?? $txPermiso['Permiso'] ?? $txPermiso['codigo'] ?? $txPermiso['permiso'] ?? null;
        }
    }

    $laPermisos = array_values(array_filter($laPermisos));

    $fnTienePermiso = function (string $tcPermiso) use ($laPermisos, $tcRol, $tcAdmin): bool {
        if (strcasecmp($tcRol, $tcAdmin) === 0) {
            return true;
        }

        return in_array('*', $laPermisos, true) || in_array($tcPermiso, $laPermisos, true);
    };

    $laMenu = [
        ['ruta' => 'tablero', 'texto' => 'Tablero', 'permiso' => 'tablero.ver'],
        ['ruta' => 'maquinas_celdas', 'texto' => 'Maquinas y celdas', 'permiso' => 'maquinas_celdas.ver'],
        ['ruta' => 'productos', 'texto' => 'Productos', 'permiso' => 'productos.ver'],
        ['ruta' => 'diseno_producto', 'texto' => 'Diseno de producto', 'permiso' => 'diseno_producto.ver'],
        ['ruta' => 'deposito', 'texto' => 'Deposito', 'permiso' => 'deposito.ver'],
        ['ruta' => 'ventas', 'texto' => 'Ventas', 'permiso' => 'ventas.ver'],
        ['ruta' => 'reposiciones', 'texto' => 'Reposiciones', 'permiso' => 'reposiciones.ver'],
        ['ruta' => 'alertas', 'texto' => 'Alertas', 'permiso' => 'alertas.ver'],
        ['ruta' => 'analitica', 'texto' => 'Analitica', 'permiso' => 'analitica.ver'],
    ];

    $laGruposHeader = [
        'tablero' => [
            ['texto' => 'Tablero', 'ruta' => 'tablero', 'permiso' => 'tablero.ver'],
        ],
        'maquinas' => [
            ['texto' => 'Maquinas', 'ruta' => 'maquinas_celdas', 'vista' => 'maquinas', 'permiso' => 'maquinas_celdas.ver'],
            ['texto' => 'Celdas', 'ruta' => 'maquinas_celdas', 'vista' => 'celdas', 'permiso' => 'maquinas_celdas.ver'],
        ],
        'productos' => [
            ['texto' => 'Productos', 'ruta' => 'productos', 'permiso' => 'productos.ver'],
            ['texto' => 'Diseno', 'ruta' => 'diseno_producto', 'permiso' => 'diseno_producto.ver'],
        ],
        'inventario' => [
            ['texto' => 'Deposito', 'ruta' => 'deposito', 'permiso' => 'deposito.ver'],
            ['texto' => 'Ventas', 'ruta' => 'ventas', 'permiso' => 'ventas.ver'],
            ['texto' => 'Reposiciones', 'ruta' => 'reposiciones', 'permiso' => 'reposiciones.ver'],
        ],
        'control' => [
            ['texto' => 'Alertas', 'ruta' => 'alertas', 'permiso' => 'alertas.ver'],
            ['texto' => 'Analitica', 'ruta' => 'analitica', 'permiso' => 'analitica.ver'],
        ],
    ];

    $laRouteToGroup = [
        'tablero' => 'tablero',
        'maquinas_celdas' => 'maquinas',
        'productos' => 'productos',
        'diseno_producto' => 'productos',
        'deposito' => 'inventario',
        'ventas' => 'inventario',
        'reposiciones' => 'inventario',
        'alertas' => 'control',
        'analitica' => 'control',
    ];

    $tcGrupoHeader = $laRouteToGroup[$tcRutaActual] ?? null;
    $laHeaderNav = [];

    if ($tcGrupoHeader && isset($laGruposHeader[$tcGrupoHeader])) {
        foreach ($laGruposHeader[$tcGrupoHeader] as $loItemHeader) {
            if (!$fnTienePermiso($loItemHeader['permiso'])) {
                continue;
            }

            $laParametros = [];
            if (($loItemHeader['ruta'] ?? '') === 'maquinas_celdas' && isset($loItemHeader['vista'])) {
                $laParametros['vista'] = $loItemHeader['vista'];
            }

            $tlActivo = request()->routeIs($loItemHeader['ruta']);
            if (($loItemHeader['ruta'] ?? '') === 'maquinas_celdas' && isset($loItemHeader['vista'])) {
                $tlActivo = $tlActivo && $tcVistaMaquinas === $loItemHeader['vista'];
            }

            $laHeaderNav[] = [
                'texto' => $loItemHeader['texto'],
                'url' => route($loItemHeader['ruta'], $laParametros),
                'activo' => $tlActivo,
            ];
        }
    }

    if (empty($laHeaderNav)) {
        foreach ($laMenu as $loItem) {
            if ($fnTienePermiso($loItem['permiso'])) {
                $laHeaderNav[] = [
                    'texto' => $loItem['texto'],
                    'url' => route($loItem['ruta']),
                    'activo' => request()->routeIs($loItem['ruta']),
                ];
            }
        }
    }

    $loConfigFrontend = [
        'urls' => [
            'acceso' => \Illuminate\Support\Facades\Route::has('acceso.formulario')
                ? route('acceso.formulario')
                : '/acceso',
            'accesoForzar' => \Illuminate\Support\Facades\Route::has('acceso.formulario')
                ? route('acceso.formulario', ['forzar' => 1])
                : '/acceso?forzar=1',
        ],
        'apiBaseUrl' => config('services.erp_api.url'),
        'apiTimeout' => (int) config('services.erp_api.timeout_ms', 15000),
        'apiTimezoneSource' => config('services.erp_api.timezone_source', config('app.timezone', 'America/La_Paz')),
        'apiTimezoneTarget' => config('services.erp_api.timezone_target', 'America/La_Paz'),
        'apiTimeOffsetMinutes' => config('services.erp_api.time_offset_minutes'),
        'websocket' => [
            'broadcaster' => env('VITE_ERP_WS_BROADCASTER', 'reverb'),
            'host' => env('VITE_ERP_WS_HOST', '127.0.0.1'),
            'port' => (int) env('VITE_ERP_WS_PORT', 8080),
            'scheme' => env('VITE_ERP_WS_SCHEME', 'http'),
            'key' => env('VITE_ERP_WS_KEY', ''),
            'cluster' => env('VITE_ERP_WS_CLUSTER', 'mt1'),
            'authEndpoint' => env('VITE_ERP_WS_AUTH_ENDPOINT', ''),
        ],
        'sesion' => [
            'token' => $loSesion['Token'] ?? null,
            'refreshToken' => $loSesion['RefreshToken'] ?? null,
            'rol' => $tcRol,
            'usuario' => $loSesion['Usuario'] ?? null,
            'empresaDefault' => $loSesion['EmpresaDefault'] ?? null,
            'permisos' => $laPermisos,
        ],
    ];

@endphp
<body data-page="@yield('page_key')" class="erp-fondo text-slate-100">
    <div class="min-h-screen">
        <header class="erp-header-principal">
            <div class="erp-header-logo">
                <span class="erp-logo-acento">my</span>GESTION ERP
            </div>
            <div class="erp-header-contexto-empresa">
                <label for="erp-header-empresa" class="sr-only">Empresa activa</label>
                <select id="erp-header-empresa" class="erp-header-select">
                    <option value="">Todas las empresas</option>
                </select>
            </div>
            <div class="erp-header-contexto-maquina">
                <label for="erp-header-maquina" class="sr-only">Maquina activa</label>
                <select id="erp-header-maquina" class="erp-header-select">
                    <option value="">Todas las maquinas</option>
                </select>
            </div>
            <nav class="erp-header-nav">
                @foreach ($laHeaderNav as $loNav)
                    <a href="{{ $loNav['url'] }}" class="{{ $loNav['activo'] ? 'erp-header-nav__activo' : '' }}">{{ $loNav['texto'] }}</a>
                @endforeach
            </nav>
            <div class="erp-header-acciones">
                <span class="erp-header-usuario">{{ $loSesion['Usuario'] ?? 'Usuario ERP' }}</span>
                <span class="erp-header-rol">Rol: {{ $tcRol }}</span>
                <form method="POST" action="{{ route('acceso.cerrar') }}">
                    @csrf
                    <button class="erp-header-salir" title="Cerrar sesion">Salir</button>
                </form>
            </div>
        </header>

        <div class="lg:grid lg:grid-cols-[240px_1fr]">
            <aside class="erp-sidebar">
                <div class="erp-sidebar-titulo">
                    <p>Menu principal</p>
                </div>
                <nav class="space-y-1 px-2 pb-3">
                    @foreach ($laMenu as $loItem)
                        @if ($fnTienePermiso($loItem['permiso']))
                            <a href="{{ route($loItem['ruta']) }}" class="erp-nav-item {{ request()->routeIs($loItem['ruta']) ? 'erp-nav-item--activo' : '' }}">
                                {{ $loItem['texto'] }}
                            </a>
                        @endif
                    @endforeach
                </nav>
            </aside>

            <div class="min-w-0">
                <header class="erp-header-contexto">
                    <div>
                        <h2 class="text-lg font-bold text-slate-800">@yield('title', 'Frontend ERP Vending')</h2>
                        <p class="text-xs text-slate-500">Operacion ERP Vending, estilo de escritorio administrativo</p>
                    </div>
                    <span class="erp-chip">Sesion activa</span>
                </header>

                <main class="erp-workspace">
                    @yield('content')
                </main>
            </div>
        </div>
    </div>

    <div id="erp-toast-container" class="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2"></div>
    <div id="erp-confirm-dialog" class="hidden"></div>
    <div id="erp-drawer-detalle" class="hidden"></div>

    <script>
        window.__ERP_FRONTEND_CONFIG__ = @json($loConfigFrontend);
    </script>
</body>
</html>
