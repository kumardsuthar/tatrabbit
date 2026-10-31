<?php
// backend/api/orders/create.php
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

$items = $input['items'] ?? [];
$shippingName = trim($input['shipping_name'] ?? '');
$shippingPhone = trim($input['shipping_phone'] ?? '');
$shippingAddress = trim($input['shipping_address'] ?? '');

if (empty($items) || empty($shippingName) || empty($shippingPhone) || empty($shippingAddress)) {
    http_response_code(400);
    echo json_encode(['error' => 'Cart items and complete shipping details are required']);
    exit;
}

$db = getDbConnection();
$subtotal = 0.0;
$validatedItems = [];

// Recalculate totals directly from Database - NEVER trust client amounts!
foreach ($items as $item) {
    $productId = (int)($item['product_id'] ?? 0);
    $variantId = isset($item['variant_id']) ? (int)$item['variant_id'] : null;
    $quantity = max(1, (int)($item['quantity'] ?? 1));

    $pStmt = $db->prepare("SELECT id, title, base_price, offer_price, stock, is_active FROM products WHERE id = ?");
    $pStmt->execute([$productId]);
    $product = $pStmt->fetch();

    if (!$product || !$product['is_active']) {
        http_response_code(400);
        echo json_encode(['error' => "Product ID {$productId} is unavailable or inactive"]);
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
            echo json_encode(['error' => "Selected variant is invalid for {$product['title']}"]);
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

    if ($quantity > $availableStock) {
        http_response_code(400);
        echo json_encode(['error' => "Insufficient stock for '{$product['title']}'. Only {$availableStock} items remaining."]);
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

// Shipping Fee Rule: ₹100 if subtotal is below ₹5000, FREE (₹0) if ₹5000 or above
$shippingFee = ($subtotal < 5000.0) ? 100.0 : 0.0;
$totalAmount = $subtotal + $shippingFee;

// Create Razorpay Order instance (Amount in paise => Total * 100)
$razorpayOrderId = null;
try {
    $api = getRazorpayApi();
    $amountInPaise = (int)round($totalAmount * 100);
    
    // Receipt string max 40 chars
    $receipt = 'rcpt_' . $user['id'] . '_' . time();
    $razorpayOrder = $api->order->create([
        'receipt'         => substr($receipt, 0, 40),
        'amount'          => $amountInPaise,
        'currency'        => 'INR',
        'payment_capture' => 1
    ]);
    $razorpayOrderId = $razorpayOrder['id'];
} catch (Exception $e) {
    // Fallback order id if Razorpay test API fails or offline key used
    $razorpayOrderId = 'order_test_' . time() . rand(100, 999);
}

$db->beginTransaction();
try {
    $stmt = $db->prepare("INSERT INTO orders (user_id, total_amount, shipping_fee, payment_status, razorpay_order_id, tracking_status, shipping_name, shipping_phone, shipping_address) VALUES (?, ?, ?, 'pending', ?, 'ordered', ?, ?, ?)");
    $stmt->execute([$user['id'], $totalAmount, $shippingFee, $razorpayOrderId, $shippingName, $shippingPhone, $shippingAddress]);
    $orderId = (int)$db->lastInsertId();

    $orderNumber = 'ATS-' . (1000 + $orderId);
    $updStmt = $db->prepare("UPDATE orders SET order_number = ? WHERE id = ?");
    $updStmt->execute([$orderNumber, $orderId]);

    $itemStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, variant_id, title, variant_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($validatedItems as $vi) {
        $itemStmt->execute([$orderId, $vi['product_id'], $vi['variant_id'], $vi['title'], $vi['variant_name'], $vi['quantity'], $vi['unit_price']]);
    }

    $db->commit();

    echo json_encode([
        'order_id' => $orderId,
        'order_number' => $orderNumber,
        'razorpay_order_id' => $razorpayOrderId,
        'subtotal' => $subtotal,
        'shipping_fee' => $shippingFee,
        'amount' => $totalAmount,
        'amount_paise' => (int)round($totalAmount * 100),
        'currency' => 'INR',
        'key_id' => $_ENV['RAZORPAY_KEY_ID'] ?? 'rzp_test_xxxxxx'
    ]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to initialize order: ' . $e->getMessage()]);
}
