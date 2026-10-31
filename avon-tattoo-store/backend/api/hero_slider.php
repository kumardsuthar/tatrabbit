<?php
// backend/api/hero_slider.php
require_once __DIR__ . '/../middleware/Cors.php';
require_once __DIR__ . '/../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
        $slides = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format numeric / boolean types if needed
        $formattedSlides = array_map(function($slide) {
            return [
                'id' => (int)$slide['id'],
                'subtitle' => $slide['subtitle'],
                'title' => $slide['title'],
                'price' => $slide['price'],
                'discount' => $slide['discount'],
                'button_text' => $slide['button_text'],
                'button_link' => $slide['button_link'],
                'glow_color' => $slide['glow_color'],
                'accent_badge' => $slide['accent_badge'],
                'image_url' => $slide['image_url'],
                'display_order' => (int)$slide['display_order'],
                'is_active' => (int)$slide['is_active'] === 1
            ];
        }, $slides);

        echo json_encode([
            'success' => true,
            'slides' => $formattedSlides
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch hero slides: ' . $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
