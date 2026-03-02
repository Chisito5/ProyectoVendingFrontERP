<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendRoutesTest extends TestCase
{
    public function test_root_redirects_to_tablero(): void
    {
        $this->get('/')->assertRedirect('/tablero');
    }

    public function test_guest_is_redirected_to_acceso_on_protected_routes(): void
    {
        $this->get('/tablero')->assertRedirect('/acceso');
    }

    public function test_frontend_pages_return_successful_response_with_admin_session(): void
    {
        $taSesion = [
            'Token' => 'token-prueba',
            'RefreshToken' => 'refresh-prueba',
            'Rol' => 'Admin',
            'Permisos' => ['*'],
            'Usuario' => 'qa',
        ];

        $routes = [
            '/tablero',
            '/maquinas-celdas',
            '/productos',
            '/diseno-producto',
            '/deposito',
            '/catalogos',
            '/stock',
            '/reservas',
            '/ventas',
            '/reposiciones',
            '/usuarios',
            '/ubicaciones',
            '/catalogo-avanzado',
            '/anuncios',
            '/mermas',
            '/alertas',
            '/reportes',
            '/integracion-iot',
            '/analitica',
            '/sin-acceso',
        ];

        foreach ($routes as $route) {
            $this->withSession(['erp_sesion' => $taSesion])->get($route)->assertStatus(200);
        }
    }
}
