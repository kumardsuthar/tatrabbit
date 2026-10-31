<?php
// backend/api/orders/get.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
$user = authenticateUser();

$rawOrderId = trim($_GET['order_id'] ?? '');

if (empty($rawOrderId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required']);
    exit;
}

$cleanInput = ltrim($rawOrderId, '#');
$numericId = (int)preg_replace('/[^0-9]/', '', $cleanInput);
$offsetId = ($numericId > 1000) ? ($numericId - 1000) : $numericId;

$db = getDbConnection();
$stmt = $db->prepare("
    SELECT * FROM orders 
    WHERE (id = ? OR id = ? OR order_number = ? OR order_number = ?)
      AND user_id = ?
    LIMIT 1
");
$stmt->execute([
    $numericId,
    $offsetId,
    $cleanInput,
    'ATS-' . $cleanInput,
    $user['id']
]);
$order = $stmt->fetch();

if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found or unauthorized']);
    exit;
}

$createdAtTime = strtotime($order['created_at']);
$currentTime = time();
$hoursElapsed = ($currentTime - $createdAtTime) / 3600;
$isWithin12Hours = ($hoursElapsed <= 12);
$hoursRemaining = max(0.0, round(12.0 - $hoursElapsed, 1));

// Fetch items with product details
$itemStmt = $db->prepare("
    SELECT oi.*, p.image_url, p.stock as base_stock, p.base_price, p.offer_price as product_offer_price
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
");
$itemStmt->execute([$order['id']]);
$items = $itemStmt->fetchAll();

echo json_encode([
    'order' => $order,
    'items' => $items,
    'is_within_12_hours' => $isWithin12Hours,
    'hours_elapsed' => round($hoursElapsed, 1),
    'hours_remaining' => $hoursRemaining
]);
