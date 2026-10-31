<?php
// backend/setup_catalog.php
require_once __DIR__ . '/config/db.php';

$db = getDbConnection();

$sql = "
ALTER TABLE `site_settings` MODIFY COLUMN `setting_value` TEXT NOT NULL;

INSERT IGNORE INTO `site_layout` (`section_key`, `section_name`, `display_order`, `is_visible`, `target_page`, `position_slot`)
VALUES ('custom_showcase', 'Custom Catalog Showcase', 3, 1, 'home', 'main');
";

try {
    $db->exec($sql);
    echo "Database updated for custom catalog showcase successfully.\n";
} catch (Exception $e) {
    echo "Notice: " . $e->getMessage() . "\n";
}
