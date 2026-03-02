<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acceso | Frontend ERP Vending</title>
    @php
        $tcFaviconUrl = request()->getBaseUrl() . '/favicon-vending.svg?v=20260302';
    @endphp
    <link rel="icon" type="image/svg+xml" href="{{ $tcFaviconUrl }}">
    <link rel="shortcut icon" type="image/svg+xml" href="{{ $tcFaviconUrl }}">
    <link rel="apple-touch-icon" href="{{ $tcFaviconUrl }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="erp-fondo min-h-screen">
    <header class="erp-header-principal">
        <div class="erp-header-logo">
            <span class="erp-logo-acento">my</span>GESTION ERP
        </div>
        <nav class="erp-header-nav">
            <span>Acceso</span>
            <span>ERP Vending</span>
        </nav>
        <div class="erp-header-acciones">
            <span class="erp-header-rol">Ambiente local</span>
        </div>
    </header>

    <main class="mx-auto flex min-h-[calc(100vh-49px)] max-w-5xl items-center px-4 py-8">
        <section class="grid w-full gap-6 lg:grid-cols-[1.2fr_1fr]">
            <article class="erp-panel">
                <p class="text-xs uppercase tracking-[0.2em] text-[#F28E1B]">ERP Vending</p>
                <h1 class="mt-2 text-3xl font-black leading-tight text-slate-800">Operacion de inventario para vending</h1>
                <p class="mt-3 text-sm text-slate-600">
                    Accede con tus credenciales para gestionar stock, reposiciones, reservas, ventas, alertas y analitica.
                </p>
            </article>

            <article class="erp-panel">
                <h2 class="text-2xl font-bold text-slate-900">Iniciar sesion</h2>
                <p class="mt-1 text-sm text-slate-600">Ingresa con tu usuario del ERP.</p>
                <p class="mt-1 text-xs text-slate-500">Usuario de pruebas: <strong>Vladimir</strong></p>

                @if ($errors->has('acceso'))
                    <div class="mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {{ $errors->first('acceso') }}
                    </div>
                @endif

                <form method="POST" action="{{ route('acceso.iniciar') }}" class="mt-5 space-y-3">
                    @csrf
                    <label class="block text-sm font-semibold text-slate-700">
                        Usuario
                        <input
                            name="Usuario"
                            value="{{ old('Usuario', 'Vladimir') }}"
                            required
                            autocomplete="username"
                            class="erp-input mt-1"
                            placeholder="usuario.erp"
                        >
                    </label>

                    <label class="block text-sm font-semibold text-slate-700">
                        Clave
                        <input
                            name="Clave"
                            type="password"
                            required
                            autocomplete="current-password"
                            class="erp-input mt-1"
                            placeholder="••••••••"
                        >
                    </label>

                    <button class="erp-btn erp-btn--primario w-full">Entrar al sistema</button>
                </form>
            </article>
        </section>
    </main>
</body>
</html>

