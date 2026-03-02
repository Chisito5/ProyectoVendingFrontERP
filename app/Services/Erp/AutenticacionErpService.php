<?php

namespace App\Services\Erp;

use Illuminate\Support\Facades\Http;

/**
 * SYSCOOP
 * category: Service
 * package: App\Services\Erp
 * author: Vladimir Meriles Velasquez
 * fecha: 27-02-2026
 *
 * Servicio de autenticacion contra API ERP externa.
 */
class AutenticacionErpService
{
    /**
     * SYSCOOP
     * category: Service
     * package: App\Services\Erp
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: string $tcUsuario
     * param: string $tcClave
     * return: array
     *
     * Inicia sesion contra la API ERP y normaliza la respuesta.
     */
    public function IniciarSesion(string $tcUsuario, string $tcClave): array
    {
        try {
            $loRespuesta = $this->Cliente()->post('/auth/login', [
                'Usuario' => $tcUsuario,
                'Clave' => $tcClave,
            ]);

            return $this->NormalizarRespuesta($loRespuesta->status(), $loRespuesta->json(), 'No se pudo iniciar sesion en ERP.');
        } catch (\Throwable $loError) {
            return [
                'ok' => false,
                'mensaje' => 'No se pudo conectar con el backend ERP.',
                'datos' => null,
                'status' => 0,
                'errores' => [$loError->getMessage()],
            ];
        }
    }

    /**
     * SYSCOOP
     * category: Service
     * package: App\Services\Erp
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: string $tcToken
     * return: array
     *
     * Cierra sesion en API ERP cuando existe token.
     */
    public function CerrarSesion(string $tcToken): array
    {
        try {
            $loRespuesta = $this->ClienteConToken($tcToken)->post('/auth/logout');
            return $this->NormalizarRespuesta($loRespuesta->status(), $loRespuesta->json(), 'Sesion cerrada.');
        } catch (\Throwable $loError) {
            return [
                'ok' => false,
                'mensaje' => 'No se pudo notificar cierre de sesion al ERP.',
                'datos' => null,
                'status' => 0,
                'errores' => [$loError->getMessage()],
            ];
        }
    }

    /**
     * SYSCOOP
     * category: Service
     * package: App\Services\Erp
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * return: \Illuminate\Http\Client\PendingRequest
     *
     * Crea cliente base HTTP para API ERP.
     */
    protected function Cliente()
    {
        $tcBaseUrl = rtrim((string) config('services.erp_api.url'), '/');
        $tnTimeoutMs = (int) config('services.erp_api.timeout_ms', 15000);
        $tnTimeoutSegundos = max(1, (int) ceil($tnTimeoutMs / 1000));

        return Http::acceptJson()
            ->contentType('application/json')
            ->baseUrl($tcBaseUrl)
            ->timeout($tnTimeoutSegundos)
            ->asJson();
    }

    /**
     * SYSCOOP
     * category: Service
     * package: App\Services\Erp
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: string $tcToken
     * return: \Illuminate\Http\Client\PendingRequest
     *
     * Crea cliente con token Bearer.
     */
    protected function ClienteConToken(string $tcToken)
    {
        return $this->Cliente()->withToken($tcToken);
    }

    /**
     * SYSCOOP
     * category: Service
     * package: App\Services\Erp
     * author: Vladimir Meriles Velasquez
     * fecha: 27-02-2026
     * param: int $tnStatus
     * param: mixed $txPayload
     * param: string $tcMensajeDefecto
     * return: array
     *
     * Normaliza contrato uniforme de respuesta ERP.
     */
    protected function NormalizarRespuesta(int $tnStatus, $txPayload, string $tcMensajeDefecto): array
    {
        $loPayload = is_array($txPayload) ? $txPayload : [];

        return [
            'ok' => (bool) ($loPayload['Ok'] ?? ($tnStatus >= 200 && $tnStatus < 300)),
            'mensaje' => (string) ($loPayload['Mensaje'] ?? $tcMensajeDefecto),
            'datos' => $loPayload['Datos'] ?? null,
            'errores' => $loPayload['Errores'] ?? [],
            'meta' => $loPayload['Meta'] ?? null,
            'status' => $tnStatus,
        ];
    }
}
