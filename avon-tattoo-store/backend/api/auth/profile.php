<?php
// backend/api/auth/profile.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$user = authenticateUser();
$db = getDbConnection();

$stmt = $db->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$userData = $stmt->fetch();

if (!$userData) {
    http_response_code(444);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Fetch recent shipping addresses from past orders
$addressStmt = $db->prepare("SELECT DISTINCT shipping_name, shipping_phone, shipping_address FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 3");
$addressStmt->execute([$user['id']]);
$addresses = $addressStmt->fetchAll();

echo json_encode([
    'user' => $userData,
    'saved_addresses' => $addresses
]);
