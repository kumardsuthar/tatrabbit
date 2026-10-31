<?php
// backend/setup_hero_slider.php
require_once __DIR__ . '/config/db.php';

$db = getDbConnection();

$sql = "
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subtitle` VARCHAR(255) NOT NULL DEFAULT 'Exclusive Offer Going',
  `title` VARCHAR(255) NOT NULL,
  `price` VARCHAR(100) NOT NULL DEFAULT '18,999.00',
  `discount` VARCHAR(100) NOT NULL DEFAULT 'SAVE 25%',
  `button_text` VARCHAR(100) NOT NULL DEFAULT 'Buy Now',
  `button_link` VARCHAR(255) NOT NULL DEFAULT 'Machines',
  `glow_color` VARCHAR(100) NOT NULL DEFAULT 'from-blue-500/10 to-indigo-500/5',
  `accent_badge` VARCHAR(150) NOT NULL DEFAULT 'bg-blue-50 text-blue-700 border-blue-200',
  `image_url` TEXT NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $db->exec($sql);
    
    // Check if table is empty
    $checkStmt = $db->query("SELECT COUNT(*) as cnt FROM hero_slides");
    $cnt = $checkStmt->fetch(PDO::FETCH_ASSOC)['cnt'];

    if ((int)$cnt === 0) {
        $insertStmt = $db->prepare("
            INSERT INTO hero_slides (subtitle, title, price, discount, button_text, button_link, glow_color, accent_badge, image_url, display_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");

        $defaultSlides = [
            [
                'Pro Studio Standard',
                'TatRabbit Titan Wireless Rotary Pen Machine',
                '18,999.00',
                'SAVE 25%',
                'Buy Now',
                'Machines',
                'from-blue-500/10 to-indigo-500/5',
                'bg-blue-50 text-blue-700 border-blue-200',
                '',
                1
            ],
            [
                'New EO Gas Sterilized Generation',
                'Precision Pro #10 Bugpin Cartridge Needles',
                '1,499.00',
                'SAVE 40%',
                'Shop Needles',
                'Needles',
                'from-emerald-500/10 to-teal-500/5',
                'bg-emerald-50 text-emerald-700 border-emerald-200',
                '',
                2
            ],
            [
                'Triple Concentrated Pigment',
                'Obsidian Deep Black Tribal Lining Ink',
                '2,499.00',
                'SAVE 30%',
                'Explore Inks',
                'Inks',
                'from-purple-500/10 to-indigo-500/5',
                'bg-purple-50 text-purple-700 border-purple-200',
                '',
                3
            ],
            [
                'Microprocessor Power Control',
                'Jump-Start Dual Output Digital Power Station',
                '6,999.00',
                'SAVE 35%',
                'Get Power Unit',
                'Power Supplies',
                'from-amber-500/10 to-orange-500/5',
                'bg-amber-50 text-amber-700 border-amber-200',
                '',
                4
            ]
        ];

        foreach ($defaultSlides as $slide) {
            $insertStmt->execute($slide);
        }
    }

    echo json_encode(['success' => true, 'message' => 'hero_slides table initialized successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Migration failed: ' . $e->getMessage()]);
}
