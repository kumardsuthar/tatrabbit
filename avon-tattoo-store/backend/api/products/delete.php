<?php
// backend/api/products/delete.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($_GET['id'] ?? $input['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
    exit;
}

$db = getDbConnection();
$stmt = $db->prepare("DELETE FROM products WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(['message' => 'Product deleted successfully']);
