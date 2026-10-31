<?php
// backend/api/admin/setup_tables.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/db.php';

try {
    $pdo = getDbConnection();

    // 1. Reviews Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `reviews` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `product_id` INT NULL,
        `product_title` VARCHAR(255) NULL,
        `user_name` VARCHAR(100) NOT NULL,
        `studio_name` VARCHAR(150) NULL,
        `rating` INT NOT NULL DEFAULT 5,
        `comment` TEXT NOT NULL,
        `is_approved` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 2. Blogs Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `blogs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `slug` VARCHAR(255) NOT NULL UNIQUE,
        `excerpt` TEXT NOT NULL,
        `content` TEXT NOT NULL,
        `author` VARCHAR(100) DEFAULT 'TatRabbit Master Studio',
        `category` VARCHAR(100) DEFAULT 'Equipment Masterclass',
        `image_url` VARCHAR(500) NULL,
        `read_time` VARCHAR(50) DEFAULT '5 min read',
        `is_published` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Seed initial blogs if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `blogs`");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `blogs` (`title`, `slug`, `excerpt`, `content`, `author`, `category`, `image_url`, `read_time`, `is_published`) VALUES
        ('Mastering 4.0mm Stroke Wireless Pens for Bold Lining', 'mastering-4mm-stroke-wireless-pens', 
        'Discover how voltage modulation and stroke length impact line weight, saturation, and skin trauma during long tattoo sessions.',
        'Wireless pen technology has revolutionized modern tattooing. When working with larger needle configurations such as 11RL to 18RL, selecting a 4.0mm stroke machine gives you the necessary needle punch without bogging down. Ensure your voltage is set between 7.5V to 8.5V for optimum needle speed and minimal skin trauma.',
        'TatRabbit Master Studio', 'Equipment Masterclass', '', '6 min read', 1),
        
        ('Cartridge Needle Safety & Membrane Quality Certification', 'cartridge-needle-safety-membrane-quality',
        'Why safety membranes are critical to prevent ink backflow, cross-contamination, and motor corrosion in your rotary equipment.',
        'A high-tensile safety membrane acts as a hermetic barrier between the cartridge reservoir and your machine drive bar. Never compromise on non-membrane cartridges, as pigment fluid backflow can permanently damage internal brushless motors and void equipment warranties.',
        'TatRabbit Safety Team', 'Hygiene & Standards', '', '4 min read', 1),

        ('Pigment Chemistry: Preventing Blue Shifting in Black Ink', 'pigment-chemistry-preventing-blue-shifting',
        'Understanding carbon black particle sizes and binder formulations for jet black healed outlines.',
        'Blue shifting occurs when low-concentration carbon pigments disperse excessively in the dermal layer over time. TatRabbit Obsidian Black uses triple-milled pure carbon particles stabilized in a high-density vehicle to guarantee permanent jet black saturation.',
        'TatRabbit Pigment Lab', 'Ink Chemistry', '', '5 min read', 1)");
    }

    // 4. Knowledge Base Table for AI Chatbot
    $pdo->exec("CREATE TABLE IF NOT EXISTS `knowledge_base` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `type` ENUM('url', 'note', 'file') NOT NULL DEFAULT 'note',
        `source` VARCHAR(500) NULL,
        `content` LONGTEXT NOT NULL,
        `file_path` VARCHAR(500) NULL,
        `file_size` INT NULL,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Seed initial knowledge base entries if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `knowledge_base`");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO `knowledge_base` (`title`, `type`, `source`, `content`, `is_active`) VALUES
        ('TatRabbit Equipment Warranty & Return Policy', 'note', 'Official Policy Guidelines', 'All TatRabbit tattoo machines (including Titan Wireless Pen and Force Digital Power Supply) include a 1-Year Official Studio Warranty. Returns & refunds are accepted within 14 days of delivery for unopened, sealed products in original packaging. Needles and inks are sterile medical supplies and cannot be returned once opened unless damaged in transit.', 1),
        ('Cartridge Needle Compatibility & Safety Specs', 'note', 'Technical Equipment Guide', 'TatRabbit Precision Pro cartridges feature a 100% silicone backflow safety membrane to prevent ink/fluid backflow into rotary motors. Compatible with all Cheyenne-style rotary pen machines and standard grips. Needle configurations: Bugpin #10 (0.30mm) for fine line micro-realism, Standard #12 (0.35mm) for bold lining & magnum shading.', 1),
        ('Rotary Pen Machine Stroke & Voltage Recommendations', 'note', 'Masterclass Tech Notes', 'Operating voltage guidelines for TatRabbit Titan Wireless Pen: 6.5V - 8.5V for soft black & grey shading and dotwork; 7.5V - 9.5V for solid lining (09RL to 18RL). Dual 2000mAh batteries provide 8-10 hours runtime each. Charge via standard 5V 2A USB-C charger. Avoid fast chargers exceeding 18W.', 1),
        ('TatRabbit Express Shipping & Live Order Tracking', 'note', 'Fulfillment & Logistics', 'Orders are dispatched within 24 hours via Bluedart, Delhivery, or FedEx Express. Shipping duration is 2-4 business days across India. Track your order live using your Order ID (e.g., #1) or AWB Tracking Number (e.g., BD78912345IN) in our AI Chatbot or Track Order page.', 1),
        ('TatRabbit Official Website', 'url', 'https://tatrabbit.com', 'TatRabbit is India premier manufacturer and distributor of professional medical-grade tattoo equipment, wireless rotary pens, sterilized cartridge needles, triple-concentrated lining inks, and digital power supplies for licensed studio artists.', 1)");
    }

    // 5. Support Tickets Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `support_tickets` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `ticket_number` VARCHAR(50) UNIQUE NOT NULL,
        `user_id` INT NOT NULL,
        `order_id` INT NULL,
        `order_number` VARCHAR(50) NULL,
        `category` VARCHAR(100) NOT NULL,
        `subject` VARCHAR(255) NOT NULL,
        `message` TEXT NOT NULL,
        `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
        `admin_reply` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 6. Coupons Table
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

    // Add cancel_reason column to orders table if not exists
    try {
        $pdo->exec("ALTER TABLE `orders` ADD COLUMN `cancel_reason` TEXT NULL AFTER `tracking_status`");
    } catch (Exception $ex) {
        // column may already exist
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Reviews, Blogs, Contacts, Knowledge Base, Support Tickets, and Coupons tables set up successfully.'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database migration failed: ' . $e->getMessage()]);
}

