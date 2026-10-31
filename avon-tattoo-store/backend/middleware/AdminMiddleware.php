<?php
// backend/middleware/AdminMiddleware.php
require_once __DIR__ . '/AuthMiddleware.php';

function authenticateAdmin() {
    $user = authenticateUser();
    if (!isset($user['role']) || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied: Admin privileges required']);
        exit;
    }
    return $user;
}
