<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$token_file = '/home/u586129197/.api_token';
$token = '';
if (file_exists($token_file)) {
    $token = trim(file_get_contents($token_file));
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.github.com/repos/Ajax1200/panthm/actions/runs?per_page=1");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, "PANTHM-Operations-Dashboard");

if (!empty($token)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: token $token",
        "Accept: application/vnd.github.v3+json"
    ]);
}

$output = curl_exec($ch);
curl_close($ch);

$data = json_decode($output, true);
if (isset($data['workflow_runs'][0])) {
    $run = $data['workflow_runs'][0];
    echo json_encode([
        'status' => 'success',
        'id' => $run['id'],
        'name' => $run['name'],
        'run_number' => $run['run_number'],
        'event' => $run['event'],
        'state' => $run['status'],
        'conclusion' => $run['conclusion'],
        'commit' => $run['head_commit']['message'],
        'author' => $run['head_commit']['author']['name'],
        'created_at' => $run['created_at'],
        'html_url' => $run['html_url']
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No workflow runs found'
    ]);
}
