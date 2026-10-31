<?php
require_once __DIR__ . '/config/db.php';

try {
    $pdo = getDbConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS `product_reviews` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $pdo->exec($sql);
    echo "Table product_reviews created successfully.\n";

    // Ensure columns exist if table was already created
    require_once __DIR__ . '/migrate_review_media.php';
    runReviewMediaMigration();

    // Seed sample reviews if empty
    $count = $pdo->query("SELECT COUNT(*) FROM product_reviews")->fetchColumn();
    if ($count == 0) {
        $sampleSql = "INSERT INTO product_reviews (product_id, user_name, user_email, rating, title, comment, is_approved) VALUES
        (1, 'Vikram Sharma', 'vikram@tattooart.in', 5, 'Smooth performance & long battery', 'This machine handles 14RL liners effortlessly with zero vibration. The dual battery lasts full day studio sessions.', 1),
        (1, 'Rohan Mehta', 'rohan@blackink.com', 5, 'Best rotary pen for lining', 'Consistent power delivery and lightweight ergonomics. Highly recommended for professional artists.', 1),
        (1, 'Ananya Roy', 'ananya@studio.com', 4, 'Great build quality', 'Super clean finish and solid grip. Battery indicator screen is super crisp.', 1),
        (2, 'Karan Singh', 'karan@needles.com', 5, 'Zero ink spitback', 'Membrane tension is perfect and needles stay sharp for long shade sessions.', 1),
        (3, 'Siddharth V.', 'sid@inkworks.com', 5, 'Deepest black on the market', 'Heals pitch black without fading to blue. Best lining ink for bold work.', 1);";
        $pdo->exec($sampleSql);
        echo "Sample reviews seeded successfully.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
