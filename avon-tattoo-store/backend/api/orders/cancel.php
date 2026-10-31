<?php
// backend/api/orders/cancel.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$user = authenticateUser();
$db = getDbConnection();

$input = json_decode(file_get_contents('php://input'), true);
$orderId = $input['order_id'] ?? null;
$reason = trim($input['reason'] ?? '');

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required.']);
    exit();
}

if (empty($reason)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please select or enter a reason for cancellation.']);
    exit();
}

// Fetch order
$stmt = $db->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ?");
$stmt->execute([$orderId, $orderId]);
$order = $stmt->fetch();

if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit();
}

// Check if current user is owner or admin
if ($user['role'] !== 'admin' && (int)$order['user_id'] !== (int)$user['id']) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access to this order.']);
    exit();
}

if ($order['tracking_status'] === 'cancelled') {
    http_response_code(400);
    echo json_encode(['error' => 'Order is already cancelled.']);
    exit();
}

if ($order['tracking_status'] === 'delivered') {
    http_response_code(400);
    echo json_encode(['error' => 'Delivered orders cannot be cancelled directly. Please contact support.']);
    exit();
}

// Enforce 12-hour limit
$createdAtTime = strtotime($order['created_at']);
$currentTime = time();
$hoursElapsed = ($currentTime - $createdAtTime) / 3600;

if ($hoursElapsed > 12 && $user['role'] !== 'admin') {
    http_response_code(400);
    echo json_encode([
        'error' => 'Order cancellation is only permitted within 12 hours of order placement. Please use "Need Help" to raise a support ticket.',
        'expired' => true,
        'hours_elapsed' => round($hoursElapsed, 1)
    ]);
    exit();
}

// Ensure refund columns exist safely
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

// If order was paid, full order total is marked for refund
$isPaid = ($order['payment_status'] === 'paid');
$refundAmount = $isPaid ? (float)$order['total_amount'] : 0.00;
$refundStatus = ($isPaid && $refundAmount > 0) ? 'pending' : 'none';

// Update order status to cancelled and set refund details
$updateStmt = $db->prepare("
    UPDATE orders 
    SET tracking_status = 'cancelled', 
        cancel_reason = ?,
        refund_amount = ?,
        refund_status = ?
    WHERE id = ?
");
$updateStmt->execute([$reason, $refundAmount, $refundStatus, $order['id']]);

// Restock product inventory
$itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
$itemsStmt->execute([$order['id']]);
$items = $itemsStmt->fetchAll();
foreach ($items as $item) {
    if (!empty($item['product_id'])) {
        $db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?")->execute([$item['quantity'], $item['product_id']]);
    }
    if (!empty($item['variant_id'])) {
        $db->prepare("UPDATE product_variants SET stock = stock + ? WHERE id = ?")->execute([$item['quantity'], $item['variant_id']]);
    }
}

// If paid, create high-priority refund ticket for admin tracking and notification
$orderNumber = $order['order_number'] ?: ('ATS-' . (1000 + $order['id']));
if ($isPaid && $refundAmount > 0) {
    $countStmt = $db->query("SELECT COUNT(*) FROM support_tickets");
    $nextId = (int)$countStmt->fetchColumn() + 1001;
    $ticketNumber = 'TCK-' . $nextId;

    $subject = "Cancellation Refund Pending: ₹" . number_format($refundAmount, 2) . " for Order #" . $orderNumber;
    $message = "Customer cancelled paid Order #" . $orderNumber . " within the 12-hour cancellation window.\n" .
               "• Reason: " . $reason . "\n" .
               "• Order Total Paid: ₹" . number_format($refundAmount, 2) . "\n" .
               "• Full Refund Amount Due: ₹" . number_format($refundAmount, 2) . "\n" .
               "• Razorpay Payment ID: " . ($order['razorpay_payment_id'] ?: 'N/A') . "\n" .
               "• Customer: " . ($order['shipping_name'] ?: 'N/A') . " (" . ($order['shipping_phone'] ?: 'N/A') . ")\n\n" .
               "ACTION REQUIRED: Please execute 1-click refund in Admin Refund Requests Center.";

    $ticketStmt = $db->prepare("
        INSERT INTO support_tickets (ticket_number, user_id, order_id, order_number, category, subject, message, priority, status)
        VALUES (?, ?, ?, ?, 'Refund & Payout', ?, ?, 'high', 'open')
    ");
    $ticketStmt->execute([
        $ticketNumber,
        $user['id'],
        $order['id'],
        $orderNumber,
        $subject,
        $message
    ]);
}

$successMsg = 'Order #' . $orderNumber . ' has been successfully cancelled.';
if ($isPaid && $refundAmount > 0) {
    $successMsg .= ' A full refund request of ₹' . number_format($refundAmount, 2) . ' has been logged for payout to your original payment source.';
}

echo json_encode([
    'status' => 'success',
    'message' => $successMsg,
    'order_id' => $order['id'],
    'refund_amount' => $refundAmount,
    'refund_status' => $refundStatus
]);
