<?php
// backend/api/auth/reset-password.php
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
$resetToken = trim($input['reset_token'] ?? '');
$newPassword = $input['new_password'] ?? '';
$confirmPassword = $input['confirm_password'] ?? '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email address is required']);
    exit;
}

if (empty($resetToken)) {
    http_response_code(400);
    echo json_encode(['error' => 'Reset authorization token is missing']);
    exit;
}

if (empty($newPassword) || strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'New password must be at least 6 characters long']);
    exit;
}

if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['error' => 'Passwords do not match']);
    exit;
}

$db = getDbConnection();
$stmt = $db->prepare("SELECT id, reset_token, reset_expires FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || empty($user['reset_token']) || empty($user['reset_expires'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired password reset session. Please request a new verification code.']);
    exit;
}

// Check expiration
if (strtotime($user['reset_expires']) < time()) {
    http_response_code(400);
    echo json_encode(['error' => 'Password reset session has expired. Please request a new code.']);
    exit;
}

// Timing-attack safe comparison of reset token
if (!hash_equals($user['reset_token'], $resetToken)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid password reset authorization token.']);
    exit;
}

// Hash the new password with PASSWORD_BCRYPT
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Invalidate all tokens & update password
$updateStmt = $db->prepare("
    UPDATE users 
    SET password = ?, 
        reset_token = NULL, 
        reset_expires = NULL, 
        otp_code = NULL, 
        otp_expires = NULL, 
        otp_attempts = 0 
    WHERE id = ?
");
$updateStmt->execute([$hashedPassword, $user['id']]);

echo json_encode([
    'success' => true,
    'message' => 'Password updated successfully! You can now log in with your new password.'
]);
