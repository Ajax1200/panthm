<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Check if CMS API is running (port 5000)
$api_running = false;
$fp = @fsockopen('127.0.0.1', 5000, $errno, $errstr, 1);
if ($fp) {
    fclose($fp);
    $api_running = true;
}

// Check if Dashboard is running (port 3000)
$dashboard_running = false;
$fp = @fsockopen('127.0.0.1', 3000, $errno, $errstr, 1);
if ($fp) {
    fclose($fp);
    $dashboard_running = true;
}

$restarted = false;
if (!$api_running || !$dashboard_running) {
    // Execute keepalive script to restart backend processes (if exec is enabled on host)
    if (function_exists('exec')) {
        @exec('bash /home/u586129197/keepalive.sh > /dev/null 2>&1 &');
        $restarted = true;
    }
}

echo json_encode([
    'status' => 'success',
    'api_running' => $api_running,
    'dashboard_running' => $dashboard_running,
    'triggered_restart' => $restarted
]);
