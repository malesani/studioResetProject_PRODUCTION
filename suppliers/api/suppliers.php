<?php
// CORS & headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

ob_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
http_response_code(500);

$srcPath = $_SERVER['DOCUMENT_ROOT'] ?: '/var/www/html';
require_once "$srcPath/auth/inclusions.php";
require_once "$srcPath/general_inclusions.php";

// Object
require_once __DIR__ . "/../obj/suppliersObj.php";

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
            message: $trad->lang('supplier.400.optionNotSet'),
            error: 'Option not set.'
        ));
        exit;
    }

    // setup fields
    $base           = new supplierObjBase($authManager, $permsManager);
    $allFields      = $base->get_allFields();
    $mutableFields  = $base->get_mutableFields();
    $requiredFields = $base->get_requiredFields();

    $defaultOption = false;

    switch ($method) {
        case 'GET':
            switch ($requestData['opt']) {
                case 'supplier_info':
                    if (empty($requestData['supplier_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('supplier.400.missingRequiredParameters'),
                            error: 'Missing parameter: supplier_uid'
                        ));
                        break;
                    }

                    $obj  = new supplierObj($authManager, $permsManager, (string)$requestData['supplier_uid']);
                    $info = $obj->get_supplierInfo();

                    $result = $info
                        ? ['success' => true, 'message' => 'supplier.200.successRetrieveData', 'data' => $info]
                        : ['success' => false, 'message' => 'supplier.400.errorRetrieveData', 'error' => 'Empty supplier_info'];

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error:   $result['error'] ?? null,
                        data:    $result['data'] ?? null
                    ));
                    break;

                case 'suppliers_list':
                    $listObj = new supplierObjList($authManager, $permsManager);
                    $result  = $listObj->get_suppliersList(
                        [
                            'search' => $_GET['search'] ?? '',
                            'region' => $_GET['region'] ?? '',
                            'state'  => $_GET['state']  ?? '',
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

                case 'suppliers_list_paginated':
                    $listObj = new supplierObjList($authManager, $permsManager);
                    $result  = $listObj->get_suppliersList(
                        [
                            'search' => $_GET['search'] ?? '',
                            'region' => $_GET['region'] ?? '',
                            'state'  => $_GET['state']  ?? '',
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

        case 'POST':
            switch ($requestData['opt']) {
                case 'create_supplier':
                    $missing = array_diff($requiredFields, array_keys($requestData));
                    if (!empty($missing)) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('supplier.400.missingRequiredParameters'),
                            error: 'Missing: ' . json_encode(array_values($missing))
                        ));
                        break;
                    }

                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj    = new supplierObj($authManager, $permsManager, null);
                    $result = $obj->insert_supplier($newData);

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
                case 'update_supplier':
                    if (empty($requestData['supplier_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('supplier.400.missingRequiredParameters'),
                            error: 'Missing: ["supplier_uid"]'
                        ));
                        break;
                    }

                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj    = new supplierObj($authManager, $permsManager, (string)$requestData['supplier_uid']);
                    $result = $obj->set_supplierInfo($newData);

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
                case 'supplier_info':
                    if (empty($requestData['supplier_uid'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('supplier.400.missingRequiredParameters'),
                            error: 'Missing parameter: supplier_uid'
                        ));
                        break;
                    }

                    $obj = new supplierObj($authManager, $permsManager, (string)$requestData['supplier_uid']);
                    $res = $obj->delete_supplier();

                    http_response_code($res['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $res['success'],
                        message: $trad->lang($res['success'] ? 'supplier.200.deleted' : 'supplier.fatalError'),
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
                'message' => $trad->lang('supplier.405.methodNotAllowed'),
                'error'   => 'Method "' . $method . '" not allowed'
            ]);
    }

    if ($defaultOption) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('supplier.400.invalidOption'),
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
