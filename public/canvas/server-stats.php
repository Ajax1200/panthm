<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Disk Telemetry
$disk_total = disk_total_space("/");
$disk_free = disk_free_space("/");
$disk_used = $disk_total - $disk_free;
$disk_percentage = round(($disk_used / $disk_total) * 100, 1);

// Memory Telemetry
$mem_total = 0;
$mem_percentage = 0;
if (file_exists('/proc/meminfo')) {
    $data = file_get_contents('/proc/meminfo');
    preg_match('/MemTotal:\s+(\d+)/', $data, $matches_total);
    preg_match('/MemAvailable:\s+(\d+)/', $data, $matches_avail);
    if (isset($matches_total[1]) && isset($matches_avail[1])) {
        $mem_total = $matches_total[1] * 1024;
        $mem_avail = $matches_avail[1] * 1024;
        $mem_used = $mem_total - $mem_avail;
        $mem_percentage = round(($mem_used / $mem_total) * 100, 1);
    }
}

// Load Average
$load = [0, 0, 0];
if (function_exists('sys_getloadavg')) {
    $load = sys_getloadavg();
}

echo json_encode([
    'status' => 'success',
    'disk' => [
        'total' => $disk_total,
        'free' => $disk_free,
        'used' => $disk_used,
        'percentage' => $disk_percentage
    ],
    'memory' => [
        'total' => $mem_total,
        'percentage' => $mem_percentage
    ],
    'load_avg' => $load
]);
