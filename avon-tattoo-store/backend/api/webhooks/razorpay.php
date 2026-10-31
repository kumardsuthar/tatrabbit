<?php
// backend/api/webhooks/razorpay.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$postData = file_get_contents('php://input');
$webhookSecret = $_ENV['RAZORPAY_WEBHOOK_SECRET'] ?? 'xxxxxx';

$receivedSignature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

// Signature check if secret is configured and not default
if ($webhookSecret !== 'xxxxxx' && !empty($receivedSignature)) {
    $expectedSignature = hash_hmac('sha256', $postData, $webhookSecret);
    if (!hash_equals($expectedSignature, $receivedSignature)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid webhook signature']);
        exit;
    }
}

$payload = json_decode($postData, true);
$event = $payload['event'] ?? '';

if ($event === 'order.paid' || $event === 'payment.captured') {
    $entity = $payload['payload']['payment']['entity'] ?? $payload['payload']['order']['entity'] ?? [];
    $razorpayOrderId = $entity['order_id'] ?? null;
    $razorpayPaymentId = $entity['id'] ?? null;

    if ($razorpayOrderId) {
        $db = getDbConnection();
        $stmt = $db->prepare("SELECT * FROM orders WHERE razorpay_order_id = ?");
        $stmt->execute([$razorpayOrderId]);
        $order = $stmt->fetch();

        if ($order && $order['payment_status'] !== 'paid') {
            $db->beginTransaction();
            try {
                $update = $db->prepare("UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ?, tracking_status = 'processing' WHERE id = ?");
                $update->execute([$razorpayPaymentId, $order['id']]);

                // Inventory reduction
                $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $itemsStmt->execute([$order['id']]);
                $items = $itemsStmt->fetchAll();

                foreach ($items as $item) {
                    $pStock = $db->prepare("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?");
                    $pStock->execute([$item['quantity'], $item['product_id']]);

                    if (!empty($item['variant_id'])) {
                        $vStock = $db->prepare("UPDATE product_variants SET stock = GREATEST(0, stock - ?) WHERE id = ?");
                        $vStock->execute([$item['quantity'], $item['variant_id']]);
                    }
                }

                $db->commit();

                // Dispatch order confirmation emails to customer and admin
                try {
                    require_once __DIR__ . '/../../config/mailer.php';
                    sendOrderConfirmationEmails($order['id'], $razorpayPaymentId);
                } catch (\Throwable $mErr) {
                    error_log("Webhook order email error: " . $mErr->getMessage());
                }
            } catch (Exception $e) {
                $db->rollBack();
            }
        }
    }
}

http_response_code(200);
echo json_encode(['status' => 'success']);
