<?php
// backend/api/auth/forgot-password.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/mailer.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'A valid email address is required']);
    exit;
}

$db = getDbConnection();
$stmt = $db->prepare("SELECT id, name, email, otp_last_sent FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

// Rate limiting: prevent spamming OTP requests (60 seconds cooldown)
if ($user && !empty($user['otp_last_sent'])) {
    $lastSent = strtotime($user['otp_last_sent']);
    $cooldown = 60; // 60 seconds
    $elapsed = time() - $lastSent;
    if ($elapsed < $cooldown) {
        $waitSec = $cooldown - $elapsed;
        http_response_code(429);
        echo json_encode([
            'error' => "Please wait {$waitSec} seconds before requesting a new verification code."
        ]);
        exit;
    }
}

if ($user) {
    // Generate secure 4-digit numeric OTP (1000 - 9999)
    $otp = strval(random_int(1000, 9999));
    $hashedOtp = password_hash($otp, PASSWORD_DEFAULT);
    $expires = date('Y-m-d H:i:s', time() + 600); // 10 minutes validity

    $now = date('Y-m-d H:i:s');
    $updateStmt = $db->prepare("UPDATE users SET otp_code = ?, otp_expires = ?, otp_attempts = 0, otp_last_sent = ? WHERE id = ?");
    $updateStmt->execute([$hashedOtp, $expires, $now, $user['id']]);

    $userName = htmlspecialchars($user['name'] ?? 'Artist');
    $supportWhatsapp = htmlspecialchars($_ENV['SUPPORT_WHATSAPP'] ?? '+917048136880');
    $year = date('Y');

    // Clean, high-deliverability subject line showing OTP right away
    $emailSubject = "{$otp} is your TatRabbit verification code";

    // User-friendly, clean, lightweight email template
    $htmlBody = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='utf-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>{$otp} - Password Reset Verification Code</title>
    </head>
    <body style='margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color:#334155;'>
      <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f1f5f9; padding:30px 16px;'>
        <tr>
          <td align='center'>
            <table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width:500px; background-color:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);'>
              
              <!-- Brand Header -->
              <tr>
                <td style='padding:28px 32px 20px 32px; text-align:center; border-bottom:1px solid #f1f5f9;'>
                  <div style='font-size:24px; font-weight:800; letter-spacing:1px; color:#0f172a;'>
                    TAT<span style='color:#2563eb;'>RABBIT</span>
                  </div>
                  <div style='font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#64748b; margin-top:4px;'>
                    Professional Tattoo Equipment & Supplies
                  </div>
                </td>
              </tr>

              <!-- Email Body -->
              <tr>
                <td style='padding:32px 32px 28px 32px;'>
                  <h1 style='margin:0 0 12px 0; font-size:20px; font-weight:700; color:#0f172a;'>
                    Reset Your Password
                  </h1>
                  <p style='margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#475569;'>
                    Hi <strong>{$userName}</strong>,<br>
                    We received a request to reset your account password. Please use the 4-digit verification code below:
                  </p>

                  <!-- OTP Code Display Card -->
                  <div style='background-color:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px; padding:22px 16px; text-align:center; margin:24px 0;'>
                    <div style='font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#64748b; margin-bottom:10px;'>
                      Verification Code
                    </div>
                    <div style='font-size:40px; font-weight:800; letter-spacing:16px; color:#0f172a; font-family:SFMono-Regular, Menlo, Monaco, Consolas, monospace; line-height:1; padding-left:16px;'>
                      {$otp}
                    </div>
                    <div style='margin-top:12px; font-size:12px; font-weight:600; color:#d97706;'>
                      ⏱ Valid for 10 minutes only
                    </div>
                  </div>

                  <p style='margin:0 0 16px 0; font-size:13px; line-height:1.6; color:#475569;'>
                    Enter this 4-digit code on the reset page to set your new password.
                  </p>

                  <!-- Helpful Security Notice -->
                  <div style='background-color:#f8fafc; border-left:3px solid #2563eb; padding:12px 16px; border-radius:6px; margin-top:24px;'>
                    <p style='margin:0; font-size:12px; line-height:1.5; color:#64748b;'>
                      <strong style='color:#1e293b;'>Didn't request this code?</strong> You can safely ignore this email. Your password will remain unchanged and your account is secure.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style='padding:20px 32px; background-color:#f8fafc; text-align:center; border-top:1px solid #f1f5f9;'>
                  <p style='margin:0 0 6px 0; font-size:12px; color:#64748b;'>
                    Questions? Contact us on WhatsApp: <a href='https://wa.me/{$supportWhatsapp}' style='color:#2563eb; text-decoration:none; font-weight:600;'>{$supportWhatsapp}</a>
                  </p>
                  <p style='margin:0; font-size:11px; color:#94a3b8;'>
                    &copy; {$year} TatRabbit Studio Store. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    ";

    sendEmail($email, $emailSubject, $htmlBody);
}

// Constant-time like response to prevent account enumeration
echo json_encode([
    'success' => true,
    'message' => 'A 4-digit verification code has been dispatched to your email address.'
]);
