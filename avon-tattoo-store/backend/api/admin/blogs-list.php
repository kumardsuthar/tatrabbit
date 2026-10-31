<?php
// backend/api/admin/blogs-list.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/db.php';

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT * FROM `blogs` ORDER BY `created_at` DESC");
    $blogs = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'blogs' => $blogs
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
