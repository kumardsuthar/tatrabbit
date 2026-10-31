<?php
// backend/api/admin/customers-list.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

$db = getDbConnection();
$query = "
    SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as lifetime_spend
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY lifetime_spend DESC
";

$stmt = $db->query($query);
$customers = $stmt->fetchAll();

echo json_encode(['customers' => $customers]);
