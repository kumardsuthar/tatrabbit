<?php
// backend/api/admin/tickets-list.php
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
$status = $_GET['status'] ?? 'all';

$query = "SELECT st.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone 
          FROM support_tickets st 
          JOIN users u ON st.user_id = u.id";

$params = [];
if ($status !== 'all') {
    $query .= " WHERE st.status = ?";
    $params[] = $status;
}

$query .= " ORDER BY st.id DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$tickets = $stmt->fetchAll();

echo json_encode([
    'tickets' => $tickets,
    'total' => count($tickets)
]);
