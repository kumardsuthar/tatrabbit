<?php
// backend/api/admin/update-ticket.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$user = authenticateUser();
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required.']);
    exit();
}

$db = getDbConnection();
$input = json_decode(file_get_contents('php://input'), true);

$ticketId = $input['ticket_id'] ?? null;
$status = $input['status'] ?? null;
$adminReply = trim($input['admin_reply'] ?? '');

if (!$ticketId) {
    http_response_code(400);
    echo json_encode(['error' => 'Ticket ID is required.']);
    exit();
}

$stmt = $db->prepare("SELECT * FROM support_tickets WHERE id = ?");
$stmt->execute([$ticketId]);
$ticket = $stmt->fetch();

if (!$ticket) {
    http_response_code(404);
    echo json_encode(['error' => 'Ticket not found.']);
    exit();
}

$updateFields = [];
$params = [];

if ($status && in_array($status, ['open', 'in_progress', 'resolved', 'closed'])) {
    $updateFields[] = "status = ?";
    $params[] = $status;
}

if ($adminReply !== '') {
    $updateFields[] = "admin_reply = ?";
    $params[] = $adminReply;
}

if (empty($updateFields)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update provided.']);
    exit();
}

$params[] = $ticketId;
$sql = "UPDATE support_tickets SET " . implode(', ', $updateFields) . " WHERE id = ?";
$updateStmt = $db->prepare($sql);
$updateStmt->execute($params);

echo json_encode([
    'status' => 'success',
    'message' => 'Support ticket #' . $ticket['ticket_number'] . ' updated successfully.',
    'ticket_id' => $ticketId
]);
