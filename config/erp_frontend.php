<?php

return [
    'rol_admin' => env('ERP_ROL_ADMIN', 'Admin'),

    'permisos_ruta' => [
        'tablero' => 'tablero.ver',
        'maquinas_celdas' => 'maquinas_celdas.ver',
        'productos' => 'productos.ver',
        'diseno_producto' => 'diseno_producto.ver',
        'deposito' => 'deposito.ver',
        'catalogos' => 'catalogos.ver',
        'stock' => 'stock.ver',
        'reservas' => 'reservas.ver',
        'ventas' => 'ventas.ver',
        'reposiciones' => 'reposiciones.ver',
        'usuarios' => 'usuarios.ver',
        'ubicaciones' => 'ubicaciones.ver',
        'catalogo_avanzado' => 'catalogo_avanzado.ver',
        'anuncios' => 'anuncios.ver',
        'mermas' => 'mermas.ver',
        'alertas' => 'alertas.ver',
        'reportes' => 'reportes.ver',
        'integracion_iot' => 'iot.ver',
        'analitica' => 'analitica.ver',
    ],
];
