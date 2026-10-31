<?php
// backend/middleware/AuthMiddleware.php
require_once __DIR__ . '/../config/jwt.php';

function authenticateUser() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (empty($headers)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization header missing or unauthenticated access']);
        exit;
    }

    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        $jwtToken = $matches[1];
        $userData = verifyJwt($jwtToken);
        if ($userData) {
            return $userData;
        }
    }

    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired authentication token']);
    exit;
}
