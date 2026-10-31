<?php
// backend/api/orders/track.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$rawOrderId = trim($_GET['order_id'] ?? '');
$queryVal = trim($_GET['phone'] ?? $_GET['email'] ?? '');

if (empty($rawOrderId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID or Order Number is required']);
    exit;
}

$cleanInput = ltrim($rawOrderId, '#');
$numericId = (int)preg_replace('/[^0-9]/', '', $cleanInput);
$offsetId = ($numericId > 1000) ? ($numericId - 1000) : $numericId;

$stmt = $db->prepare("
    SELECT o.*, u.email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    WHERE o.order_number = ? 
       OR LOWER(o.order_number) = ? 
       OR o.id = ? 
       OR o.id = ? 
       OR o.order_number = ?
    LIMIT 1
");
$stmt->execute([
    $cleanInput,
    strtolower($cleanInput),
    $numericId,
    $offsetId,
    'ATS-' . $cleanInput
]);
$order = $stmt->fetch();

if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'No order found with Order ID #' . htmlspecialchars($rawOrderId)]);
    exit;
}

// Check contact verification if provided
if (!empty($queryVal)) {
    $matched = (strcasecmp($order['shipping_phone'], $queryVal) === 0 || strcasecmp($order['email'], $queryVal) === 0);
    if (!$matched) {
        http_response_code(403);
        echo json_encode(['error' => 'Phone or Email provided does not match the order record']);
        exit;
    }
}

$itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
$itemStmt->execute([$order['id']]);
$order['items'] = $itemStmt->fetchAll();

// Timeline calculation
$statuses = ['ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
$currentIdx = array_search($order['tracking_status'], $statuses);
if ($currentIdx === false) $currentIdx = 0;

$timeline = [
    ['status' => 'ordered', 'label' => 'Order Placed', 'completed' => $currentIdx >= 0],
    ['status' => 'processing', 'label' => 'Processing in Studio', 'completed' => $currentIdx >= 1],
    ['status' => 'shipped', 'label' => 'Shipped / In Transit', 'completed' => $currentIdx >= 2],
    ['status' => 'out_for_delivery', 'label' => 'Out for Delivery', 'completed' => $currentIdx >= 3],
    ['status' => 'delivered', 'label' => 'Delivered', 'completed' => $currentIdx >= 4],
];

echo json_encode([
    'order' => $order,
    'timeline' => $timeline
]);
