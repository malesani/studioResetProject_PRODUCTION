<?php
// CORS and security headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");


ob_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");


http_response_code(500);        // Default HTTP Response :  500 (Internal Server Error)


require_once "../inclusions.php";

try {
    $data = [];

    $authManager = new authManager();

    if ($authManager->check_isProfileLoaded()) {
        $permsManager = new permsManager($authManager);

        switch ($_SERVER['REQUEST_METHOD']) {

            case "GET":

                $pagesManager = new pagesManager($authManager, $permsManager);
                $data['sideBar_menuItems'] = $pagesManager->compute_sideBar_menuItems();
        
                if (true) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'pages.200.successRetriveData',
                        'data' => $data,
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'pages.400.errorRetriveData',
                        'error' => 'TEST ERROR'
                    ]);
                }
                
                break;


            default:

                http_response_code(405);        // 405 ( Method Not Allowed )
                echo json_encode([
                    'success' => false,
                    'message' => 'pages.405.methodNotAllowed',
                    'error'   => 'Method: "'.$_SERVER['REQUEST_METHOD'].'" are not allowed',
                ]);

                break;
        }

    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'pages.401.invalidOrExpiredToken',
            'error' => 'Invalid or Expired session!',
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);    // 500 ( Internal Server Error )
    echo json_encode([
        'success' => false,
        'message' => 'pages.500.internalServerFatalError',
        'error'   => $e->getMessage()
    ]);
}


ob_end_flush();
?>
