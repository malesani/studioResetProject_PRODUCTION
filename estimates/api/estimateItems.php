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

// Objects
require_once __DIR__ . "/../obj/estimateItemsObj.php";

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
    $trad    = new langClass($authManager);
    $reqResp = new RequestResponse($authManager);

    $method      = $_SERVER['REQUEST_METHOD'];
    $requestData = ($method === 'GET')
        ? $_GET
        : (json_decode(file_get_contents('php://input'), true) ?: []);

    if (empty($requestData['opt'])) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('estimateItem.400.optionNotSet'),
            error: 'Option not set.'
        ));
        exit;
    }

    // Setup fields from obj
    $baseObj         = new estimateItemObjBase($authManager, $permsManager);
    $mutableFields   = $baseObj->get_mutableFields();     // senza PK, company_uid, timestamps, *_total esclusi
    $requiredCreate  = $baseObj->get_requiredCreate();    // ['preventivo_uid','art_code','name']
    // end setup

    $defaultOption = false;

    switch ($method) {
        case 'GET':
            switch ($requestData['opt']) {
                case 'estimate_item_info':
                    if (empty($requestData['item_id'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimateItem.400.missingRequiredParameters'),
                            error: 'Missing parameter: item_id'
                        ));
                        break;
                    }
                    $obj  = new estimateItemObj($authManager, $permsManager, (int)$requestData['item_id']);
                    $info = $obj->get_itemInfo();

                    $result = $info
                        ? ['success' => true, 'message' => 'estimateItem.200.successRetrieveData', 'data' => $info]
                        : ['success' => false, 'message' => 'estimateItem.400.errorRetrieveData', 'error' => 'Empty item_info'];

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? null,
                        data: $result['data'] ?? null
                    ));
                    break;

                case 'estimate_items_list':
                    $listObj = new estimateItemObjList($authManager, $permsManager);
                    $result  = $listObj->get_itemsList(
                        [
                            'preventivo_uid' => $_GET['preventivo_uid'] ?? '',
                            'search'         => $_GET['search']        ?? '',
                            'category'       => $_GET['category']      ?? '',
                            'subCategory'    => $_GET['subCategory']   ?? '',
                            'type'           => $_GET['type']          ?? '',
                            'supplier'       => $_GET['supplier']      ?? '',
                            'FP'             => $_GET['FP']            ?? null,
                            'N'              => $_GET['N']             ?? null,
                            'V'              => $_GET['V']             ?? null,
                            'R'              => $_GET['R']             ?? null,
                        ],
                        true // extractAll
                    );

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? null,
                        data: $result['data'] ?? null
                    ));
                    break;

                case 'estimate_items_list_paginated':
                    $listObj = new estimateItemObjList($authManager, $permsManager);
                    $result  = $listObj->get_itemsList(
                        [
                            'preventivo_uid' => $_GET['preventivo_uid'] ?? '',
                            'search'         => $_GET['search']        ?? '',
                            'category'       => $_GET['category']      ?? '',
                            'subCategory'    => $_GET['subCategory']   ?? '',
                            'type'           => $_GET['type']          ?? '',
                            'supplier'       => $_GET['supplier']      ?? '',
                            'FP'             => $_GET['FP']            ?? null,
                            'N'              => $_GET['N']             ?? null,
                            'V'              => $_GET['V']             ?? null,
                            'R'              => $_GET['R']             ?? null,
                        ],
                        false,
                        (int)($_GET['page']     ?? 1),
                        (int)($_GET['per_page'] ?? 25)
                    );

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? null,
                        data: $result['data'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'PUT':
            switch ($requestData['opt']) {
                case 'update_estimate_item':
                    if (empty($requestData['item_id'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimateItem.400.missingRequiredParameters'),
                            error: 'Missing: ["item_id"]'
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
                    // quantity può essere 0/empty string -> consenti null esplicito
                    if (array_key_exists('quantity', $requestData)) {
                        $newData['quantity'] = $requestData['quantity'];
                    }

                    $obj    = new estimateItemObj($authManager, $permsManager, (int)$requestData['item_id']);
                    $result = $obj->set_itemInfo($newData);

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? ($result['warning'] ?? null),
                        data: $result['data'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'POST':
            switch ($requestData['opt']) {
                case 'create_estimate_item':
                    // Required: preventivo_uid, art_code, name
                    $missing = array_diff($requiredCreate, array_keys($requestData));
                    if (!empty($missing)) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimateItem.400.missingRequiredParameters'),
                            error: 'Missing: ' . json_encode(array_values($missing))
                        ));
                        break;
                    }

                    // dataset valido: required + mutabili presenti (+ quantity)
                    $newData = [
                        'preventivo_uid' => $requestData['preventivo_uid'],
                        'art_code'       => $requestData['art_code'],
                        'name'           => $requestData['name'],
                    ];
                    if (array_key_exists('quantity', $requestData)) {
                        $newData['quantity'] = $requestData['quantity'];
                    }
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj    = new estimateItemObj($authManager, $permsManager, null);
                    $result = $obj->insert_item($newData);

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? null,
                        data: $result['data'] ?? null
                    ));
                    break;


                case 'bulk_replace_estimate_items':
                    if (empty($requestData['preventivo_uid']) || !isset($requestData['items']) || !is_array($requestData['items'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimateItem.400.missingRequiredParameters'),
                            error: 'Missing or invalid parameters: "preventivo_uid" and "items" (must be an array) are required.'
                        ));
                        break;
                    }

                    // Normalizzazione minima: rimuovi eventuali chiavi vietate passate dal client
                    foreach ($requestData['items'] as &$it) {
                        unset(
                            $it['item_id'],
                            $it['company_uid'],
                            $it['preventivo_uid'],
                            $it['created_at'],
                            $it['updated_at']
                        );
                    }
                    unset($it);

                    $dryRun       = isset($requestData['dry_run']) ? (bool)$requestData['dry_run'] : false;

                    $listObj = new estimateItemObjList($authManager, $permsManager);
                    $result  = $listObj->bulkReplaceByDeleteInsert(
                        $requestData['preventivo_uid'],
                        $requestData['items'],
                        $dryRun
                    );

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? ($result['warning'] ?? null),
                        data: $result['data'] ?? null
                    ));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'DELETE':
            switch ($requestData['opt']) {
                case 'delete_estimate_item':
                    if (empty($requestData['item_id'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('estimateItem.400.missingRequiredParameters'),
                            error: 'Missing parameter: item_id'
                        ));
                        break;
                    }

                    $obj = new estimateItemObj($authManager, $permsManager, (int)$requestData['item_id']);
                    $res = $obj->delete_item();

                    http_response_code($res['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $res['success'],
                        message: $trad->lang($res['success'] ? 'estimateItem.200.deleted' : 'estimateItem.fatalError'),
                        error: $res['error'] ?? null
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
                'message' => $trad->lang('estimateItem.405.methodNotAllowed'),
                'error'   => 'Method "' . $method . '" not allowed'
            ]);
    }

    if ($defaultOption) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            success: false,
            message: $trad->lang('estimateItem.400.invalidOption'),
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
