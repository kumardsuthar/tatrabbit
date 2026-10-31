<?php
// backend/api/admin/notifications.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

$db = getDbConnection();

// Fetch pending refunds
$refStmt = $db->query("
    SELECT o.id, o.order_number, o.refund_amount, o.refund_status, o.created_at, o.shipping_name, u.name as customer_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.refund_status = 'pending' AND o.refund_amount > 0
    ORDER BY o.id DESC
    LIMIT 10
");
$pendingRefunds = $refStmt->fetchAll() ?: [];

// Fetch open tickets
$tktStmt = $db->query("
    SELECT id, ticket_number, subject, priority, category, created_at
    FROM support_tickets
    WHERE status = 'open'
    ORDER BY CASE WHEN priority = 'high' THEN 0 ELSE 1 END, id DESC
    LIMIT 5
");
$openTickets = $tktStmt->fetchAll() ?: [];

$totalPendingRefundsCount = count($pendingRefunds);
$totalPendingRefundsAmount = array_reduce($pendingRefunds, function($sum, $item) {
    return $sum + (float)($item['refund_amount'] ?? 0);
}, 0.0);

echo json_encode([
    'unread_count' => $totalPendingRefundsCount + count($openTickets),
    'pending_refunds_count' => $totalPendingRefundsCount,
    'pending_refunds_total' => $totalPendingRefundsAmount,
    'pending_refunds' => array_values($pendingRefunds),
    'open_tickets' => array_values($openTickets)
]);
