<?php
// backend/api/coupons/validate.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$code = strtoupper(trim($input['code'] ?? $_GET['code'] ?? ''));
$productId = isset($input['product_id']) ? intval($input['product_id']) : (isset($_GET['product_id']) ? intval($_GET['product_id']) : null);
$price = isset($input['price']) ? floatval($input['price']) : (isset($_GET['price']) ? floatval($_GET['price']) : 0);

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

    // Product restriction check
    if (!empty($coupon['product_id'])) {
        if (!$productId || intval($coupon['product_id']) !== $productId) {
            $pName = !empty($coupon['product_title']) ? $coupon['product_title'] : 'selected product';
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'valid' => false,
                'error' => "Coupon '{$code}' is only applicable for {$pName}."
            ]);
            exit;
        }
    }

    // Minimum order amount check
    $minSpend = floatval($coupon['min_order_amount'] ?? 0);
    if ($minSpend > 0 && $price > 0 && $price < $minSpend) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'valid' => false,
            'error' => "Minimum product price of ₹" . number_format($minSpend, 0) . " required to apply coupon '{$code}'."
        ]);
        exit;
    }

    // Calculate discount
    $type = $coupon['type'];
    $val = floatval($coupon['discount_value']);
    $discountAmount = 0.0;
    $discountText = '';

    if ($type === 'percentage') {
        $discountAmount = round(($price * $val) / 100, 2);
        $discountText = "{$val}% OFF";
    } else {
        // Flat price
        $discountAmount = min($val, $price);
        $discountText = "₹" . number_format($val, 0) . " OFF";
    }

    $finalPrice = max(0, round($price - $discountAmount, 2));

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
        'original_price' => $price,
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
