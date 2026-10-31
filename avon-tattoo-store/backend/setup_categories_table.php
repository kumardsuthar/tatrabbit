<?php
// backend/setup_categories_table.php
require_once __DIR__ . '/config/db.php';

try {
    $db = getDbConnection();

    // 1. Create categories table
    $db->exec("CREATE TABLE IF NOT EXISTS `categories` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL UNIQUE,
        `image_url` VARCHAR(500) NULL,
        `display_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 2. Default initial categories with curated images
    $defaultCategories = [
        [
            'name' => 'Machines',
            'image_url' => '',
            'display_order' => 1
        ],
        [
            'name' => 'Needles',
            'image_url' => '',
            'display_order' => 2
        ],
        [
            'name' => 'Inks',
            'image_url' => '',
            'display_order' => 3
        ],
        [
            'name' => 'Power Supplies',
            'image_url' => '',
            'display_order' => 4
        ],
        [
            'name' => 'Hygiene',
            'image_url' => '',
            'display_order' => 5
        ]
    ];

    $checkStmt = $db->prepare("SELECT COUNT(*) FROM categories WHERE name = ?");
    $insertStmt = $db->prepare("INSERT INTO categories (name, image_url, display_order, is_active) VALUES (?, ?, ?, 1)");

    foreach ($defaultCategories as $cat) {
        $checkStmt->execute([$cat['name']]);
        if ($checkStmt->fetchColumn() == 0) {
            $insertStmt->execute([$cat['name'], $cat['image_url'], $cat['display_order']]);
        }
    }

    // 3. Migrate custom categories from site_settings if any exist
    $settingStmt = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'custom_categories'");
    $customRow = $settingStmt->fetch(PDO::FETCH_ASSOC);
    if ($customRow && !empty($customRow['setting_value'])) {
        $customCats = json_decode($customRow['setting_value'], true);
        if (is_array($customCats)) {
            $order = 10;
            foreach ($customCats as $customName) {
                $checkStmt->execute([$customName]);
                if ($checkStmt->fetchColumn() == 0) {
                    $insertStmt->execute([$customName, '', $order++]);
                }
            }
        }
    }

    echo "Categories table created and seeded successfully!\n";
} catch (Exception $e) {
    echo "Error setting up categories table: " . $e->getMessage() . "\n";
}
