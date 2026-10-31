<?php
// backend/api/admin/knowledge-delete.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Knowledge item ID is required']);
    exit;
}

try {
    $pdo = getDbConnection();

    // Check if there is an associated file to remove
    $stmt = $pdo->prepare("SELECT `file_path` FROM `knowledge_base` WHERE `id` = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($item && !empty($item['file_path'])) {
        $fullPath = __DIR__ . '/../../' . $item['file_path'];
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    $stmt = $pdo->prepare("DELETE FROM `knowledge_base` WHERE `id` = ?");
    $stmt->execute([$id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Knowledge item deleted successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
