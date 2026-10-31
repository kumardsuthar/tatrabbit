<?php
// backend/setup_features.php
require_once __DIR__ . '/config/db.php';

$db = getDbConnection();

$sql = "
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` VARCHAR(255) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('active_theme', 'default');

CREATE TABLE IF NOT EXISTS `site_layout` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(100) NOT NULL UNIQUE,
  `section_name` VARCHAR(150) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `target_page` VARCHAR(100) NOT NULL DEFAULT 'home',
  `position_slot` VARCHAR(100) NOT NULL DEFAULT 'main',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `site_layout` (`section_key`, `section_name`, `display_order`, `is_visible`, `target_page`, `position_slot`) VALUES
('hero_banner', 'Hero Banner & Slider', 1, 1, 'home', 'main'),
('featured_categories', 'Featured Categories Bar', 2, 1, 'home', 'main'),
('featured_products', 'Featured Products Showcase', 3, 1, 'home', 'main'),
('custom_showcase', 'Custom Catalog Showcase (Product Slider)', 4, 1, 'home', 'main'),
('why_choose_us', 'Why Choose TatRabbit', 5, 1, 'home', 'main'),
('reviews', 'Artist Testimonials & Reviews', 6, 1, 'home', 'main'),
('blog_preview', 'Latest Blog & Masterclass', 7, 1, 'home', 'main');
";

try {
    $db->exec($sql);
    echo "Database tables site_settings and site_layout created successfully.\n";
} catch (Exception $e) {
    echo "Error executing migration: " . $e->getMessage() . "\n";
}
