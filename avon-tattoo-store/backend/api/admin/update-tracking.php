<?php
// backend/api/admin/update-tracking.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/mailer.php';

handleCors();
authenticateAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$rawOrderId = trim($input['order_id'] ?? '');
$trackingStatus = trim($input['tracking_status'] ?? '');
$courierName = trim($input['courier_name'] ?? '');
$trackingNumber = trim($input['tracking_number'] ?? '');
$trackingUrl = trim($input['tracking_url'] ?? '');
$notifyCustomer = isset($input['notify_customer']) ? (bool)$input['notify_customer'] : true;

if (empty($rawOrderId) || empty($trackingStatus)) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID and tracking status are required']);
    exit;
}

$cleanInput = ltrim($rawOrderId, '#');
$numericId = (int)preg_replace('/[^0-9]/', '', $cleanInput);
$offsetId = ($numericId > 1000) ? ($numericId - 1000) : $numericId;

$db = getDbConnection();
$stmt = $db->prepare("
    SELECT o.*, u.email 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    WHERE o.id = ? OR o.id = ? OR o.order_number = ? OR LOWER(o.order_number) = ?
    LIMIT 1
");
$stmt->execute([$numericId, $offsetId, $cleanInput, strtolower($cleanInput)]);
$order = $stmt->fetch();

if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found']);
    exit;
}

$displayOrderNum = $order['order_number'] ?: ('ATS-' . (1000 + $order['id']));

$updateStmt = $db->prepare("UPDATE orders SET tracking_status = ?, courier_name = ?, tracking_number = ?, tracking_url = ? WHERE id = ?");
$updateStmt->execute([$trackingStatus, $courierName, $trackingNumber, $trackingUrl, $order['id']]);

// Dispatch email if notifyCustomer is true
$targetEmail = !empty($order['email']) ? $order['email'] : ($order['shipping_email'] ?? '');
if ($notifyCustomer && !empty($targetEmail)) {
    try {
        $templatePath = __DIR__ . '/../../templates/tracking-email.html';
        $template = file_exists($templatePath) ? file_get_contents($templatePath) : '';

        if (!empty($template)) {
            $trackingLinkBtn = !empty($trackingUrl) 
                ? "<p><a href='$trackingUrl' class='button' target='_blank'>Track Package on $courierName</a></p>" 
                : "";

            $statusFormatted = ucwords(str_replace('_', ' ', $trackingStatus));
            $emailContent = str_replace(
                ['{{CUSTOMER_NAME}}', '{{ORDER_ID}}', '{{TRACKING_STATUS}}', '{{COURIER_NAME}}', '{{TRACKING_NUMBER}}', '{{TRACKING_LINK_BTN}}', '{{YEAR}}'],
                [$order['shipping_name'], $displayOrderNum, $statusFormatted, $courierName ?: 'Express Courier', $trackingNumber ?: 'Pending Assignment', $trackingLinkBtn, date('Y')],
                $template
            );

            sendEmail($targetEmail, "Shipment Update - Order #$displayOrderNum ($statusFormatted)", $emailContent);
        }
    } catch (\Throwable $e) {
        error_log("Non-blocking tracking email dispatch error: " . $e->getMessage());
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Tracking information updated successfully',
    'order_id' => $order['id'],
    'tracking_status' => $trackingStatus
]);
