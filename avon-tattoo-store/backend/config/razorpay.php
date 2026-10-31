<?php
// backend/config/razorpay.php
require_once __DIR__ . '/../vendor/autoload.php';

use Razorpay\Api\Api;

function getRazorpayApi() {
    $keyId = $_ENV['RAZORPAY_KEY_ID'] ?? 'rzp_test_xxxxxx';
    $keySecret = $_ENV['RAZORPAY_KEY_SECRET'] ?? 'xxxxxx';
    return new Api($keyId, $keySecret);
}

function verifyRazorpaySignature($razorpayOrderId, $razorpayPaymentId, $signature) {
    $api = getRazorpayApi();
    $attributes = [
        'razorpay_order_id' => $razorpayOrderId,
        'razorpay_payment_id' => $razorpayPaymentId,
        'razorpay_signature' => $signature
    ];
    try {
        $api->utility->verifyPaymentSignature($attributes);
        return true;
    } catch (Exception $e) {
        return false;
    }
}
