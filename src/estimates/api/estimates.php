<?php
// CORS and security headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

ob_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
http_response_code(500); // Default HTTP response

$srcPath = $_SERVER['DOCUMENT_ROOT'] ?: '/var/www/html';
require_once "$srcPath/auth/inclusions.php";
require_once "$srcPath/general_inclusions.php";

// Object
require_once __DIR__ . "/../obj/estimatesObj.php";

try {
    $authManager = new authManager();
    if (!$authManager->check_isProfileLoaded()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or Expired session!',
            'error'   => 'Invalid or Expired session!'
        ]);
        exit;
    }

    $permsManager = new permsManager($authManager);
    $trad   = new langClass($authManager);
    $reqResp= new RequestResponse($authManager);

    $method = $_SERVER['REQUEST_METHOD'];
    $requestData = ($method === 'GET')
        ? $_GET
        : (json_decode(file_get_contents('php://input'), true) ?: []);

    if (empty($requestData['opt'])) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('estimate.400.optionNotSet'),
            error: 'Option not set.'
        ));
        exit;
    }

    // setup fields from obj
    $estimateBase    = new estimateObjBase($authManager, $permsManager);
    $allFields       = $estimateBase->get_allFields();
    $mutableFields   = $estimateBase->get_mutableFields();
    $requiredCreate  = $estimateBase->get_requiredCreate();
    // end setup

    $defaultOption = false;

    switch ($method) {
        case 'GET':
            switch ($requestData['opt']) {
                case 'estimate_info':
                    if (empty($requestData['preventivo_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimate.400.missingRequiredParameters'),
                            error: 'Missing parameter: preventivo_uid'
                        ));
                        break;
                    }
                    $obj  = new estimateObj($authManager, $permsManager, $requestData['preventivo_uid']);
                    $info = $obj->get_estimateInfo();

                    $ok = !empty($info);
                    http_response_code($ok ? 200 : 404);
                    echo json_encode($reqResp->toArray(
                        success: $ok,
                        message: $trad->lang($ok ? 'estimate.200.successRetrieveData' : 'estimate.400.errorRetrieveData'),
                        error: $ok ? null : 'Empty estimate_info',
                        data: $ok ? $info : null
                    ));
                    break;

                case 'estimates_list':
                    $listObj = new estimateObjList($authManager, $permsManager);
                    $result  = $listObj->get_estimatesList(
                        [
                            'search'      => $_GET['search']       ?? '',
                            'stato'       => $_GET['stato']        ?? '',
                            'tipo'        => $_GET['tipo']         ?? '',
                            'project_uid' => $_GET['project_uid']  ?? ''
                        ],
                        true
                    );
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error:   $result['error'] ?? null,
                        data:    $result['data'] ?? null
                    ));
                    break;

                case 'estimates_list_paginated':
                    $listObj = new estimateObjList($authManager, $permsManager);
                    $result  = $listObj->get_estimatesList(
                        [
                            'search'      => $_GET['search']       ?? '',
                            'stato'       => $_GET['stato']        ?? '',
                            'tipo'        => $_GET['tipo']         ?? '',
                            'project_uid' => $_GET['project_uid']  ?? ''
                        ],
                        false,
                        (int)($_GET['page']     ?? 1),
                        (int)($_GET['per_page'] ?? 25)
                    );
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error:   $result['error'] ?? null,
                        data:    $result['data'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'PUT':
            switch ($requestData['opt']) {
                case 'update_estimate':
                    if (empty($requestData['preventivo_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimate.400.missingRequiredParameters'),
                            error: 'Missing: ["preventivo_uid"]'
                        ));
                        break;
                    }

                    // Mantieni solo i campi mutabili presenti nel payload
                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj = new estimateObj($authManager, $permsManager, $requestData['preventivo_uid']);
                    $result = $obj->set_estimateInfo($newData);

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error:   $result['error'] ?? null,
                        data:    $result['data'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'POST':
            switch ($requestData['opt']) {
                case 'create_estimate':
                    // check required (server-side)
                    $missing = array_diff($requiredCreate, array_keys($requestData));
                    if ($missing) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimate.400.missingRequiredParameters'),
                            error: 'Missing: ' . json_encode(array_values($missing))
                        ));
                        break;
                    }

                    // prendi i campi validi dalla whitelist
                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj    = new estimateObj($authManager, $permsManager, null);
                    $result = $obj->insert_estimate($newData);

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error:   $result['error'] ?? null,
                        data:    $result['data'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'DELETE':
            switch ($requestData['opt']) {
                case 'estimate_info': // delete by preventivo_uid (coerente con esempio)
                    if (empty($requestData['preventivo_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimate.400.missingRequiredParameters'),
                            error: 'Missing parameter: preventivo_uid'
                        ));
                        break;
                    }
                    $obj = new estimateObj($authManager, $permsManager, $requestData['preventivo_uid']);
                    $res = $obj->delete_estimate();

                    http_response_code($res['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $res['success'],
                        message: $trad->lang($res['success'] ? 'estimate.200.deleted' : 'estimate.fatalError'),
                        error:   $res['error'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => $trad->lang('estimate.405.methodNotAllowed'),
                'error'   => 'Method "' . $method . '" not allowed'
            ]);
    }

    if ($defaultOption) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('estimate.400.invalidOption'),
            error: 'Option: ' . $method . ' - "' . $requestData['opt'] . '" invalid'
        ));
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Server FatalError',
        'error'   => $e->getMessage()
    ]);
}

ob_end_flush();
