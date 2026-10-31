<?php
// backend/api/admin/hero_slider.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM hero_slides ORDER BY display_order ASC, id ASC");
        $slides = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit;
    }

    $action = $input['action'] ?? '';

    if ($action === 'create' || $action === 'save') {
        $title = trim($input['title'] ?? '');
        $image_url = trim($input['image_url'] ?? '');

        if (empty($image_url)) {
            http_response_code(400);
            echo json_encode(['error' => 'Banner Image or Video URL is required']);
            exit;
        }

        if (empty($title)) {
            $title = 'Banner ' . date('Y-m-d H:i');
        }

        $subtitle = trim($input['subtitle'] ?? 'Exclusive Offer Going');
        $price = trim($input['price'] ?? '18,999.00');
        $discount = trim($input['discount'] ?? 'SAVE 25%');
        $button_text = trim($input['button_text'] ?? 'Buy Now');
        $button_link = trim($input['button_link'] ?? 'Machines');
        $glow_color = trim($input['glow_color'] ?? 'from-blue-500/10 to-indigo-500/5');
        $accent_badge = trim($input['accent_badge'] ?? 'bg-blue-50 text-blue-700 border-blue-200');
        $display_order = isset($input['display_order']) ? (int)$input['display_order'] : 0;
        $is_active = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1;

        try {
            $stmt = $db->prepare("
                INSERT INTO hero_slides (subtitle, title, price, discount, button_text, button_link, glow_color, accent_badge, image_url, display_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $subtitle, $title, $price, $discount, $button_text, $button_link, $glow_color, $accent_badge, $image_url, $display_order, $is_active
            ]);

            $newId = (int)$db->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Hero slide created successfully',
                'slide_id' => $newId
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create slide: ' . $e->getMessage()]);
            exit;
        }
    }

    if ($action === 'update') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $title = trim($input['title'] ?? '');
        $image_url = trim($input['image_url'] ?? '');

        if (!$id || empty($image_url)) {
            http_response_code(400);
            echo json_encode(['error' => 'ID and Image/Video URL are required']);
            exit;
        }

        if (empty($title)) {
            $title = 'Banner ' . $id;
        }

        $subtitle = trim($input['subtitle'] ?? 'Exclusive Offer Going');
        $price = trim($input['price'] ?? '18,999.00');
        $discount = trim($input['discount'] ?? 'SAVE 25%');
        $button_text = trim($input['button_text'] ?? 'Buy Now');
        $button_link = trim($input['button_link'] ?? 'Machines');
        $glow_color = trim($input['glow_color'] ?? 'from-blue-500/10 to-indigo-500/5');
        $accent_badge = trim($input['accent_badge'] ?? 'bg-blue-50 text-blue-700 border-blue-200');
        $display_order = isset($input['display_order']) ? (int)$input['display_order'] : 0;
        $is_active = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1;

        try {
            $stmt = $db->prepare("
                UPDATE hero_slides 
                SET subtitle = ?, title = ?, price = ?, discount = ?, button_text = ?, button_link = ?, glow_color = ?, accent_badge = ?, image_url = ?, display_order = ?, is_active = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $subtitle, $title, $price, $discount, $button_text, $button_link, $glow_color, $accent_badge, $image_url, $display_order, $is_active, $id
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Hero slide updated successfully'
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update slide: ' . $e->getMessage()]);
            exit;
        }
    }

    if ($action === 'toggle') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Slide ID is required']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE hero_slides SET is_active = NOT is_active WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Slide visibility toggled successfully'
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to toggle slide: ' . $e->getMessage()]);
            exit;
        }
    }

    if ($action === 'delete') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Slide ID is required']);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM hero_slides WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Slide deleted successfully'
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete slide: ' . $e->getMessage()]);
            exit;
        }
    }

    if ($action === 'reorder') {
        $orderList = $input['orders'] ?? [];
        if (!is_array($orderList)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid order array']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE hero_slides SET display_order = ? WHERE id = ?");
            foreach ($orderList as $item) {
                if (isset($item['id']) && isset($item['display_order'])) {
                    $stmt->execute([(int)$item['display_order'], (int)$item['id']]);
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Hero slides reordered successfully'
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reorder slides: ' . $e->getMessage()]);
            exit;
        }
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
