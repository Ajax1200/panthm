<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$lines = 15;
$api_log_path = '/home/u586129197/domains/panthm.com/nodejs/api/console.log';
$dashboard_log_path = '/home/u586129197/domains/panthm.com/nodejs/dashboard/console.log';

function getTail($file, $num_lines) {
    if (!file_exists($file)) return [];
    // Efficiently tail files
    $handle = fopen($file, "r");
    $linecounter = $num_lines;
    $pos = -2;
    $beginning = false;
    $text = [];
    while ($linecounter > 0) {
        $t = " ";
        while ($t != "\n") {
            if (fseek($handle, $pos, SEEK_END) == -1) {
                $beginning = true;
                break;
            }
            $t = fgetc($handle);
            $pos--;
        }
        $linecounter--;
        if ($beginning) {
            rewind($handle);
        }
        $text[] = fgets($handle);
        if ($beginning) break;
    }
    fclose($handle);
    return array_filter(array_map('trim', array_reverse($text)));
}

$api_logs = getTail($api_log_path, $lines);
$dashboard_logs = getTail($dashboard_log_path, $lines);

$combined = [];
foreach ($api_logs as $log) {
    if (empty($log)) continue;
    $combined[] = [
        'source' => 'CMS_API',
        'message' => $log,
        'timestamp' => date('H:i:s')
    ];
}
foreach ($dashboard_logs as $log) {
    if (empty($log)) continue;
    $msg = $log;
    $time = date('H:i:s');
    if (strpos($log, '{') === 0) {
        $json = json_decode($log, true);
        if ($json && isset($json['message'])) {
            $msg = $json['message'];
            if (isset($json['timestamp'])) {
                $time = date('H:i:s', strtotime($json['timestamp']));
            }
        }
    }
    $combined[] = [
        'source' => 'CAMPAIGN_MANAGER',
        'message' => $msg,
        'timestamp' => $time
    ];
}

echo json_encode([
    'status' => 'success',
    'logs' => $combined
]);
