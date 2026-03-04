<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ERP Vending | Inicio</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="erp-fondo">
    <main class="erp-bienvenida">
        <section class="erp-bienvenida-card">
            <header class="erp-bienvenida-header">
                <h1 class="erp-bienvenida-titulo">
                    <span class="erp-logo-acento">my</span>GESTION ERP
                </h1>
                <p class="erp-bienvenida-subtitulo">Frontend operativo de vending con tableros, inventario y transacciones.</p>
            </header>

            <div class="erp-bienvenida-grid">
                <article class="erp-bienvenida-item">
                    <h2>Acceso</h2>
                    <p>Ingreso centralizado con sesion ERP y control de permisos por modulo.</p>
                </article>
                <article class="erp-bienvenida-item">
                    <h2>Operacion</h2>
                    <p>Gestion de maquinas, productos, stock, ventas, reposiciones y alertas.</p>
                </article>
                <article class="erp-bienvenida-item">
                    <h2>Analitica</h2>
                    <p>Indicadores ejecutivos, ranking y seguimiento de rendimiento operativo.</p>
                </article>
            </div>

            <div class="erp-bienvenida-acciones">
                <a class="erp-btn erp-btn--primario" href="{{ route('acceso.formulario') }}">Ir a acceso</a>
                <a class="erp-btn erp-btn--secundario" href="{{ route('tablero') }}">Ir a tablero</a>
            </div>
        </section>
    </main>
</body>
</html>
