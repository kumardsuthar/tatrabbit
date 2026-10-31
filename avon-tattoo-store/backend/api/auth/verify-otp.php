<?php
// backend/api/auth/verify-otp.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$otp = trim($input['otp'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email address is required']);
    exit;
}

if (!preg_match('/^[0-9]{4}$/', $otp)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter a valid 4-digit verification code']);
    exit;
}

$db = getDbConnection();
$stmt = $db->prepare("SELECT id, name, email, otp_code, otp_expires, otp_attempts FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || empty($user['otp_code']) || empty($user['otp_expires'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No active verification code found. Please request a new code.']);
    exit;
}

// Brute-force protection: Maximum 5 invalid attempts
if ((int)$user['otp_attempts'] >= 5) {
    http_response_code(429);
    echo json_encode([
        'error' => 'Too many failed attempts. For your security, this verification code has been locked. Please request a new code.'
    ]);
    exit;
}

// Check expiration
if (strtotime($user['otp_expires']) < time()) {
    http_response_code(400);
    echo json_encode(['error' => 'Verification code has expired. Please request a new code.']);
    exit;
}

// Verify OTP hash
if (!password_verify($otp, $user['otp_code'])) {
    $newAttempts = (int)$user['otp_attempts'] + 1;
    $updateStmt = $db->prepare("UPDATE users SET otp_attempts = ? WHERE id = ?");
    $updateStmt->execute([$newAttempts, $user['id']]);

    $remaining = max(0, 5 - $newAttempts);
    http_response_code(400);
    if ($remaining > 0) {
        echo json_encode([
            'error' => "Invalid 4-digit code. {$remaining} attempt" . ($remaining === 1 ? '' : 's') . " remaining."
        ]);
    } else {
        echo json_encode([
            'error' => 'Too many failed attempts. This code has been locked. Please request a new code.'
        ]);
    }
    exit;
}

// Success: OTP is valid!
// Generate a single-use crypto reset token valid for 15 minutes
$resetToken = bin2hex(random_bytes(32));
$resetExpires = date('Y-m-d H:i:s', time() + 900);

// Invalidate OTP immediately and store reset token
$updateStmt = $db->prepare("UPDATE users SET otp_code = NULL, otp_expires = NULL, otp_attempts = 0, reset_token = ?, reset_expires = ? WHERE id = ?");
$updateStmt->execute([$resetToken, $resetExpires, $user['id']]);

echo json_encode([
    'success' => true,
    'message' => 'Verification code confirmed successfully.',
    'reset_token' => $resetToken
]);
