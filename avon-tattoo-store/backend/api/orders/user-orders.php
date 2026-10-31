<?php
// backend/api/orders/user-orders.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
$user = authenticateUser();

$db = getDbConnection();
$stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? AND payment_status = 'paid' ORDER BY id DESC");
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll();

foreach ($orders as &$o) {
    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$o['id']]);
    $o['items'] = $itemStmt->fetchAll();
}

echo json_encode(['orders' => $orders]);
