<?php
// backend/api/reviews/list.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/db.php';

try {
    $pdo = getDbConnection();
    // Return only approved reviews for public site from product_reviews, with fallback
    $reviews = [];
    try {
        $stmt = $pdo->query("
            SELECT r.*, p.title as product_title, p.image_url as product_image 
            FROM `product_reviews` r 
            LEFT JOIN `products` p ON r.product_id = p.id 
            WHERE r.`is_approved` = 1 
            ORDER BY r.`created_at` DESC
        ");
        $reviews = $stmt->fetchAll();
    } catch (Exception $e) {
        // Table product_reviews might not exist or failed
    }

    echo json_encode([
        'status' => 'success',
        'reviews' => $reviews
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
