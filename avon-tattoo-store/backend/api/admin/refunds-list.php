<?php
// backend/api/admin/refunds-list.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

$db = getDbConnection();

// Ensure columns exist safely
$colCheck = $db->query("SHOW COLUMNS FROM orders LIKE 'refund_amount'")->fetchAll();
if (empty($colCheck)) {
    $db->exec("ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER total_amount");
}
$statusCheck = $db->query("SHOW COLUMNS FROM orders LIKE 'refund_status'")->fetchAll();
if (empty($statusCheck)) {
    $db->exec("ALTER TABLE orders ADD COLUMN refund_status VARCHAR(50) DEFAULT 'none' AFTER refund_amount");
}
$refCheck = $db->query("SHOW COLUMNS FROM orders LIKE 'razorpay_refund_id'")->fetchAll();
if (empty($refCheck)) {
    $db->exec("ALTER TABLE orders ADD COLUMN razorpay_refund_id VARCHAR(100) NULL AFTER refund_status");
}

$status = $_GET['status'] ?? 'all';
$search = trim($_GET['search'] ?? '');

// Base query for orders with refund requests
$query = "SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_account_phone 
          FROM orders o 
          JOIN users u ON o.user_id = u.id 
          WHERE (o.refund_amount > 0 OR o.refund_status IN ('pending', 'processed'))";
$params = [];

if ($status && $status !== 'all') {
    $query .= " AND o.refund_status = ?";
    $params[] = $status;
}

if ($search !== '') {
    $cleanSearch = ltrim($search, '#');
    $numSearch = (int)preg_replace('/[^0-9]/', '', $cleanSearch);
    $offsetSearch = ($numSearch > 1000) ? ($numSearch - 1000) : $numSearch;

    $query .= " AND (
        o.id = ? OR o.id = ? 
        OR o.order_number LIKE ? 
        OR o.shipping_name LIKE ? 
        OR o.shipping_phone LIKE ? 
        OR u.email LIKE ? 
        OR o.razorpay_payment_id LIKE ? 
        OR o.razorpay_refund_id LIKE ?
    )";
    $params[] = $numSearch;
    $params[] = $offsetSearch;
    $params[] = "%$cleanSearch%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$query .= " ORDER BY CASE WHEN o.refund_status = 'pending' THEN 0 ELSE 1 END, o.id DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$refundOrders = $stmt->fetchAll();

foreach ($refundOrders as &$order) {
    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$order['id']]);
    $order['items'] = $itemStmt->fetchAll();
}

// Compute aggregate metrics for all refund requests
$summaryStmt = $db->query("
    SELECT 
        COUNT(CASE WHEN refund_status = 'pending' AND refund_amount > 0 THEN 1 END) as pending_count,
        COALESCE(SUM(CASE WHEN refund_status = 'pending' THEN refund_amount ELSE 0 END), 0) as pending_total,
        COUNT(CASE WHEN refund_status = 'processed' THEN 1 END) as processed_count,
        COALESCE(SUM(CASE WHEN refund_status = 'processed' THEN refund_amount ELSE 0 END), 0) as processed_total,
        COUNT(CASE WHEN refund_amount > 0 THEN 1 END) as total_count
    FROM orders
    WHERE refund_amount > 0 OR refund_status IN ('pending', 'processed')
");
$summary = $summaryStmt->fetch();

echo json_encode([
    'refunds' => $refundOrders,
    'metrics' => [
        'pending_count' => (int)($summary['pending_count'] ?? 0),
        'pending_total' => (float)($summary['pending_total'] ?? 0),
        'processed_count' => (int)($summary['processed_count'] ?? 0),
        'processed_total' => (float)($summary['processed_total'] ?? 0),
        'total_count' => (int)($summary['total_count'] ?? 0)
    ]
]);
