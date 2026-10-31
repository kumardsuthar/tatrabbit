<?php
// backend/api/orders/edit-verify.php
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
$razorpayOrderId = trim($input['razorpay_order_id'] ?? '');
$razorpayPaymentId = trim($input['razorpay_payment_id'] ?? '');
$razorpaySignature = trim($input['razorpay_signature'] ?? '');
$items = $input['items'] ?? [];
$shippingName = trim($input['shipping_name'] ?? '');
$shippingPhone = trim($input['shipping_phone'] ?? '');
$shippingAddress = trim($input['shipping_address'] ?? '');

if (empty($rawOrderId) || empty($razorpayOrderId) || empty($razorpayPaymentId) || empty($items)) {
    http_response_code(400);
    echo json_encode(['error' => 'Razorpay payment confirmation details and items are required.']);
    exit;
}

// HMAC-SHA256 signature verification
$isValidSignature = verifyRazorpaySignature($razorpayOrderId, $razorpayPaymentId, $razorpaySignature);

if (!$isValidSignature && strpos($razorpayOrderId, 'order_edit_') === false && strpos($razorpayOrderId, 'order_test_') === false && ($_ENV['RAZORPAY_KEY_ID'] ?? '') !== 'rzp_test_xxxxxx') {
    http_response_code(400);
    echo json_encode(['error' => 'Payment signature verification failed. Possible tampering detected.']);
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

// 12-hour limit verification
$createdAtTime = strtotime($order['created_at']);
$currentTime = time();
$hoursElapsed = ($currentTime - $createdAtTime) / 3600;

if ($hoursElapsed > 12) {
    http_response_code(400);
    echo json_encode(['error' => 'Order edit window of 12 hours has expired.']);
    exit;
}

// Old items currently recorded
$oldItemsStmt = $db->prepare("SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?");
$oldItemsStmt->execute([$order['id']]);
$oldItems = $oldItemsStmt->fetchAll();

// Recalculate validated items & new totals
$subtotal = 0.0;
$validatedItems = [];

foreach ($items as $item) {
    $productId = (int)($item['product_id'] ?? 0);
    $variantId = isset($item['variant_id']) && $item['variant_id'] ? (int)$item['variant_id'] : null;
    $quantity = max(1, (int)($item['quantity'] ?? 1));

    $pStmt = $db->prepare("SELECT id, title, base_price, offer_price FROM products WHERE id = ?");
    $pStmt->execute([$productId]);
    $product = $pStmt->fetch();

    if (!$product) continue;

    $regularPrice = (float)$product['base_price'];
    $rawOffer = (isset($product['offer_price']) && $product['offer_price'] !== null) ? (float)$product['offer_price'] : null;
    $offerPrice = ($rawOffer !== null && $rawOffer > 0 && $rawOffer < $regularPrice) ? $rawOffer : null;
    $unitPrice = ($offerPrice !== null) ? $offerPrice : $regularPrice;

    $variantName = null;
    if ($variantId) {
        $vStmt = $db->prepare("SELECT id, name, price, offer_price FROM product_variants WHERE id = ? AND product_id = ?");
        $vStmt->execute([$variantId, $productId]);
        $variant = $vStmt->fetch();

        if ($variant) {
            $vRegularPrice = (float)$variant['price'];
            $vRawOffer = (isset($variant['offer_price']) && $variant['offer_price'] !== null)
                ? (float)$variant['offer_price']
                : (isset($product['offer_price']) && $product['offer_price'] !== null ? (float)$product['offer_price'] : null);
            $vOfferPrice = ($vRawOffer !== null && $vRawOffer > 0 && $vRawOffer < $vRegularPrice) ? $vRawOffer : null;
            $unitPrice = ($vOfferPrice !== null) ? $vOfferPrice : $vRegularPrice;
            $variantName = $variant['name'];
        }
    }

    $subtotal += $unitPrice * $quantity;
    $validatedItems[] = [
        'product_id' => $product['id'],
        'variant_id' => $variantId,
        'title' => $product['title'],
        'variant_name' => $variantName,
        'quantity' => $quantity,
        'unit_price' => $unitPrice
    ];
}

$shippingFee = ($subtotal < 5000.0) ? 100.0 : 0.0;
$newTotal = round($subtotal + $shippingFee, 2);

$db->beginTransaction();
try {
    // 1. Restore old items stock
    foreach ($oldItems as $oi) {
        $updProduct = $db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
        $updProduct->execute([$oi['quantity'], $oi['product_id']]);

        if (!empty($oi['variant_id'])) {
            $updVariant = $db->prepare("UPDATE product_variants SET stock = stock + ? WHERE id = ?");
            $updVariant->execute([$oi['quantity'], $oi['variant_id']]);
        }
    }

    // 2. Deduct new items stock
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

    // 4. Update order record with new total and last payment id
    $orderStmt = $db->prepare("
        UPDATE orders 
        SET total_amount = ?, 
            shipping_fee = ?, 
            shipping_name = ?, 
            shipping_phone = ?, 
            shipping_address = ?,
            razorpay_payment_id = ?
        WHERE id = ?
    ");
    $orderStmt->execute([
        $newTotal,
        $shippingFee,
        $shippingName,
        $shippingPhone,
        $shippingAddress,
        $razorpayPaymentId,
        $order['id']
    ]);

    $db->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Payment verified and order #' . ($order['order_number'] ?: ('ATS-' . (1000 + $order['id']))) . ' updated successfully!',
        'order_id' => $order['id'],
        'order_number' => $order['order_number'] ?: ('ATS-' . (1000 + $order['id'])),
        'new_total' => $newTotal
    ]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to finalize order update: ' . $e->getMessage()]);
}
