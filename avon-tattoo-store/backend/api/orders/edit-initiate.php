<?php
// backend/api/orders/edit-initiate.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/razorpay.php';

handleCors();
$user = authenticateUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$rawOrderId = trim($input['order_id'] ?? '');
$items = $input['items'] ?? [];
$shippingName = trim($input['shipping_name'] ?? '');
$shippingPhone = trim($input['shipping_phone'] ?? '');
$shippingAddress = trim($input['shipping_address'] ?? '');

if (empty($rawOrderId) || empty($items) || empty($shippingName) || empty($shippingPhone) || empty($shippingAddress)) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID, items, and complete shipping details are required.']);
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
    echo json_encode(['error' => 'Order not found or unauthorized.']);
    exit;
}

if ($order['payment_status'] !== 'paid') {
    http_response_code(400);
    echo json_encode(['error' => 'Only paid orders can be edited.']);
    exit;
}

if ($order['tracking_status'] === 'cancelled' || $order['tracking_status'] === 'delivered') {
    http_response_code(400);
    echo json_encode(['error' => 'Cancelled or delivered orders cannot be edited.']);
    exit;
}

// 12-hour limit enforcement
$createdAtTime = strtotime($order['created_at']);
$currentTime = time();
$hoursElapsed = ($currentTime - $createdAtTime) / 3600;

if ($hoursElapsed > 12) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Order edit is only permitted within 12 hours of placement. Edit window has expired.',
        'hours_elapsed' => round($hoursElapsed, 1)
    ]);
    exit;
}

// Map stock already reserved by this specific order
$oldItemsStmt = $db->prepare("SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?");
$oldItemsStmt->execute([$order['id']]);
$oldItems = $oldItemsStmt->fetchAll();

$reservedStock = [];
foreach ($oldItems as $oi) {
    $key = $oi['product_id'] . ':' . ($oi['variant_id'] ?: 0);
    $reservedStock[$key] = ($reservedStock[$key] ?? 0) + (int)$oi['quantity'];
}

$subtotal = 0.0;
$validatedItems = [];

// Recalculate totals directly from Database
foreach ($items as $item) {
    $productId = (int)($item['product_id'] ?? 0);
    $variantId = isset($item['variant_id']) && $item['variant_id'] ? (int)$item['variant_id'] : null;
    $quantity = max(1, (int)($item['quantity'] ?? 1));

    $pStmt = $db->prepare("SELECT id, title, base_price, offer_price, stock, is_active FROM products WHERE id = ?");
    $pStmt->execute([$productId]);
    $product = $pStmt->fetch();

    if (!$product || !$product['is_active']) {
        http_response_code(400);
        echo json_encode(['error' => "Product ID {$productId} is unavailable or inactive."]);
        exit;
    }

    $regularPrice = (float)$product['base_price'];
    $rawOffer = (isset($product['offer_price']) && $product['offer_price'] !== null) ? (float)$product['offer_price'] : null;
    $offerPrice = ($rawOffer !== null && $rawOffer > 0 && $rawOffer < $regularPrice) ? $rawOffer : null;
    $unitPrice = ($offerPrice !== null) ? $offerPrice : $regularPrice;

    $variantName = null;
    $availableStock = (int)$product['stock'];

    if ($variantId) {
        $vStmt = $db->prepare("SELECT id, name, price, offer_price, stock FROM product_variants WHERE id = ? AND product_id = ?");
        $vStmt->execute([$variantId, $productId]);
        $variant = $vStmt->fetch();

        if (!$variant) {
            http_response_code(400);
            echo json_encode(['error' => "Selected variant is invalid for '{$product['title']}'."]);
            exit;
        }

        $vRegularPrice = (float)$variant['price'];
        $vRawOffer = (isset($variant['offer_price']) && $variant['offer_price'] !== null)
            ? (float)$variant['offer_price']
            : (isset($product['offer_price']) && $product['offer_price'] !== null ? (float)$product['offer_price'] : null);
        $vOfferPrice = ($vRawOffer !== null && $vRawOffer > 0 && $vRawOffer < $vRegularPrice) ? $vRawOffer : null;
        $unitPrice = ($vOfferPrice !== null) ? $vOfferPrice : $vRegularPrice;

        $variantName = $variant['name'];
        $availableStock = (int)$variant['stock'];
    }

    // Effective available stock = Database stock + quantity already held by this order
    $itemKey = $productId . ':' . ($variantId ?: 0);
    $held = $reservedStock[$itemKey] ?? 0;
    $totalAvailable = $availableStock + $held;

    if ($quantity > $totalAvailable) {
        http_response_code(400);
        echo json_encode(['error' => "Insufficient stock for '{$product['title']}'. Only {$totalAvailable} items available."]);
        exit;
    }

    $lineTotal = $unitPrice * $quantity;
    $subtotal += $lineTotal;

    $validatedItems[] = [
        'product_id' => $product['id'],
        'variant_id' => $variantId,
        'title' => $product['title'],
        'variant_name' => $variantName,
        'quantity' => $quantity,
        'unit_price' => $unitPrice
    ];
}

// Shipping rule: ₹100 if subtotal is below ₹5000, FREE (₹0) if ₹5000 or above
$shippingFee = ($subtotal < 5000.0) ? 100.0 : 0.0;
$newTotal = round($subtotal + $shippingFee, 2);
$originalPaid = round((float)$order['total_amount'], 2);
$additionalPrice = round($newTotal - $originalPaid, 2);

// Case 1: Additional price is required ($additionalPrice > 0)
// Only show and charge the difference in checkout!
if ($additionalPrice > 0) {
    $amountInPaise = (int)round($additionalPrice * 100);
    $razorpayOrderId = null;

    try {
        $api = getRazorpayApi();
        $receipt = 'rcpt_edt_' . $order['id'] . '_' . time();
        $razorpayOrder = $api->order->create([
            'receipt'         => substr($receipt, 0, 40),
            'amount'          => $amountInPaise,
            'currency'        => 'INR',
            'payment_capture' => 1
        ]);
        $razorpayOrderId = $razorpayOrder['id'];
    } catch (Exception $e) {
        $razorpayOrderId = 'order_edit_' . time() . rand(100, 999);
    }

    echo json_encode([
        'requires_payment' => true,
        'order_id' => $order['id'],
        'order_number' => $order['order_number'] ?: ('ATS-' . (1000 + $order['id'])),
        'original_amount' => $originalPaid,
        'new_total' => $newTotal,
        'subtotal' => $subtotal,
        'shipping_fee' => $shippingFee,
        'additional_amount' => $additionalPrice,
        'amount_paise' => $amountInPaise,
        'razorpay_order_id' => $razorpayOrderId,
        'currency' => 'INR',
        'key_id' => $_ENV['RAZORPAY_KEY_ID'] ?? 'rzp_test_xxxxxx'
    ]);
    exit;
}

// Ensure refund columns exist on orders table
try {
    $cols = $db->query("SHOW COLUMNS FROM orders LIKE 'refund_amount'")->fetchAll();
    if (empty($cols)) {
        $db->exec("ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    }
    $statusCols = $db->query("SHOW COLUMNS FROM orders LIKE 'refund_status'")->fetchAll();
    if (empty($statusCols)) {
        $db->exec("ALTER TABLE orders ADD COLUMN refund_status VARCHAR(50) NOT NULL DEFAULT 'none'");
    }
} catch (Exception $e) {
    // Ignore schema update errors if columns already exist
}

$refundAmount = max(0.0, round($originalPaid - $newTotal, 2));
$refundStatus = ($refundAmount > 0) ? 'pending' : ($order['refund_status'] ?? 'none');

// Case 2: New total <= original paid (No additional price needed)
// Update order and stock directly within a transaction
$db->beginTransaction();
try {
    // 1. Restore previous items to stock
    foreach ($oldItems as $oi) {
        $updProduct = $db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
        $updProduct->execute([$oi['quantity'], $oi['product_id']]);

        if (!empty($oi['variant_id'])) {
            $updVariant = $db->prepare("UPDATE product_variants SET stock = stock + ? WHERE id = ?");
            $updVariant->execute([$oi['quantity'], $oi['variant_id']]);
        }
    }

    // 2. Deduct new items from stock
    foreach ($validatedItems as $vi) {
        $dedProduct = $db->prepare("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?");
        $dedProduct->execute([$vi['quantity'], $vi['product_id']]);

        if (!empty($vi['variant_id'])) {
            $dedVariant = $db->prepare("UPDATE product_variants SET stock = GREATEST(0, stock - ?) WHERE id = ?");
            $dedVariant->execute([$vi['quantity'], $vi['variant_id']]);
        }
    }

    // 3. Replace order_items
    $delStmt = $db->prepare("DELETE FROM order_items WHERE order_id = ?");
    $delStmt->execute([$order['id']]);

    $itemStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, variant_id, title, variant_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($validatedItems as $vi) {
        $itemStmt->execute([
            $order['id'],
            $vi['product_id'],
            $vi['variant_id'],
            $vi['title'],
            $vi['variant_name'],
            $vi['quantity'],
            $vi['unit_price']
        ]);
    }

    // 4. Update order details including refund amount and status
    $orderStmt = $db->prepare("
        UPDATE orders 
        SET total_amount = ?, 
            shipping_fee = ?, 
            shipping_name = ?, 
            shipping_phone = ?, 
            shipping_address = ?,
            refund_amount = ?,
            refund_status = ?
        WHERE id = ?
    ");
    $orderStmt->execute([
        $newTotal,
        $shippingFee,
        $shippingName,
        $shippingPhone,
        $shippingAddress,
        $refundAmount,
        $refundStatus,
        $order['id']
    ]);

    // 5. If refund is due ($refundAmount > 0), log a high-priority ticket for Admin payout
    $orderNumber = $order['order_number'] ?: ('ATS-' . (1000 + $order['id']));
    if ($refundAmount > 0) {
        $countStmt = $db->query("SELECT COUNT(*) FROM support_tickets");
        $nextId = (int)$countStmt->fetchColumn() + 1001;
        $ticketNumber = 'TCK-' . $nextId;

        $subject = "Manual Refund Pending: ₹" . number_format($refundAmount, 2) . " for Order #" . $orderNumber;
        $message = "Customer edited Order #" . $orderNumber . " within the 12-hour modification window.\n" .
                   "• Previous Total Paid: ₹" . number_format($originalPaid, 2) . "\n" .
                   "• Revised Order Total: ₹" . number_format($newTotal, 2) . "\n" .
                   "• Excess Balance Due for Refund: ₹" . number_format($refundAmount, 2) . "\n" .
                   "• Original Razorpay Payment ID: " . ($order['razorpay_payment_id'] ?: 'N/A') . "\n" .
                   "• Customer: " . $shippingName . " (" . $shippingPhone . ")\n\n" .
                   "ACTION REQUIRED: Please process manual payout of ₹" . number_format($refundAmount, 2) . " to the customer's original payment method.";

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

    $db->commit();

    $successMsg = ($refundAmount > 0)
        ? 'Order #' . $orderNumber . ' updated successfully! An excess of ₹' . number_format($refundAmount, 2) . ' has been marked as pending and queued for admin payout.'
        : 'Order #' . $orderNumber . ' updated successfully!';

    echo json_encode([
        'requires_payment' => false,
        'status' => 'success',
        'message' => $successMsg,
        'order_id' => $order['id'],
        'order_number' => $orderNumber,
        'new_total' => $newTotal,
        'refund_amount' => $refundAmount,
        'refund_status' => $refundStatus
    ]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update order: ' . $e->getMessage()]);
}
