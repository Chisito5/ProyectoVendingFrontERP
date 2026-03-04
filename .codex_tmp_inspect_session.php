<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$s = Illuminate\Support\Facades\DB::table('sessions')->orderByDesc('last_activity')->first();
if (!$s) {
    echo "NO_SESIONES\n";
    exit(0);
}

echo "SID=" . $s->id . "\n";
$payload = @unserialize(base64_decode($s->payload));
if (!is_array($payload)) {
    echo "NO_PARSE\n";
    exit(0);
}

echo "KEYS=" . implode(',', array_keys($payload)) . "\n";
if (!isset($payload['erp_sesion'])) {
    echo "NO_ERP_SESION\n";
    exit(0);
}

$erpRaw = $payload['erp_sesion'];
$erp = @unserialize($erpRaw);
if (!is_array($erp)) {
    echo "ERP_RAW_TYPE=" . gettype($erpRaw) . "\n";
    exit(0);
}

echo "ERP_KEYS=" . implode(',', array_keys($erp)) . "\n";
$token = (string)($erp['Token'] ?? '');
echo "TOKEN_PREFIX=" . substr($token, 0, 24) . "\n";
