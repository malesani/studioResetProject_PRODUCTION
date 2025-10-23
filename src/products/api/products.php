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
require_once __DIR__ . "/../obj/productsObj.php";

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
    $trad = new langClass($authManager);
    $reqResp = new RequestResponse($authManager);

    $method = $_SERVER['REQUEST_METHOD'];
    $requestData = ($method === 'GET')
        ? $_GET
        : (json_decode(file_get_contents('php://input'), true) ?: []);

    if (empty($requestData['opt'])) {
        http_response_code(400);
        echo json_encode($reqResp->toArray(
            $success = false,
            $message = $trad->lang('product.400.optionNotSet'),
            $error   = 'Option not set.'
        ));
        exit;
    }

    // setup fields from obj
    $productBase     = new productObjBase($authManager, $permsManager);
    $allFields       = $productBase->get_allFields();
    $requiredFields  = $productBase->get_requiredFields();   // ['art_code','name']
    $mutableFields   = $productBase->get_mutableFields();    // senza PK e timestamps
    // end setup

    $defaultOption = false;

    switch ($method) {
        case 'GET':
            switch ($requestData['opt']) {
                case 'product_info':
                    if (empty($requestData['art_code'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('product.400.missingRequiredParameters'),
                            error: 'Missing parameter: art_code'
                        ));
                        break;
                    }

                    $obj  = new productObj($authManager, $permsManager, $requestData['art_code']);
                    $info = $obj->get_productInfo();

                    if ($info) {
                        $result = [
                            'success' => true,
                            'message' => $trad->lang('product.200.successRetrieveData'),
                            'data' => $info
                        ];
                    } else {
                        $result = [
                            'success' => false,
                            'message' => $trad->lang('product.400.errorRetrieveData'),
                            'error' => 'Empty product_info'
                        ];
                    }

                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? null,
                        data: $result['data'] ?? null
                    ));
                    break;

                case 'products_list':
                    $listObj = new productObjList($authManager, $permsManager);
                    $result  = $listObj->get_productsList(
                        [
                            'search'       => $_GET['search']        ?? '',
                            'category'     => $_GET['category']      ?? '',
                            'subCategory'  => $_GET['subCategory']   ?? '',
                            'type'         => $_GET['type']          ?? '',
                            'supplier'     => $_GET['supplier']      ?? ''
                        ],
                        true
                    );
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($reqResp->toArray(
                        success: $result['success'],
                        message: $trad->lang($result['message']),
                        error: $result['error'] ?? null,
                        data: $result['data'] ?? null
                    ));
                    break;

                case 'products_list_paginated':
                    $listObj = new productObjList($authManager, $permsManager);
                    $result  = $listObj->get_productsList(
                        [
                            'search'       => $_GET['search']        ?? '',
                            'category'     => $_GET['category']      ?? '',
                            'subCategory'  => $_GET['subCategory']   ?? '',
                            'type'         => $_GET['type']          ?? '',
                            'supplier'     => $_GET['supplier']      ?? '',
                            'price_min'    => $_GET['price_min']     ?? '',
                            'price_max'    => $_GET['price_max']     ?? '',
                            'updated_from' => $_GET['updated_from']  ?? '',
                            'updated_to'   => $_GET['updated_to']    ?? ''
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

                case 'categoryTree':
                    $listObj = new productObjList($authManager, $permsManager);
                    $result  = $listObj->get_categoryTree();

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
                case 'update_product':
                    // Richiede SOLO la PK per sapere cosa aggiornare
                    if (empty($requestData['art_code'])) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('product.400.missingRequiredParameters'),
                            error: 'Missing: ["art_code"]'
                        ));
                        break;
                    }

                    // costruisci newData dai soli campi mutabili presenti
                    $newData = [];
                    foreach ($mutableFields as $f) {
                        if (array_key_exists($f, $requestData)) {
                            $newData[$f] = $requestData[$f];
                        }
                    }

                    $obj = new productObj($authManager, $permsManager, $requestData['art_code']);
                    $result = $obj->set_productInfo($newData);

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

        case 'POST':
            switch ($requestData['opt']) {
                case 'create_product':
                    // Insert: richiede art_code e name
                    $missing = array_diff($requiredFields, array_keys($requestData));
                    if ($missing) {
                        http_response_code(400);
                        echo json_encode($reqResp->toArray(
                            success: false,
                            message: $trad->lang('product.400.missingRequiredParameters'),
                            error: 'Missing: ' . json_encode(array_values($missing))
                        ));
                        break;
                    }

                    // costruisci dati validi: PK + mutabili presenti
                    $newData = ['art_code' => $requestData['art_code']];
                    foreach ($mutableFields as $f) {
                        if (isset($requestData[$f])) {
                            $newData[$f] = $requestData[$f];
                        }
                    }
                    // name deve esserci e non vuoto
                    $newData['name'] = $requestData['name'];

                    $obj = new productObj($authManager, $permsManager, null);
                    $result = $obj->insert_productInfo($newData);

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

        case 'DELETE':
            switch ($requestData['opt']) {
                case 'product_info':
                    if (empty($requestData['art_code'])) {
                        http_response_code(400);
                        echo json_encode($authManager->responseArr([
                            'success' => false,
                            'message' => $trad->lang('product.400.missingRequiredParameters'),
                            'error'   => 'Missing parameter: art_code'
                        ]));
                        break;
                    }
                    $obj = new productObj($authManager, $permsManager, $requestData['art_code']);
                    $res = $obj->delete_product();

                    http_response_code($res['success'] ? 200 : 400);
                    echo json_encode($authManager->responseArr(
                        $res['success']
                            ? ['success' => true, 'message' => $trad->lang('product.200.deleted')]
                            : ['success' => false, 'message' => $trad->lang('product.fatalError'), 'error' => $res['error']]
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
                'message' => $trad->lang('product.405.methodNotAllowed'),
                'error'   => 'Method "' . $method . '" not allowed'
            ]);
    }

    if ($defaultOption) {
        http_response_code(400);
        echo json_encode($authManager->responseArr([
            'success' => false,
            'message' => $trad->lang('product.400.invalidOption'),
            'error'   => 'Option: ' . $method . ' - "' . $requestData['opt'] . '" invalid'
        ]));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode($authManager->responseArr([
        'success' => false,
        'message' => 'Internal Server FatalError',
        'error'   => $e->getMessage()
    ]));
}
ob_end_flush();
