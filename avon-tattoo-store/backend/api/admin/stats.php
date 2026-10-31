<?php
// backend/api/admin/stats.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

$db = getDbConnection();

// Total revenue
$revStmt = $db->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'");
$totalRevenue = (float)$revStmt->fetch()['total'];

// Total orders
$ordStmt = $db->query("SELECT COUNT(*) as total FROM orders");
$totalOrders = (int)$ordStmt->fetch()['total'];

// Total customers
$custStmt = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'customer'");
$totalCustomers = (int)$custStmt->fetch()['total'];

// Low stock products (< 10)
$stockStmt = $db->query("SELECT id, title, stock FROM products WHERE stock < 10 AND is_active = 1");
$lowStockProducts = $stockStmt->fetchAll();

// Recent orders
$recStmt = $db->query("SELECT o.id, o.total_amount, o.payment_status, o.tracking_status, o.created_at, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC LIMIT 5");
$recentOrders = $recStmt->fetchAll();

echo json_encode([
    'total_revenue' => $totalRevenue,
    'total_orders' => $totalOrders,
    'total_customers' => $totalCustomers,
    'low_stock_products' => $lowStockProducts,
    'recent_orders' => $recentOrders
]);
