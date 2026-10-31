<?php
// backend/config/mailer.php
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// Ensure .env is loaded
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->safeLoad();
}

function sendEmail($to, $subject, $htmlBody) {
    $mail = new PHPMailer(true);

    try {
        $host = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $port = intval($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT') ?: 465);
        $username = trim($_ENV['SMTP_USER'] ?? getenv('SMTP_USER') ?: '');
        $password = trim($_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS') ?: '');

        // If credentials are empty or placeholder, simulate sending
        if (
            empty($username) || 
            empty($password) ||
            $username === 'orders@yourdomain.com' || 
            $username === 'no-reply@yourdomain.com' || 
            $password === 'YourEmailPassword' || 
            strpos($username, 'yourdomain.com') !== false
        ) {
            error_log("Simulated Email Sent to: $to | Subject: $subject");
            return true;
        }

        $mail->isSMTP();
        $mail->Timeout = 10;
        
        // Resolve to IPv4 to prevent macOS IPv6 connection timeouts
        $resolvedHost = gethostbyname($host);
        $mail->Host = $resolvedHost ?: $host;
        
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $password;

        if ($port === 465) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }
        $mail->Port = $port;

        // SSL options to ensure reliable handshake
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        $mail->setFrom($username, 'TatRabbit');
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = strip_tags($htmlBody);

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
