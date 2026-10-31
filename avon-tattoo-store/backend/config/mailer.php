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

/**
 * Sends order confirmation emails to both customer (rich design) and admin (table format).
 *
 * @param int|string $orderId
 * @param string|null $razorpayPaymentId
 * @return array ['user_sent' => bool, 'admin_sent' => bool]
 */
function sendOrderConfirmationEmails($orderId, $razorpayPaymentId = null) {
    require_once __DIR__ . '/db.php';
    $db = getDbConnection();

    // 1. Fetch order details with associated user
    $orderStmt = $db->prepare("
        SELECT o.*, u.email as user_email, u.name as user_name, u.phone as user_registered_phone 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = ? OR o.order_number = ?
        LIMIT 1
    ");
    $orderStmt->execute([$orderId, $orderId]);
    $order = $orderStmt->fetch();

    if (!$order) {
        error_log("sendOrderConfirmationEmails: Order not found for ID/Number: {$orderId}");
        return ['user_sent' => false, 'admin_sent' => false];
    }

    // 2. Fetch order items with product details
    $itemsStmt = $db->prepare("
        SELECT oi.*, p.image_url, p.slug 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
    ");
    $itemsStmt->execute([$order['id']]);
    $items = $itemsStmt->fetchAll();

    // 3. Prepare display and financial variables
    $orderNumber = !empty($order['order_number']) ? $order['order_number'] : ('ATS-' . (1000 + (int)$order['id']));
    $orderDate = !empty($order['created_at']) ? date('d M Y, h:i A', strtotime($order['created_at'])) : date('d M Y, h:i A');
    $paymentId = !empty($razorpayPaymentId) ? $razorpayPaymentId : (!empty($order['razorpay_payment_id']) ? $order['razorpay_payment_id'] : 'pay_verified_online');
    
    $shippingName = !empty($order['shipping_name']) ? htmlspecialchars($order['shipping_name']) : (!empty($order['user_name']) ? htmlspecialchars($order['user_name']) : 'Valued Customer');
    $shippingPhone = !empty($order['shipping_phone']) ? htmlspecialchars($order['shipping_phone']) : (!empty($order['user_registered_phone']) ? htmlspecialchars($order['user_registered_phone']) : 'N/A');
    $shippingAddress = !empty($order['shipping_address']) ? nl2br(htmlspecialchars($order['shipping_address'])) : 'Studio / Standard Delivery';
    
    $customerEmail = trim($order['user_email'] ?? '');
    $adminEmail = trim($_ENV['ADMIN_EMAIL'] ?? 'sales@tatrabbit.com');
    $whatsapp = $_ENV['SUPPORT_WHATSAPP'] ?? '+917048136880';
    $cleanWhatsapp = preg_replace('/[^0-9]/', '', $whatsapp);
    $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000', '/');
    $trackUrl = $frontendUrl . '/track?order_id=' . $order['id'] . '&phone=' . urlencode($order['shipping_phone'] ?: '');
    $year = date('Y');

    // Financial calculations
    $subtotal = 0.0;
    foreach ($items as $it) {
        $subtotal += ((float)$it['unit_price'] * (int)$it['quantity']);
    }
    $shippingFee = (float)$order['shipping_fee'];
    $totalAmount = (float)$order['total_amount'];
    $discount = max(0.0, round(($subtotal + $shippingFee) - $totalAmount, 2));

    $formattedSubtotal = number_format($subtotal, 2);
    $formattedShipping = $shippingFee > 0 ? ('₹' . number_format($shippingFee, 2)) : 'FREE';
    $formattedTotal = number_format($totalAmount, 2);

    $discountRowHtmlUser = '';
    $discountRowHtmlAdmin = '';
    if ($discount > 0) {
        $formattedDiscount = number_format($discount, 2);
        $discountRowHtmlUser = '
            <tr>
              <td style="padding: 5px 0; color: #059669; font-size: 14px; font-weight: 600;">Coupon / Offer Discount</td>
              <td align="right" style="padding: 5px 0; color: #059669; font-size: 14px; font-weight: 700;">-₹' . $formattedDiscount . '</td>
            </tr>';
        $discountRowHtmlAdmin = '
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 12px; background: #f8fafc; color: #059669; font-weight: 600;">Discount Deducted</td>
              <td style="padding: 6px 12px; color: #059669; font-weight: 700;">-₹' . $formattedDiscount . '</td>
            </tr>';
    }

    // 4. Build User Items HTML (clean, card-like rows)
    $userItemsRowsHtml = '';
    foreach ($items as $idx => $it) {
        $itemTitle = htmlspecialchars($it['title']);
        $itemVariant = !empty($it['variant_name']) ? htmlspecialchars($it['variant_name']) : '';
        $itemQty = (int)$it['quantity'];
        $itemUnitPrice = number_format((float)$it['unit_price'], 2);
        $itemLineTotal = number_format((float)$it['unit_price'] * $itemQty, 2);
        
        $variantBadge = $itemVariant ? '<div style="margin-top: 3px;"><span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 11px; padding: 2px 7px; border-radius: 4px; font-weight: 500;">' . $itemVariant . '</span></div>' : '';

        $userItemsRowsHtml .= '
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; vertical-align: middle;">
            <div style="font-weight: 600; color: #0f172a; font-size: 14px; line-height: 1.4;">' . $itemTitle . '</div>
            ' . $variantBadge . '
            <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Qty: ' . $itemQty . ' × ₹' . $itemUnitPrice . '</div>
          </td>
          <td align="right" style="padding: 12px 0; vertical-align: middle; white-space: nowrap;">
            <strong style="color: #0f172a; font-size: 14px;">₹' . $itemLineTotal . '</strong>
          </td>
        </tr>';
    }

    // 5. Build Admin Items HTML (operational table format)
    $adminItemsRowsHtml = '';
    foreach ($items as $idx => $it) {
        $rowNum = $idx + 1;
        $itemTitle = htmlspecialchars($it['title']);
        $itemVariant = !empty($it['variant_name']) ? htmlspecialchars($it['variant_name']) : '<span style="color:#94a3b8;">None</span>';
        $itemQty = (int)$it['quantity'];
        $itemUnitPrice = number_format((float)$it['unit_price'], 2);
        $itemLineTotal = number_format((float)$it['unit_price'] * $itemQty, 2);
        $bgColor = ($rowNum % 2 === 0) ? '#f8fafc' : '#ffffff';

        $adminItemsRowsHtml .= '
        <tr style="background-color: ' . $bgColor . '; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 8px 10px; text-align: center; color: #64748b; font-weight: 600;">' . $rowNum . '</td>
          <td style="padding: 8px 10px; font-weight: 600; color: #0f172a;">' . $itemTitle . '</td>
          <td style="padding: 8px 10px; color: #475569;">' . $itemVariant . '</td>
          <td style="padding: 8px 10px; text-align: center; font-weight: 800; font-size: 14px; color: #0f172a;">' . $itemQty . '</td>
          <td style="padding: 8px 10px; text-align: right; color: #475569;">₹' . $itemUnitPrice . '</td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: #0f172a;">₹' . $itemLineTotal . '</td>
        </tr>';
    }

    // 6. User Email Template (Proper Modern Design)
    $userSubject = "Order Confirmed: #{$orderNumber} - TatRabbit Tattoo Store";
    $userHtmlBody = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #' . $orderNumber . '</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 25px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                TATRABBIT
              </h1>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                Premium Tattoo Equipment &amp; Studio Supplies
              </p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 26px 30px 18px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 50px; padding: 5px 14px; margin-bottom: 12px;">
                <span style="color: #059669; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✓ Payment Verified &amp; Received
                </span>
              </div>
              <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 700;">
                Thank you for your order!
              </h2>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                Hi <strong>' . $shippingName . '</strong>, we have received your payment and our fulfillment team is preparing your equipment for dispatch.
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 20px 30px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 18px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding: 6px 0; vertical-align: top;">
                    <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; display: block;">Order Number</span>
                    <strong style="color: #0f172a; font-size: 15px;">#' . $orderNumber . '</strong>
                  </td>
                  <td width="50%" style="padding: 6px 0; vertical-align: top; text-align: right;">
                    <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; display: block;">Order Date</span>
                    <strong style="color: #0f172a; font-size: 13px;">' . $orderDate . '</strong>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px 0 2px; vertical-align: top; border-top: 1px dashed #cbd5e1;">
                    <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; display: block;">Payment Transaction ID</span>
                    <code style="background-color: #e2e8f0; color: #334155; padding: 2px 5px; border-radius: 4px; font-size: 11px; font-family: monospace;">' . htmlspecialchars($paymentId) . '</code>
                  </td>
                  <td width="50%" style="padding: 8px 0 2px; vertical-align: top; text-align: right; border-top: 1px dashed #cbd5e1;">
                    <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; display: block;">Payment Method</span>
                    <span style="color: #059669; font-weight: 700; font-size: 12px;">Paid Online (Razorpay)</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 0 30px 18px;">
              <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 15px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                Ordered Items
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ' . $userItemsRowsHtml . '
              </table>
            </td>
          </tr>

          <!-- Breakdown Box -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px 16px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Subtotal</td>
                  <td align="right" style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600;">₹' . $formattedSubtotal . '</td>
                </tr>
                ' . $discountRowHtmlUser . '
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Shipping</td>
                  <td align="right" style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600;">' . $formattedShipping . '</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 4px; color: #0f172a; font-size: 16px; font-weight: 800; border-top: 1px solid #cbd5e1;">Total Amount Paid</td>
                  <td align="right" style="padding: 10px 0 4px; color: #0f172a; font-size: 18px; font-weight: 800; border-top: 1px solid #cbd5e1;">₹' . $formattedTotal . '</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 22px;">
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                <h4 style="margin: 0 0 6px; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  📍 Delivery Address
                </h4>
                <p style="margin: 0 0 3px; color: #1e293b; font-size: 14px; font-weight: 600;">' . $shippingName . '</p>
                <p style="margin: 0 0 4px; color: #475569; font-size: 13px; line-height: 1.5;">' . $shippingAddress . '</p>
                <p style="margin: 0; color: #64748b; font-size: 13px;">Phone: <strong>' . $shippingPhone . '</strong></p>
              </div>
            </td>
          </tr>

          <!-- Track CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 28px;">
              <a href="' . htmlspecialchars($trackUrl) . '" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(15,23,42,0.25);">
                Track Your Shipment Live &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px; color: #475569; font-size: 13px;">
                Need help with your supplies? We are here for you.
              </p>
              <p style="margin: 0 0 14px; color: #64748b; font-size: 12px;">
                WhatsApp: <a href="https://wa.me/' . $cleanWhatsapp . '" style="color: #059669; font-weight: 700; text-decoration: none;">' . htmlspecialchars($whatsapp) . '</a> &nbsp;|&nbsp; 
                Email: <a href="mailto:sales@tatrabbit.com" style="color: #0f172a; text-decoration: none; font-weight: 600;">sales@tatrabbit.com</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                &copy; ' . $year . ' TatRabbit. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    // 7. Admin Email Template (Simple, High-Density Table Format)
    $adminSubject = "📦 [New Order] #{$orderNumber} - ₹{$formattedTotal} ({$shippingName})";
    $adminHtmlBody = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Order Alert #' . $orderNumber . '</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 720px; margin: 20px auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    
    <!-- Admin Header -->
    <div style="background-color: #0f172a; padding: 18px 24px; border-bottom: 3px solid #f59e0b;">
      <h2 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">
        📦 NEW ORDER RECEIVED &amp; PAID — #' . $orderNumber . '
      </h2>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">
        Placed on ' . $orderDate . ' | Net Amount: ₹' . $formattedTotal . '
      </p>
    </div>

    <div style="padding: 24px;">

      <!-- Table 1: Order & Payment Info -->
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        1. Order &amp; Payment Details
      </h3>
      <table width="100%" style="border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; width: 35%; font-weight: 600; color: #475569;">Order Number</td>
          <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">#' . $orderNumber . ' (ID: #' . $order['id'] . ')</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Payment Status</td>
          <td style="padding: 8px 12px;">
            <span style="background: #10b981; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">PAID</span>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Razorpay Payment ID</td>
          <td style="padding: 8px 12px; font-family: monospace; color: #0284c7; font-weight: 700;">' . htmlspecialchars($paymentId) . '</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Razorpay Order ID</td>
          <td style="padding: 8px 12px; font-family: monospace; color: #475569;">' . htmlspecialchars($order['razorpay_order_id'] ?? 'N/A') . '</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Total Amount Received</td>
          <td style="padding: 8px 12px; font-weight: 800; font-size: 15px; color: #0f172a;">₹' . $formattedTotal . '</td>
        </tr>
      </table>

      <!-- Table 2: Customer & Shipping Info -->
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        2. Customer &amp; Shipping Details
      </h3>
      <table width="100%" style="border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; width: 35%; font-weight: 600; color: #475569;">Customer Name</td>
          <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">' . $shippingName . '</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Customer Email</td>
          <td style="padding: 8px 12px;"><a href="mailto:' . htmlspecialchars($customerEmail) . '" style="color: #0284c7;">' . htmlspecialchars($customerEmail ?: 'N/A') . '</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Phone Number</td>
          <td style="padding: 8px 12px; font-weight: 700;"><a href="tel:' . htmlspecialchars($shippingPhone) . '" style="color: #0f172a; text-decoration: none;">' . $shippingPhone . '</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569;">Full Shipping Address</td>
          <td style="padding: 8px 12px; line-height: 1.5; color: #1e293b;">' . $shippingAddress . '</td>
        </tr>
      </table>

      <!-- Table 3: Ordered Products (Pick & Pack List) -->
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        3. Ordered Products (Pick &amp; Pack List)
      </h3>
      <table width="100%" style="border-collapse: collapse; margin-bottom: 22px; font-size: 13px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="padding: 8px 10px; text-align: center; width: 35px;">#</th>
            <th style="padding: 8px 10px; text-align: left;">Product Item</th>
            <th style="padding: 8px 10px; text-align: left; width: 140px;">Variant</th>
            <th style="padding: 8px 10px; text-align: center; width: 60px;">Qty</th>
            <th style="padding: 8px 10px; text-align: right; width: 90px;">Unit Price</th>
            <th style="padding: 8px 10px; text-align: right; width: 100px;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ' . $adminItemsRowsHtml . '
        </tbody>
      </table>

      <!-- Table 4: Financial Breakdown -->
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        4. Financial Breakdown
      </h3>
      <table width="100%" style="border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 12px; background: #f8fafc; width: 35%; color: #475569;">Items Subtotal</td>
          <td style="padding: 6px 12px; font-weight: 600;">₹' . $formattedSubtotal . '</td>
        </tr>
        ' . $discountRowHtmlAdmin . '
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 12px; background: #f8fafc; color: #475569;">Shipping Fee</td>
          <td style="padding: 6px 12px; font-weight: 600;">' . $formattedShipping . '</td>
        </tr>
        <tr style="background: #f1f5f9; border-bottom: 2px solid #0f172a;">
          <td style="padding: 10px 12px; font-weight: 800; font-size: 14px; color: #0f172a;">Net Total Received</td>
          <td style="padding: 10px 12px; font-weight: 800; font-size: 16px; color: #0f172a;">₹' . $formattedTotal . '</td>
        </tr>
      </table>

      <!-- Admin Actions -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; text-align: center;">
        <a href="' . htmlspecialchars($frontendUrl) . '/admin" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; margin: 4px;">
          Open Admin Orders Portal
        </a>
        <a href="' . htmlspecialchars($trackUrl) . '" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; margin: 4px;">
          View Tracking Link
        </a>
      </div>

    </div>
  </div>
</body>
</html>';

    $results = ['user_sent' => false, 'admin_sent' => false];

    // 8. Send to Customer
    if (!empty($customerEmail)) {
        try {
            $results['user_sent'] = sendEmail($customerEmail, $userSubject, $userHtmlBody);
        } catch (\Throwable $uErr) {
            error_log("Failed to send order email to customer ({$customerEmail}): " . $uErr->getMessage());
        }
    }

    // 9. Send to Admin (table format)
    if (!empty($adminEmail)) {
        try {
            $results['admin_sent'] = sendEmail($adminEmail, $adminSubject, $adminHtmlBody);
        } catch (\Throwable $aErr) {
            error_log("Failed to send order email to admin ({$adminEmail}): " . $aErr->getMessage());
        }
    }

    return $results;
}
