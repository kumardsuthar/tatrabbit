<?php
// backend/api/admin/coupons.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

function ensureCouponsTable($pdo) {
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
}

try {
    $pdo = getDbConnection();
    ensureCouponsTable($pdo);

    $method = $_SERVER['REQUEST_METHOD'];

    // -------------------------------------------------------------
    // DELETE COUPON
    // -------------------------------------------------------------
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Coupon ID is required for deletion.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM `coupons` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Coupon deleted successfully.'
        ]);
        exit;
    }

    // -------------------------------------------------------------
    // GET: LIST ALL COUPONS
    // -------------------------------------------------------------
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM `coupons` ORDER BY `created_at` DESC");
        $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'coupons' => $coupons
        ]);
        exit;
    }

    // -------------------------------------------------------------
    // POST: CREATE / UPDATE / TOGGLE
    // -------------------------------------------------------------
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $input['action'] ?? $_GET['action'] ?? 'save';

        // 1. Toggle Active Status
        if ($action === 'toggle') {
            $id = $input['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Coupon ID is required to toggle status.']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE `coupons` SET `is_active` = IF(`is_active` = 1, 0, 1) WHERE `id` = :id");
            $stmt->execute([':id' => $id]);

            $fetchStmt = $pdo->prepare("SELECT * FROM `coupons` WHERE `id` = :id");
            $fetchStmt->execute([':id' => $id]);
            $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'status' => 'success',
                'message' => 'Coupon status updated.',
                'coupon' => $updated
            ]);
            exit;
        }

        // 2. Delete via POST action=delete
        if ($action === 'delete') {
            $id = $input['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Coupon ID is required.']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM `coupons` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Coupon deleted.']);
            exit;
        }

        // 3. Save / Update Coupon
        $id = !empty($input['id']) ? intval($input['id']) : null;
        $code = strtoupper(trim($input['code'] ?? ''));
        $title = trim($input['title'] ?? '');
        $type = in_array(strtolower($input['type'] ?? ''), ['percentage', 'price']) ? strtolower($input['type']) : 'percentage';
        $discountValue = floatval($input['discount_value'] ?? 0);
        $productId = !empty($input['product_id']) ? intval($input['product_id']) : null;
        $productTitle = trim($input['product_title'] ?? '');
        $productImage = trim($input['product_image'] ?? '');
        $minOrderAmount = floatval($input['min_order_amount'] ?? 0);
        $expiryDate = !empty($input['expiry_date']) ? $input['expiry_date'] : null;
        $isActive = isset($input['is_active']) ? (intval($input['is_active']) ? 1 : 0) : 1;

        if (empty($code)) {
            http_response_code(400);
            echo json_encode(['error' => 'Coupon code is required.']);
            exit;
        }

        if ($discountValue <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Discount value must be greater than zero.']);
            exit;
        }

        if ($type === 'percentage' && $discountValue > 100) {
            http_response_code(400);
            echo json_encode(['error' => 'Percentage discount cannot exceed 100%.']);
            exit;
        }

        // Check code uniqueness
        $checkSql = "SELECT id FROM `coupons` WHERE `code` = :code" . ($id ? " AND `id` != :id" : "");
        $checkParams = [':code' => $code];
        if ($id) $checkParams[':id'] = $id;
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->execute($checkParams);
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => "Coupon code '{$code}' already exists. Please choose a different code."]);
            exit;
        }

        // If product_id is provided but product_title is missing, fetch from products table
        if ($productId && empty($productTitle)) {
            $pStmt = $pdo->prepare("SELECT title, image_url FROM `products` WHERE id = :pid LIMIT 1");
            $pStmt->execute([':pid' => $productId]);
            if ($prod = $pStmt->fetch(PDO::FETCH_ASSOC)) {
                $productTitle = $prod['title'];
                if (empty($productImage)) {
                    $productImage = $prod['image_url'] ?? '';
                }
            }
        }

        if ($id) {
            // Update
            $updateSql = "UPDATE `coupons` SET 
                `code` = :code,
                `title` = :title,
                `type` = :type,
                `discount_value` = :discount_value,
                `product_id` = :product_id,
                `product_title` = :product_title,
                `product_image` = :product_image,
                `min_order_amount` = :min_order_amount,
                `expiry_date` = :expiry_date,
                `is_active` = :is_active
                WHERE `id` = :id";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute([
                ':code' => $code,
                ':title' => $title,
                ':type' => $type,
                ':discount_value' => $discountValue,
                ':product_id' => $productId,
                ':product_title' => $productTitle,
                ':product_image' => $productImage,
                ':min_order_amount' => $minOrderAmount,
                ':expiry_date' => $expiryDate,
                ':is_active' => $isActive,
                ':id' => $id
            ]);
            $savedId = $id;
        } else {
            // Insert
            $insertSql = "INSERT INTO `coupons` 
                (`code`, `title`, `type`, `discount_value`, `product_id`, `product_title`, `product_image`, `min_order_amount`, `expiry_date`, `is_active`)
                VALUES
                (:code, :title, :type, :discount_value, :product_id, :product_title, :product_image, :min_order_amount, :expiry_date, :is_active)";
            $insertStmt = $pdo->prepare($insertSql);
            $insertStmt->execute([
                ':code' => $code,
                ':title' => $title,
                ':type' => $type,
                ':discount_value' => $discountValue,
                ':product_id' => $productId,
                ':product_title' => $productTitle,
                ':product_image' => $productImage,
                ':min_order_amount' => $minOrderAmount,
                ':expiry_date' => $expiryDate,
                ':is_active' => $isActive
            ]);
            $savedId = $pdo->lastInsertId();
        }

        $fetchStmt = $pdo->prepare("SELECT * FROM `coupons` WHERE `id` = :id");
        $fetchStmt->execute([':id' => $savedId]);
        $savedCoupon = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'message' => $id ? 'Coupon updated successfully.' : 'Coupon created successfully.',
            'coupon' => $savedCoupon
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Coupon operation failed: ' . $e->getMessage()]);
}
