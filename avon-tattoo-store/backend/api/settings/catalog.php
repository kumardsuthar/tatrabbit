<?php
// backend/api/settings/catalog.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to load all showcases from site_settings
function getShowcasesList($db) {
    $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'custom_showcases_list' LIMIT 1");
    $stmt->execute();
    $raw = $stmt->fetchColumn();
    $list = $raw ? json_decode($raw, true) : null;

    if (!is_array($list) || empty($list)) {
        // Fallback: migrate from legacy single showcase settings
        $legacyStmt = $db->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'custom_showcase_%'");
        $legacyStmt->execute();
        $legacyRows = $legacyStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $primaryTitle = $legacyRows['custom_showcase_title'] ?? 'Curated Studio Showcase';
        $primaryBadge = $legacyRows['custom_showcase_badge'] ?? 'Featured Selection';
        $primaryDesc = $legacyRows['custom_showcase_desc'] ?? '';
        $rawProds = $legacyRows['custom_showcase_products'] ?? '[]';
        $prods = json_decode($rawProds, true);
        if (!is_array($prods)) $prods = [];
        $mode = $legacyRows['custom_showcase_mode'] ?? 'slider';

        $list = [
            [
                'key' => 'custom_showcase',
                'title' => $primaryTitle,
                'badge' => $primaryBadge,
                'description' => $primaryDesc,
                'product_ids' => $prods,
                'display_mode' => $mode
            ]
        ];
    }

    // Clean up hardcoded boilerplate descriptions & ensure badge field exists
    $needsResave = false;
    foreach ($list as &$item) {
        if (!isset($item['badge']) || $item['badge'] === '' || $item['badge'] === 'Studio Showcase Collection') {
            $item['badge'] = 'Featured Selection';
            $needsResave = true;
        }
        if (isset($item['description'])) {
            $d = trim($item['description']);
            if ($d === 'Curated collection of high-performance tattoo supplies and accessories.' ||
                $d === 'Hand-picked professional tattoo equipment selected for master artists.') {
                $item['description'] = '';
                $needsResave = true;
            }
        }
    }

    if ($needsResave) {
        $saveStmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcases_list', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $jsonStr = json_encode($list);
        $saveStmt->execute([$jsonStr, $jsonStr]);
    }

    return $list;
}

if ($method === 'GET') {
    try {
        $showcases = getShowcasesList($db);
        $reqKey = $_GET['key'] ?? null;

        if ($reqKey) {
            // Find specific showcase
            $found = null;
            foreach ($showcases as $sc) {
                if ($sc['key'] === $reqKey) {
                    $found = $sc;
                    break;
                }
            }
            if ($found) {
                echo json_encode(array_merge($found, [
                    'showcases' => $showcases,
                    'count' => count($showcases),
                    'success' => true
                ]));
                exit;
            }
        }

        // Default or all
        $primary = $showcases[0] ?? [
            'key' => 'custom_showcase',
            'title' => 'Curated Studio Showcase',
            'badge' => 'Featured Selection',
            'description' => '',
            'product_ids' => [],
            'display_mode' => 'slider'
        ];

        echo json_encode([
            'key' => $primary['key'],
            'title' => $primary['title'],
            'badge' => $primary['badge'] ?? 'Featured Selection',
            'description' => $primary['description'] ?? '',
            'product_ids' => $primary['product_ids'],
            'display_mode' => $primary['display_mode'],
            'showcases' => $showcases,
            'count' => count($showcases),
            'success' => true
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch catalog settings: ' . $e->getMessage()]);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }

    $title = trim($input['title'] ?? 'Curated Studio Showcase');
    $badge = trim($input['badge'] ?? 'Featured Selection');
    $desc = trim($input['description'] ?? '');
    $productIds = is_array($input['product_ids'] ?? null) ? array_values(array_unique(array_map('intval', $input['product_ids']))) : [];
    $displayMode = in_array($input['display_mode'] ?? 'slider', ['grid', 'slider']) ? $input['display_mode'] : 'slider';
    
    $reqKey = trim($input['key'] ?? '');

    try {
        $showcases = getShowcasesList($db);

        // If key is empty or 'new', auto-generate unique key
        if (empty($reqKey) || $reqKey === 'new') {
            $baseKey = 'custom_showcase';
            $counter = 2;
            $uniqueKey = $baseKey;
            
            $existingKeys = array_column($showcases, 'key');
            while (in_array($uniqueKey, $existingKeys)) {
                $uniqueKey = "{$baseKey}_{$counter}";
                $counter++;
            }
            $reqKey = $uniqueKey;
        }

        // Upsert showcase in showcases list
        $updated = false;
        $savedShowcase = [
            'key' => $reqKey,
            'title' => $title,
            'badge' => $badge,
            'description' => $desc,
            'product_ids' => $productIds,
            'display_mode' => $displayMode
        ];

        foreach ($showcases as &$sc) {
            if ($sc['key'] === $reqKey) {
                $sc = $savedShowcase;
                $updated = true;
                break;
            }
        }
        if (!$updated) {
            $showcases[] = $savedShowcase;
        }

        // Save updated showcases list JSON into site_settings
        $saveStmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcases_list', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $jsonStr = json_encode($showcases);
        $saveStmt->execute([$jsonStr, $jsonStr]);

        // If primary key, also update legacy keys for backward compatibility
        if ($reqKey === 'custom_showcase') {
            $stmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $legacySettings = [
                'custom_showcase_title' => $title,
                'custom_showcase_badge' => $badge,
                'custom_showcase_desc' => $desc,
                'custom_showcase_products' => json_encode($productIds),
                'custom_showcase_mode' => $displayMode
            ];
            foreach ($legacySettings as $k => $v) {
                $stmt->execute([$k, $v, $v]);
            }
        }

        // Automatically sync/upsert to site_layout table so it appears in Advanced Page Layout Builder
        $secDisplayName = !empty($title) ? "Curated Showcase: $title" : "Custom Catalog Showcase (Product Slider)";
        
        // Calculate display order if new
        $maxOrderStmt = $db->query("SELECT COALESCE(MAX(display_order), 0) FROM site_layout");
        $maxOrder = $maxOrderStmt ? (int)$maxOrderStmt->fetchColumn() + 1 : 4;

        $layoutStmt = $db->prepare("
            INSERT INTO site_layout (section_key, section_name, display_order, is_visible, target_page, position_slot)
            VALUES (?, ?, ?, 1, 'home', 'main')
            ON DUPLICATE KEY UPDATE section_name = ?
        ");
        $layoutStmt->execute([$reqKey, $secDisplayName, $maxOrder, $secDisplayName]);

        // Clear deleted flag so it can appear again
        if ($reqKey === 'custom_showcase') {
            $db->exec("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcase_deleted', '0') ON DUPLICATE KEY UPDATE setting_value = '0'");
        }

        echo json_encode([
            'message' => 'Showcase section saved and synced to layout successfully',
            'showcase' => $savedShowcase,
            'showcases' => $showcases,
            'key' => $reqKey,
            'title' => $title,
            'badge' => $badge,
            'description' => $desc,
            'product_ids' => $productIds,
            'display_mode' => $displayMode,
            'success' => true
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save catalog settings: ' . $e->getMessage()]);
        exit;
    }
}

if ($method === 'DELETE') {
    $reqKey = $_GET['key'] ?? null;
    if (!$reqKey) {
        $input = json_decode(file_get_contents('php://input'), true);
        $reqKey = $input['key'] ?? null;
    }

    if ($reqKey) {
        try {
            $showcases = getShowcasesList($db);
            $filtered = [];
            foreach ($showcases as $sc) {
                if ($sc['key'] !== $reqKey) {
                    $filtered[] = $sc;
                }
            }

            // Save updated showcases list JSON into site_settings
            $saveStmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcases_list', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $jsonStr = json_encode($filtered);
            $saveStmt->execute([$jsonStr, $jsonStr]);

            // Delete from site_layout
            $delStmt = $db->prepare("DELETE FROM site_layout WHERE section_key = ?");
            $delStmt->execute([$reqKey]);

            if ($reqKey === 'custom_showcase') {
                $db->exec("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcase_deleted', '1') ON DUPLICATE KEY UPDATE setting_value = '1'");
            }

            echo json_encode([
                'message' => "Showcase {$reqKey} removed successfully",
                'showcases' => $filtered,
                'success' => true
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete showcase: ' . $e->getMessage()]);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'Showcase key is required for deletion']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
