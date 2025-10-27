<?php
// CORS and security headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

ob_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
http_response_code(500); // Default HTTP response

$srcPath = $_SERVER['DOCUMENT_ROOT'] ?: '/var/www/html';
require_once "$srcPath/auth/inclusions.php";
require_once "$srcPath/general_inclusions.php";

require_once __DIR__ . "/../obj/objectivesObj.php";

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

    $method = $_SERVER['REQUEST_METHOD'];
    $requestData = ($method === 'GET')
        ? $_GET
        : (json_decode(file_get_contents('php://input'), true) ?: []);

    if (empty($requestData['opt'])) {
        http_response_code(400);
        echo json_encode($authManager->responseArr([
            'success' => false,
            'message' => $trad->lang('objectives.400.optionNotSet'),
            'error'   => 'Option not set.'
        ]));
        exit;
    }

    $defaultOption = false;
    switch ($method) {
        case 'GET':
            switch ($requestData['opt']) {
                case 'objective_data':
                    if (empty($requestData['project_uid'])) {
                        http_response_code(400);
                        echo json_encode($authManager->responseArr([
                            'success' => false,
                            'message' => $trad->lang('objectives.400.missingRequiredParameters'),
                            'error'   => 'Missing parameter: project_uid'
                        ]));
                        break;
                    }

                    $obj  = new objectivesObj($authManager, $permsManager, $requestData['project_uid']);
                    $info = $obj->get_objectiveData();
                    http_response_code(200);
                    echo json_encode($authManager->responseArr([
                        'success' => true,
                        'message' => $trad->lang('objectives.200.successRetrieveData'),
                        'data'    => ['objective_data' => $info]
                    ]));
                    break;

                default:
                    $defaultOption = true;
                    break;
            }
            break;

        case 'PUT':
            switch ($requestData['opt']) {
                case 'objective_data':
                    // Verifica parametri obbligatori
                    $missing = array_diff(
                        ['project_uid', 'list_objective_uid'],
                        array_keys($requestData)
                    );
                    if ($missing) {
                        http_response_code(400);
                        echo json_encode($authManager->responseArr([
                            'success' => false,
                            'message' => $trad->lang('objectives.400.missingRequiredParameters'),
                            'error'   => 'Missing: ' . json_encode(array_values($missing))
                        ]));
                        break;
                    }

                    $obj  = new objectivesObj($authManager, $permsManager, $requestData['project_uid']);
                    $res = $obj->set_objectiveData($requestData['list_objective_uid']);

                    // build della risposta senza array_merge fallace
                    $base = [
                        'success' => $res['success'],
                        'message' => $trad->lang($res['message'])
                    ];

                    if ($res['success']) {
                        // in caso di successo includo i dati aggiornati
                        $extra = ['data' => ['objective_data' => $obj->get_objectiveData()]];
                        http_response_code(200);
                    } else {
                        // in caso di errore includo solo l'errore
                        $extra = ['error' => $res['error']];
                        http_response_code(400);
                    }

                    echo json_encode($authManager->responseArr(array_merge($base, $extra)));
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
                'message' => $trad->lang('objectives.405.methodNotAllowed'),
                'error'   => 'Method "' . $method . '" not allowed'
            ]);
    }

    if ($defaultOption) {
        http_response_code(400);
        echo json_encode($authManager->responseArr([
            'success' => false,
            'message' => $trad->lang('objectives.400.invalidOption'),
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
