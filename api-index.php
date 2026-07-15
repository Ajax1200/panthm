<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$backend_url = 'http://127.0.0.1:5000' . $_SERVER['REQUEST_URI'];

function queryBackend($url, $headers, $method, $body) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3); // 3s timeout

    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']) && $body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    $err = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    return [
        'response' => $response,
        'error' => $err,
        'header_size' => $info['header_size'],
        'http_code' => $info['http_code']
    ];
}

$headers = [];
foreach (getallheaders() as $key => $value) {
    if (strcasecmp($key, 'Host') !== 0) {
        $headers[] = "$key: $value";
    }
}

$body = null;
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
}

// 1. Initial attempt
$res = queryBackend($backend_url, $headers, $_SERVER['REQUEST_METHOD'], $body);

// 2. If it fails, trigger self-healing restart and retry
if ($res['error'] || $res['http_code'] >= 500) {
    // Start backend servers (if exec is enabled on host)
    if (function_exists('exec')) {
        @exec('bash /home/u586129197/keepalive.sh > /dev/null 2>&1 &');
    }
    
    // Wait 2.5 seconds for booting
    usleep(2500000);
    
    // Retry once
    $res = queryBackend($backend_url, $headers, $_SERVER['REQUEST_METHOD'], $body);
}

$response_headers = "";
$response_body = "";
if (!$res['error'] && $res['http_code'] < 500) {
    $response_headers = substr($res['response'], 0, $res['header_size']);
    $response_body = substr($res['response'], $res['header_size']);
    
    // If this is the blogs published request, cache the successful output as a static fallback
    if (strpos($_SERVER['REQUEST_URI'], '/api/blogs/published') !== false && !empty($response_body)) {
        @file_put_contents('/home/u586129197/domains/panthm.com/public_html/canvas/blogs-fallback.json', $response_body);
    }
} else {
    // 3. Fallback to cached static JSON if it still fails (for blogs endpoint only)
    if (strpos($_SERVER['REQUEST_URI'], '/api/blogs/published') !== false) {
        $fallback_file = '/home/u586129197/domains/panthm.com/public_html/canvas/blogs-fallback.json';
        if (file_exists($fallback_file)) {
            header("Content-Type: application/json; charset=utf-8");
            echo file_get_contents($fallback_file);
            exit;
        }
    }
}

if ($res['error']) {
    header("HTTP/1.1 503 Service Unavailable");
    echo "Proxy Error: " . $res['error'];
    exit;
}

foreach (explode("\r\n", $response_headers) as $hdr) {
    if (!empty($hdr) && strpos($hdr, 'Transfer-Encoding:') === false) {
        header($hdr, false);
    }
}

echo $response_body;
