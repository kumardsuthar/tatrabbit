<?php
// backend/api/coupons/validate.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$code = strtoupper(trim($input['code'] ?? $_GET['code'] ?? ''));
$productId = isset($input['product_id']) ? intval($input['product_id']) : (isset($_GET['product_id']) ? intval($_GET['product_id']) : null);
$price = isset($input['price']) ? floatval($input['price']) : (isset($_GET['price']) ? floatval($_GET['price']) : 0);
$items = isset($input['items']) && is_array($input['items']) ? $input['items'] : [];

// Determine subtotal
$subtotal = isset($input['subtotal']) ? floatval($input['subtotal']) : (isset($_GET['subtotal']) ? floatval($_GET['subtotal']) : $price);
if ($subtotal <= 0 && !empty($items)) {
    foreach ($items as $it) {
        $subtotal += floatval($it['unit_price'] ?? 0) * intval($it['quantity'] ?? 1);
    }
}
if ($subtotal <= 0 && $price > 0) {
    $subtotal = $price;
}

if (empty($code)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'valid' => false,
        'error' => 'Please enter a coupon code.'
    ]);
    exit;
}

try {
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("SELECT * FROM `coupons` WHERE `code` = :code LIMIT 1");
    $stmt->execute([':code' => $code]);
    $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$coupon) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'valid' => false,
            'error' => "Coupon code '{$code}' is invalid or does not exist."
        ]);
        exit;
    }

    if (intval($coupon['is_active']) !== 1) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'valid' => false,
            'error' => "Coupon '{$code}' is no longer active."
        ]);
        exit;
    }

    if (!empty($coupon['expiry_date']) && $coupon['expiry_date'] < date('Y-m-d')) {
        $expFormatted = date('d M Y', strtotime($coupon['expiry_date']));
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'valid' => false,
            'error' => "Coupon '{$code}' expired on {$expFormatted}."
        ]);
        exit;
    }

    // Minimum order amount check
    $minSpend = floatval($coupon['min_order_amount'] ?? 0);
    if ($minSpend > 0 && $subtotal < $minSpend) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'valid' => false,
            'error' => "Minimum order subtotal of ₹" . number_format($minSpend, 0) . " required to apply coupon '{$code}'."
        ]);
        exit;
    }

    // Product restriction check
    $applicableAmount = $subtotal;
    if (!empty($coupon['product_id'])) {
        $cProductId = intval($coupon['product_id']);
        $matched = false;

        if ($productId && $productId === $cProductId) {
            $matched = true;
            $applicableAmount = $price > 0 ? $price : $subtotal;
        } elseif (!empty($items)) {
            $matchingItemTotal = 0.0;
            foreach ($items as $it) {
                if (intval($it['product_id'] ?? 0) === $cProductId) {
                    $matched = true;
                    $matchingItemTotal += floatval($it['unit_price'] ?? 0) * intval($it['quantity'] ?? 1);
                }
            }
            if ($matched) {
                $applicableAmount = $matchingItemTotal;
            }
        }

        if (!$matched) {
            $pName = !empty($coupon['product_title']) ? $coupon['product_title'] : 'the selected product';
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'valid' => false,
                'error' => "Coupon '{$code}' is only applicable for {$pName}."
            ]);
            exit;
        }
    }

    // Calculate discount
    $type = $coupon['type'];
    $val = floatval($coupon['discount_value']);
    $discountAmount = 0.0;
    $discountText = '';

    if ($type === 'percentage') {
        $discountAmount = round(($applicableAmount * $val) / 100, 2);
        $discountText = "{$val}% OFF";
    } else {
        // Flat price
        $discountAmount = min($val, $applicableAmount);
        $discountText = "₹" . number_format($val, 0) . " OFF";
    }

    $discountAmount = min($discountAmount, $subtotal);

    if ($discountAmount <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'valid' => false,
            'error' => "Coupon '{$code}' does not provide any discount on this order."
        ]);
        exit;
    }

    $finalPrice = max(0, round($subtotal - $discountAmount, 2));

    echo json_encode([
        'status' => 'success',
        'valid' => true,
        'coupon' => [
            'id' => $coupon['id'],
            'code' => $coupon['code'],
            'title' => $coupon['title'],
            'type' => $coupon['type'],
            'discount_value' => $val,
            'product_id' => $coupon['product_id'],
            'product_title' => $coupon['product_title']
        ],
        'original_price' => $subtotal,
        'discount_amount' => $discountAmount,
        'discount_text' => $discountText,
        'final_price' => $finalPrice,
        'message' => "Coupon '{$code}' applied successfully!"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'valid' => false,
        'error' => 'Validation error: ' . $e->getMessage()
    ]);
}
