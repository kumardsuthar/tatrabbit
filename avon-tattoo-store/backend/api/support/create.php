<?php
// backend/api/support/create.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$user = authenticateUser();
$db = getDbConnection();

$input = json_decode(file_get_contents('php://input'), true);

$orderId = $input['order_id'] ?? null;
$orderNumber = $input['order_number'] ?? null;
$category = trim($input['category'] ?? 'General Inquiry');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');
$priority = trim($input['priority'] ?? 'medium');

if (empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Subject and detailed message are required to raise a ticket.']);
    exit();
}

// Generate unique Ticket Number (e.g. TCK-1001)
$countStmt = $db->query("SELECT COUNT(*) FROM support_tickets");
$nextId = (int)$countStmt->fetchColumn() + 1001;
$ticketNumber = 'TCK-' . $nextId;

// Check if ticket_number already exists
$checkStmt = $db->prepare("SELECT COUNT(*) FROM support_tickets WHERE ticket_number = ?");
$checkStmt->execute([$ticketNumber]);
if ($checkStmt->fetchColumn() > 0) {
    $ticketNumber = 'TCK-' . (time() % 100000);
}

$stmt = $db->prepare("INSERT INTO support_tickets (ticket_number, user_id, order_id, order_number, category, subject, message, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')");
$stmt->execute([
    $ticketNumber,
    $user['id'],
    $orderId ?: null,
    $orderNumber ?: null,
    $category,
    $subject,
    $message,
    $priority
]);

$ticketId = $db->lastInsertId();

echo json_encode([
    'status' => 'success',
    'message' => 'Support ticket #' . $ticketNumber . ' raised successfully. Our studio helpdesk will review and respond shortly.',
    'ticket' => [
        'id' => $ticketId,
        'ticket_number' => $ticketNumber,
        'category' => $category,
        'subject' => $subject,
        'status' => 'open',
        'created_at' => date('Y-m-d H:i:s')
    ]
]);
