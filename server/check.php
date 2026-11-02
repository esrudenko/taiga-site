<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : null;
if (!$config || ($_GET['key'] ?? '') === '' || !hash_equals((string) ($config['salt'] ?? ''), (string) $_GET['key'])) {
    http_response_code(404);
    exit;
}

$token = trim((string) ($config['telegram_token'] ?? ''));
echo 'PHP ' . PHP_VERSION . "\n";
echo 'curl: ' . (function_exists('curl_init') ? 'yes' : 'NO') . "\n";
echo 'mail(): ' . (function_exists('mail') ? 'yes' : 'NO') . "\n";
echo 'token format: ' . (preg_match('/^\d{6,12}:[\w-]{30,}$/', $token) ? 'ok' : 'WRONG (check spaces and quotes)') . "\n";
echo 'chat id: ' . (preg_match('/^-?\d+$/', trim((string) ($config['telegram_chat_id'] ?? ''))) ? 'ok' : 'WRONG') . "\n";

$curl = curl_init('https://api.telegram.org/bot' . $token . '/getMe');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 15]);
$raw = curl_exec($curl);
$error = curl_error($curl);
curl_close($curl);
$response = json_decode((string) $raw, true);
if ($error !== '') {
    echo "telegram connection: FAILED (curl: $error)\n";
} elseif (($response['ok'] ?? false) === true) {
    echo 'telegram connection: ok, bot @' . ($response['result']['username'] ?? '?') . "\n";
} else {
    echo 'telegram connection: reached, but API says: ' . ($response['description'] ?? 'no response') . "\n";
}

$log = sys_get_temp_dir() . '/taiga_last_error.txt';
echo 'last send error: ' . (is_file($log) ? trim((string) file_get_contents($log)) : 'none') . "\n";
