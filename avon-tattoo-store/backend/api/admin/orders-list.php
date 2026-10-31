<?php
// backend/api/admin/orders-list.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

$db = getDbConnection();
$status = $_GET['status'] ?? null;
$search = $_GET['search'] ?? null;

$query = "SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1";
$params = [];

if ($status && $status !== 'All') {
    if ($status === 'refund_pending') {
        $query .= " AND o.refund_status = 'pending' AND o.refund_amount > 0";
    } else {
        $query .= " AND o.tracking_status = ?";
        $params[] = $status;
    }
}

if ($search) {
    $cleanSearch = ltrim($search, '#');
    $numSearch = (int)preg_replace('/[^0-9]/', '', $cleanSearch);
    $offsetSearch = ($numSearch > 1000) ? ($numSearch - 1000) : $numSearch;

    $query .= " AND (o.id = ? OR o.id = ? OR o.order_number LIKE ? OR o.shipping_name LIKE ? OR o.shipping_phone LIKE ? OR u.email LIKE ?)";
    $params[] = $numSearch;
    $params[] = $offsetSearch;
    $params[] = "%$cleanSearch%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$query .= " ORDER BY o.id DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$orders = $stmt->fetchAll();

foreach ($orders as &$o) {
    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$o['id']]);
    $o['items'] = $itemStmt->fetchAll();
}

echo json_encode(['orders' => $orders]);
