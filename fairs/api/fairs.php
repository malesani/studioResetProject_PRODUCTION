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
require_once __DIR__ . "/../obj/fairsObj.php";

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

    $method      = $_SERVER['REQUEST_METHOD'];
    $requestData = ($method === 'GET')
        ? $_GET
        : (json_decode(file_get_contents('php://input'), true) ?: []);

    if (empty($requestData['opt'])) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('fair.400.optionNotSet'),
            error: 'Option not set.'
        ));
        exit;
    }

    // setup fields from obj
    $fairBase        = new fairObjBase($authManager, $permsManager);
    $allFields       = $fairBase->get_allFields();
    $requiredFields  = $fairBase->get_requiredFields();   // ['name','start_date','end_date']
    $mutableFields   = $fairBase->get_mutableFields();    // senza PK/computed/timestamps
    // end setup

    $defaultOption = false;

    switch ($method) {
        case 'GET':
            switch ($requestData['opt']) {
                case 'fair_info':
                    if (empty($requestData['fair_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('fair.400.missingRequiredParameters'),
                            error: 'Missing parameter: fair_uid'
                        ));
                        break;
                    }

                    $obj  = new fairObj($authManager, $permsManager, (string)$requestData['fair_uid']);
                    $info = $obj->get_fairInfo();

                    $result = $info
                        ? ['success' => true, 'message' => 'fair.200.successRetrieveData', 'data' => $info]
                        : ['success' => false, 'message' => 'fair.400.errorRetrieveData', 'error' => 'Empty fair_info'];

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error:   $result['error'] ?? null,
                        data:    $result['data'] ?? null
                    ));
                    break;

                case 'fairs_list':
                    $listObj = new fairObjList($authManager, $permsManager);
                    $result  = $listObj->get_fairsList(
                        [
                            'search'     => $_GET['search']     ?? '',
                            'sector'     => $_GET['sector']     ?? '',
                            'active'     => $_GET['active']     ?? null,
                            'start_from' => $_GET['start_from'] ?? '',
                            'start_to'   => $_GET['start_to']   ?? '',
                            'end_from'   => $_GET['end_from']   ?? '',
                            'end_to'     => $_GET['end_to']     ?? '',
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

                case 'fairs_list_paginated':
                    $listObj = new fairObjList($authManager, $permsManager);
                    $result  = $listObj->get_fairsList(
                        [
                            'search'     => $_GET['search']     ?? '',
                            'sector'     => $_GET['sector']     ?? '',
                            'active'     => $_GET['active']     ?? null,
                            'start_from' => $_GET['start_from'] ?? '',
                            'start_to'   => $_GET['start_to']   ?? '',
                            'end_from'   => $_GET['end_from']   ?? '',
                            'end_to'     => $_GET['end_to']     ?? '',
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
                case 'update_fair':
                    if (empty($requestData['fair_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('fair.400.missingRequiredParameters'),
                            error: 'Missing: ["fair_uid"]'
                        ));
                        break;
                    }

                    // raccogli solo i campi mutabili presenti
                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj    = new fairObj($authManager, $permsManager, (string)$requestData['fair_uid']);
                    $result = $obj->set_fairInfo($newData);

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
                case 'create_fair':
                    // Required: name, start_date, end_date
                    $missing = array_diff($requiredFields, array_keys($requestData));
                    if (!empty($missing)) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('fair.400.missingRequiredParameters'),
                            error: 'Missing: ' . json_encode(array_values($missing))
                        ));
                        break;
                    }

                    // dataset valido: mutabili presenti (fair_uid viene generato server-side)
                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj    = new fairObj($authManager, $permsManager, null);
                    $result = $obj->insert_fair($newData);

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
                case 'fair_info':
                    if (empty($requestData['fair_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('fair.400.missingRequiredParameters'),
                            error: 'Missing parameter: fair_uid'
                        ));
                        break;
                    }
                    $obj = new fairObj($authManager, $permsManager, (string)$requestData['fair_uid']);
                    $res = $obj->delete_fair();

                    http_response_code($res['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $res['success'],
                        message: $trad->lang($res['success'] ? 'fair.200.deleted' : 'fair.fatalError'),
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
                'message' => $trad->lang('fair.405.methodNotAllowed'),
                'error'   => 'Method "' . $method . '" not allowed'
            ]);
    }

    if ($defaultOption) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('fair.400.invalidOption'),
            error: 'Option: ' . $method . ' - "' . $requestData['opt'] . '" invalid'
        ));
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode($reqResp->toArray(
        success: false,
        message: 'Internal Server FatalError',
        error: $e->getMessage()
    ));
}
ob_end_flush();
