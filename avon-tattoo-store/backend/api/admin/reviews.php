<?php
// backend/api/admin/reviews.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List all reviews with product titles
    $stmt = $db->query("
        SELECT r.*, p.title as product_title, p.image_url as product_image
        FROM product_reviews r
        LEFT JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
    ");
    $reviews = $stmt->fetchAll();
    echo json_encode(['reviews' => $reviews]);
    exit;
}

if ($method === 'POST' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $reviewId = isset($input['id']) ? intval($input['id']) : 0;
    
    if (!$reviewId) {
        http_response_code(400);
        echo json_encode(['error' => 'Review ID is required']);
        exit;
    }

    if (isset($input['is_approved'])) {
        $isApproved = $input['is_approved'] ? 1 : 0;
        $stmt = $db->prepare("UPDATE product_reviews SET is_approved = ? WHERE id = ?");
        $stmt->execute([$isApproved, $reviewId]);
        echo json_encode(['message' => 'Review approval status updated successfully', 'is_approved' => $isApproved]);
        exit;
    }
}

if ($method === 'DELETE') {
    $reviewId = $_GET['id'] ?? null;
    if (!$reviewId) {
        $input = json_decode(file_get_contents('php://input'), true);
        $reviewId = $input['id'] ?? null;
    }

    if (!$reviewId) {
        http_response_code(400);
        echo json_encode(['error' => 'Review ID is required']);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM product_reviews WHERE id = ?");
    $stmt->execute([$reviewId]);
    echo json_encode(['message' => 'Review deleted successfully']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
