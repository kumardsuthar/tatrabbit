<?php
// backend/api/admin/reviews-list.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("
        SELECT r.*, p.title as product_title 
        FROM `product_reviews` r 
        LEFT JOIN `products` p ON r.product_id = p.id 
        ORDER BY r.`created_at` DESC
    ");
    $reviews = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'reviews' => $reviews
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
