-- Consolidated SQL Setup File for TatRabbit
-- (Target Database is selected automatically in phpMyAdmin)

-- Drop existing tables if needed for clean setup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `reset_token` VARCHAR(255) NULL,
  `reset_expires` DATETIME NULL,
  `otp_code` VARCHAR(255) NULL,
  `otp_expires` DATETIME NULL,
  `otp_attempts` INT NOT NULL DEFAULT 0,
  `otp_last_sent` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `faqs` JSON NULL,
  `base_price` DECIMAL(10,2) NOT NULL,
  `offer_price` DECIMAL(10,2) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `category` VARCHAR(100),
  `image_url` VARCHAR(500),
  `gallery_images` JSON NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Variants Table
CREATE TABLE `product_variants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `offer_price` DECIMAL(10,2) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `attributes` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Orders Table
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) UNIQUE NULL,
  `user_id` INT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `shipping_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  `razorpay_order_id` VARCHAR(100) UNIQUE NULL,
  `razorpay_payment_id` VARCHAR(100) NULL,
  `tracking_status` ENUM('ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'ordered',
  `courier_name` VARCHAR(100) NULL,
  `tracking_number` VARCHAR(100) NULL,
  `tracking_url` VARCHAR(500) NULL,
  `shipping_name` VARCHAR(100) NOT NULL,
  `shipping_phone` VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Order Items Table
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `variant_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `variant_name` VARCHAR(100) NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA

-- Initial Users (Passwords: Admin123 and customer123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Master Admin', 'admin@tatrabbit.com', '$2y$10$wguJ78eXIGYMxRLNOWmnAefMxp2BRUrbsr6XM3HI/cj4hddokLrxW', '+919876543210', 'admin'),
(2, 'Jack Tattoo Studio', 'artist@studio.com', '$2y$10$UfFy7340CddIrdZ5R9E0JOgcMN17pKEyBN7kxm1KB3l0wNH9O8xa2', '+919812345678', 'customer');

-- Initial Products
INSERT INTO `products` (`id`, `title`, `slug`, `description`, `faqs`, `base_price`, `stock`, `category`, `image_url`, `is_active`) VALUES
(1, 'TatRabbit Titan Wireless Rotary Pen Machine', 'tatrabbit-titan-wireless-rotary-pen', 
'Engineered for precision lining and smooth shading. Includes a custom brushless motor, ultra-durable aircraft aluminium casing, and 2,000mAh dual wireless battery packs offering up to 10 hours of continuous tattooing.',
'[{"question":"What stroke length option is best for lining?","answer":"The 4.0mm stroke option provides the highest punch for crisp 09RL to 18RL line work, while 3.5mm is ideal for all-round shading and color packing."},{"question":"Is it compatible with Cheyenne needle cartridges?","answer":"Yes, it features a universal locking mechanism compatible with all standard membrane cartridge needles."}]',
105: 18999.00, 45, 'Machines', '', 1),
106: 
107: (2, 'TatRabbit Precision Pro Sterilized Needle Cartridges (Box of 20)', 'tatrabbit-precision-pro-cartridges',
108: 'Medical-grade 316L stainless steel needles with safety membrane technology to prevent backflow into your machine grip. EO gas sterilized and individually packaged.',
109: '[{"question":"What gauge corresponds to #10 vs #12?","answer":"#10 gauge is 0.30mm (bugpin for fine detail), while #12 gauge is 0.35mm (standard size for solid saturation)."},{"question":"Does it contain a backflow safety membrane?","answer":"Yes, 100% backflow sealed high-flexibility silicon membrane."}]',
110: 1499.00, 200, 'Needles', '', 1),
111: 
112: (3, 'Obsidian Black Triple Concentrated Lining Ink 240ml', 'obsidian-black-lining-ink-240ml',
113: 'Deepest black ink formulated specifically for bold outlines and solid tribal blackwork. High pigment load ensures quick skin absorption and healed vibrancy without blue shifting.',
114: '[{"question":"Is this ink vegan and cruelty-free?","answer":"Yes, 100% vegan pigment formulation free of animal by-products and gamma-ray sterilized."}]',
115: 2499.00, 80, 'Inks', '', 1),
116: 
117: (4, 'TatRabbit Force Dual Output Digital Power Supply', 'tatrabbit-force-dual-output-power-supply',
118: 'Microprocessor-controlled digital power supply with LED voltage readout, jump-start mode for heavy rotary machines, and smart dual machine connection toggle.',
119: '[{"question":"Does it support foot pedal-free continuous mode?","answer":"Yes, built-in momentary and continuous pedal override mode allows running without a foot switch."}]',
120: 6999.00, 30, 'Power Supplies', '', 1);

-- Product Variants
INSERT INTO `product_variants` (`id`, `product_id`, `name`, `price`, `stock`, `attributes`) VALUES
(1, 1, 'Matte Black / 3.5mm All-Rounder', 18999.00, 25, '{"color": "Matte Black", "stroke": "3.5mm", "type": "Pen"}'),
(2, 1, 'Gunmetal Grey / 4.0mm Heavy Liner', 19999.00, 20, '{"color": "Gunmetal Grey", "stroke": "4.0mm", "type": "Pen"}'),
(3, 2, '#10 (0.30mm) - 05 Round Liner (05RL)', 1499.00, 50, '{"gauge": "#10 (0.30mm)", "config": "05RL", "type": "Liner"}'),
(4, 2, '#12 (0.35mm) - 07 Round Shader (07RS)', 1499.00, 50, '{"gauge": "#12 (0.35mm)", "config": "07RS", "type": "Shader"}'),
(5, 2, '#12 (0.35mm) - 15 Curved Magnum (15CM)', 1599.00, 40, '{"gauge": "#12 (0.35mm)", "config": "15CM", "type": "Magnum"}'),
(6, 3, '240ml Standard Bottle', 2499.00, 50, '{"size": "240ml"}'),
(7, 3, '480ml Studio Bulk Pack', 4299.00, 30, '{"size": "480ml"}');

-- Sample Order
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `total_amount`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `tracking_status`, `courier_name`, `tracking_number`, `tracking_url`, `shipping_name`, `shipping_phone`, `shipping_address`) VALUES
(1, 'ATS-1001', 2, 20498.00, 'paid', 'order_N1234567890', 'pay_P9876543210', 'shipped', 'Bluedart Express', 'BD78912345IN', 'https://www.bluedart.com/tracking/BD78912345IN', 'Jack Tattoo Studio', '+919812345678', 'Studio #4, Art District, MG Road, Bengaluru, KA 560001');

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `title`, `variant_name`, `quantity`, `unit_price`) VALUES
(1, 1, 1, 1, 'TatRabbit Titan Wireless Rotary Pen Machine', 'Matte Black / 3.5mm All-Rounder', 1, 18999.00),
(2, 1, 2, 3, 'TatRabbit Precision Pro Sterilized Needle Cartridges (Box of 20)', '#10 (0.30mm) - 05 Round Liner (05RL)', 1, 1499.00);

-- 6. Site Settings Table
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` VARCHAR(255) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('active_theme', 'default');

-- 7. Site Layout Table
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
('why_choose_us', 'Why Choose TatRabbit', 4, 1, 'home', 'main'),
('reviews', 'Artist Testimonials & Reviews', 5, 1, 'home', 'main'),
('blog_preview', 'Latest Blog & Masterclass', 6, 1, 'home', 'main');

