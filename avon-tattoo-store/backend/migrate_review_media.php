<?php
// backend/migrate_review_media.php
require_once __DIR__ . '/config/db.php';

function runReviewMediaMigration() {
    try {
        $pdo = getDbConnection();

        // 1. Ensure columns on product_reviews
        $statements = [
            "ALTER TABLE `product_reviews` ADD COLUMN `images` TEXT NULL AFTER `comment`",
            "ALTER TABLE `product_reviews` ADD COLUMN `video_url` VARCHAR(500) NULL AFTER `images`",
            "ALTER TABLE `product_reviews` ADD COLUMN `studio_name` VARCHAR(150) NULL AFTER `user_name`",
            // Also for reviews table if it exists
            "ALTER TABLE `reviews` ADD COLUMN `images` TEXT NULL AFTER `comment`",
            "ALTER TABLE `reviews` ADD COLUMN `video_url` VARCHAR(500) NULL AFTER `images`"
        ];

        foreach ($statements as $sql) {
            try {
                $pdo->exec($sql);
            } catch (Exception $e) {
                // Column already exists or table doesn't exist, ignore safely
            }
        }

        return true;
    } catch (Exception $e) {
        error_log("Review media migration notice: " . $e->getMessage());
        return false;
    }
}

// If run from CLI directly
if (php_sapi_name() === 'cli' || isset($_GET['run'])) {
    if (runReviewMediaMigration()) {
        echo "Review media migration executed successfully.\n";
    } else {
        echo "Review media migration completed with notices.\n";
    }
}
