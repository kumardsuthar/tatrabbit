<?php
// backend/api/admin/review-toggle.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Review ID required']);
    exit;
}

try {
    $pdo = getDbConnection();
    // Toggle approval state
    $stmt = $pdo->prepare("UPDATE `product_reviews` SET `is_approved` = NOT `is_approved` WHERE `id` = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Review visibility status updated successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
