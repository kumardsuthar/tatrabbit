<?php
// backend/api/admin/migrate-reviews.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/db.php';

try {
    $pdo = getDbConnection();

    // 1. Ensure product_reviews table exists with all columns
    $pdo->exec("CREATE TABLE IF NOT EXISTS `product_reviews` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `product_id` INT NOT NULL,
      `user_name` VARCHAR(100) NOT NULL,
      `user_email` VARCHAR(150) NULL,
      `studio_name` VARCHAR(150) NULL,
      `rating` INT NOT NULL DEFAULT 5,
      `title` VARCHAR(255) NULL,
      `comment` TEXT NOT NULL,
      `images` TEXT NULL,
      `video_url` VARCHAR(500) NULL,
      `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 2. Add columns if table already existed without them
    $alterStatements = [
        "ALTER TABLE `product_reviews` ADD COLUMN `images` TEXT NULL AFTER `comment`",
        "ALTER TABLE `product_reviews` ADD COLUMN `video_url` VARCHAR(500) NULL AFTER `images`",
        "ALTER TABLE `product_reviews` ADD COLUMN `studio_name` VARCHAR(150) NULL AFTER `user_name`",
        "ALTER TABLE `reviews` ADD COLUMN `images` TEXT NULL AFTER `comment`",
        "ALTER TABLE `reviews` ADD COLUMN `video_url` VARCHAR(500) NULL AFTER `images`"
    ];

    $executed = [];
    foreach ($alterStatements as $sql) {
        try {
            $pdo->exec($sql);
            $executed[] = $sql . " (Success)";
        } catch (Exception $e) {
            $executed[] = $sql . " (Already exists or skipped)";
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Review media migration completed successfully on live server database!',
        'details' => $executed
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
}
