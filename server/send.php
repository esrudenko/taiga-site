<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply(bool $ok, int $status = 200, string $error = ''): void
{
    http_response_code($status);
    echo json_encode($error === '' ? ['ok' => $ok] : ['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    reply(false, 500, 'Server is not configured');
}
$config = require $configFile;

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['allowed_origins'] ?? [], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    reply(true);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(false, 405, 'Method not allowed');
}

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) {
    reply(false, 400, 'Bad request');
}

if (trim((string) ($data['website'] ?? '')) !== '' || (int) ($data['elapsed'] ?? 0) < 3000) {
    reply(true);
}

$clean = static fn ($value, int $max): string =>
    mb_substr(trim(preg_replace('/\s+/u', ' ', (string) ($value ?? ''))), 0, $max);

$name = $clean($data['name'] ?? '', 60);
$contact = $clean($data['contact'] ?? '', 100);
$message = mb_substr(trim((string) ($data['message'] ?? '')), 0, 1000);
$page = $clean($data['page'] ?? '', 100);
$methods = ['phone' => 'Звонок', 'telegram' => 'Telegram', 'whatsapp' => 'WhatsApp', 'email' => 'Email'];
$method = $methods[$data['method'] ?? ''] ?? null;

if (($data['consent'] ?? false) !== true) {
    reply(false, 400, 'No consent');
}
if (mb_strlen($name) < 2 || mb_strlen($contact) < 3 || $method === null) {
    reply(false, 400, 'Missing fields');
}

$limitFile = sys_get_temp_dir() . '/taiga_' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ($config['salt'] ?? ''));
$recent = array_filter(
    is_file($limitFile) ? (array) json_decode((string) file_get_contents($limitFile), true) : [],
    static fn ($time) => $time > time() - 600
);
if (count($recent) >= 5) {
    reply(false, 429, 'Too many requests');
}
$recent[] = time();
file_put_contents($limitFile, json_encode(array_values($recent)), LOCK_EX);

$text = implode("\n", [
    'Новая заявка с сайта TAIGA',
    '',
    'Имя: ' . $name,
    'Связаться: ' . $method . ', ' . $contact,
    'Сообщение: ' . ($message !== '' ? $message : '—'),
    'Страница: ' . $page,
    'Время: ' . (new DateTime('now', new DateTimeZone('Asia/Almaty')))->format('d.m.Y H:i'),
]);

$logFile = sys_get_temp_dir() . '/taiga_last_error.txt';

$sentToTelegram = false;
$telegramError = 'not configured';
if (!empty($config['telegram_token']) && !empty($config['telegram_chat_id'])) {
    $curl = curl_init('https://api.telegram.org/bot' . trim($config['telegram_token']) . '/sendMessage');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => ['chat_id' => trim((string) $config['telegram_chat_id']), 'text' => $text],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 15,
    ]);
    $raw = curl_exec($curl);
    $curlError = curl_error($curl);
    curl_close($curl);
    $response = json_decode((string) $raw, true);
    $sentToTelegram = ($response['ok'] ?? false) === true;
    $telegramError = $sentToTelegram ? '' : ($curlError !== '' ? 'curl: ' . $curlError : 'api: ' . ($response['description'] ?? 'no response'));
}

if (!empty($config['email_to']) && !empty($config['email_from'])) {
    $headers = implode("\r\n", [
        'From: TAIGA <' . $config['email_from'] . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта TAIGA: ' . $name) . '?=';
    @mail($config['email_to'], $subject, $text, $headers);
}

if ($sentToTelegram) {
    reply(true);
}
file_put_contents($logFile, date('c') . ' telegram ' . $telegramError . "\n", LOCK_EX);
reply(false, 502, 'Could not deliver');
