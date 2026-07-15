<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$api_running = false;
$fp = @fsockopen('127.0.0.1', 5000, $errno, $errstr, 1);
if ($fp) {
    fclose($fp);
    $api_running = true;
}

echo json_encode([
    'status' => $api_running ? 'success' : 'offline',
    'message' => $api_running ? 'API is active' : 'API is offline'
]);
