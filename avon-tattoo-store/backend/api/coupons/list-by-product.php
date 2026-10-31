<?php
// backend/api/coupons/list-by-product.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$productId = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;

try {
    $pdo = getDbConnection();

    // Ensure table exists in case accessed first
    $pdo->exec("CREATE TABLE IF NOT EXISTS `coupons` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `code` VARCHAR(50) NOT NULL UNIQUE,
        `title` VARCHAR(255) NULL,
        `type` ENUM('percentage', 'price') NOT NULL DEFAULT 'percentage',
        `discount_value` DECIMAL(10, 2) NOT NULL,
        `product_id` INT NULL,
        `product_title` VARCHAR(255) NULL,
        `product_image` VARCHAR(500) NULL,
        `min_order_amount` DECIMAL(10, 2) DEFAULT 0.00,
        `expiry_date` DATE NULL,
        `is_active` TINYINT(1) DEFAULT 1,
        `times_used` INT DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_product_id` (`product_id`),
        INDEX `idx_code` (`code`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $query = "SELECT id, code, title, type, discount_value, product_id, product_title, min_order_amount, expiry_date 
              FROM `coupons` 
              WHERE `is_active` = 1 
                AND (`expiry_date` IS NULL OR `expiry_date` >= CURDATE())";

    if ($productId) {
        $query .= " AND (`product_id` = :pid OR `product_id` IS NULL)";
        $stmt = $pdo->prepare($query . " ORDER BY `discount_value` DESC");
        $stmt->execute([':pid' => $productId]);
    } else {
        $stmt = $pdo->query($query . " ORDER BY `discount_value` DESC");
    }

    $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'coupons' => $coupons
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
