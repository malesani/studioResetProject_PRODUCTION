<?php
declare(strict_types=1);

// CORS + sicurezza
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json");
http_response_code(500);

$srcPath = $_SERVER['DOCUMENT_ROOT'] ?: '/var/www/html';
require_once "$srcPath/auth/inclusions.php";
require_once "$srcPath/general_inclusions.php";
require_once "$srcPath/imports/obj/SuppliersImportService.php";

try {
    $auth = new authManager();
    if (!$auth->check_isProfileLoaded()) {
        http_response_code(401);
        echo json_encode(['success'=>false,'message'=>'Invalid session','error'=>'Auth required']); exit;
    }
    $perms = new permsManager($auth);
    $trad  = new langClass($auth);
    $req   = new RequestResponse($auth);

    $method = $_SERVER['REQUEST_METHOD'];
    $raw    = file_get_contents('php://input');
    $json   = $raw ? (json_decode($raw, true) ?: []) : [];
    $opt    = $_GET['opt'] ?? $_POST['opt'] ?? ($json['opt'] ?? null);

    if (!$opt) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Option not set']); exit; }

    $svc = new SuppliersImportService($auth, $perms);

    // Upload CSV / TXT / XML (e XLSX opzionale se lo abiliti nel service)
    if ($method === 'POST' && $opt === 'upload_file') {
        $delimiter = $_POST['delimiter'] ?? ';';          // per CSV/TXT
        $hasHeader = (($_POST['has_header'] ?? '1') === '1');
        $encoding  = $_POST['encoding'] ?? 'UTF-8';
        $file      = $_FILES['file'] ?? null;

        if (!$file) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'File required']); exit; }

        $res = $svc->handleUpload($file, $delimiter, $hasHeader, $encoding);
        http_response_code($res['success'] ? 200 : 400);
        echo json_encode($res); exit;
    }

    // Esecuzione (dry-run o commit) su job salvato
    if ($method === 'POST' && $opt === 'run') {
        $payload = $json ?: $_POST;
        $res = $svc->handleRun($payload);
        http_response_code($res['success'] ? 200 : 400);
        echo json_encode($res); exit;
    }

    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'Invalid option']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Internal error','error'=>$e->getMessage()]);
}
