<?php
// backend/api/layout.php
require_once __DIR__ . '/../middleware/Cors.php';
require_once __DIR__ . '/../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Ensure all custom showcases from site_settings exist in site_layout table
    try {
        $delCheck = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'custom_showcase_deleted' LIMIT 1");
        $isPrimaryDeleted = $delCheck ? ($delCheck->fetchColumn() === '1') : false;

        $scStmt = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'custom_showcases_list' LIMIT 1");
        $scRaw = $scStmt ? $scStmt->fetchColumn() : null;
        $scList = $scRaw ? json_decode($scRaw, true) : null;

        if (is_array($scList) && !empty($scList)) {
            $maxOrderStmt = $db->query("SELECT COALESCE(MAX(display_order), 0) FROM site_layout");
            $currOrder = $maxOrderStmt ? (int)$maxOrderStmt->fetchColumn() : 3;

            $insStmt = $db->prepare("
                INSERT IGNORE INTO site_layout (section_key, section_name, display_order, is_visible, target_page, position_slot)
                VALUES (?, ?, ?, 1, 'home', 'main')
            ");
            foreach ($scList as $sc) {
                $k = $sc['key'] ?? '';
                if ($k === 'custom_showcase' && $isPrimaryDeleted) continue;
                $t = !empty($sc['title']) ? "Curated Showcase: {$sc['title']}" : "Custom Catalog Showcase (Product Slider)";
                if ($k) {
                    $currOrder++;
                    $insStmt->execute([$k, $t, $currOrder]);
                }
            }
        } elseif (!$isPrimaryDeleted) {
            $checkStmt = $db->query("SELECT COUNT(*) FROM site_layout WHERE section_key = 'custom_showcase'");
            if ($checkStmt && $checkStmt->fetchColumn() == 0) {
                $titleStmt = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'custom_showcase_title' LIMIT 1");
                $storedTitle = $titleStmt ? $titleStmt->fetchColumn() : null;
                $secName = !empty($storedTitle) ? "Curated Showcase: $storedTitle" : "Custom Catalog Showcase (Product Slider)";
                
                $insStmt = $db->prepare("
                    INSERT IGNORE INTO site_layout (section_key, section_name, display_order, is_visible, target_page, position_slot)
                    VALUES ('custom_showcase', ?, 4, 1, 'home', 'main')
                ");
                $insStmt->execute([$secName]);
            }
        }
    } catch (Exception $e) {
        // quiet fallback
    }

    $page = $_GET['page'] ?? null;
    $slot = $_GET['slot'] ?? null;
    $isAdmin = isset($_GET['admin']) && ($_GET['admin'] === 'true' || $_GET['admin'] === '1');

    if ($isAdmin) {
        $stmt = $db->prepare("SELECT * FROM site_layout ORDER BY display_order ASC");
        $stmt->execute();
    } else {
        $query = "SELECT * FROM site_layout WHERE is_visible = 1";
        $params = [];

        if ($page) {
            $query .= " AND target_page = ?";
            $params[] = $page;
        }
        if ($slot) {
            $query .= " AND position_slot = ?";
            $params[] = $slot;
        }

        $query .= " ORDER BY display_order ASC";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
    }

    $sections = $stmt->fetchAll();

    foreach ($sections as &$sec) {
        $sec['id'] = (int)$sec['id'];
        $sec['display_order'] = (int)$sec['display_order'];
        $sec['is_visible'] = (int)$sec['is_visible'];
    }

    echo json_encode([
        'sections' => $sections,
        'count' => count($sections),
        'success' => true
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $sections = $input['sections'] ?? $input;

    if (!is_array($sections) || empty($sections)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or empty sections array provided']);
        exit;
    }

    try {
        $db->beginTransaction();

        $stmt = $db->prepare("
            INSERT INTO site_layout (section_key, section_name, display_order, is_visible, target_page, position_slot)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            section_name = VALUES(section_name),
            display_order = VALUES(display_order),
            is_visible = VALUES(is_visible),
            target_page = VALUES(target_page),
            position_slot = VALUES(position_slot)
        ");

        foreach ($sections as $sec) {
            $sectionKey = $sec['section_key'] ?? '';
            $sectionName = $sec['section_name'] ?? 'Custom Section';
            $displayOrder = isset($sec['display_order']) ? (int)$sec['display_order'] : 0;
            $isVisible = isset($sec['is_visible']) ? (int)$sec['is_visible'] : 1;
            $targetPage = $sec['target_page'] ?? 'home';
            $positionSlot = $sec['position_slot'] ?? 'main';

            if ($sectionKey) {
                $stmt->execute([$sectionKey, $sectionName, $displayOrder, $isVisible, $targetPage, $positionSlot]);
                if ($sectionKey === 'custom_showcase') {
                    $db->exec("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcase_deleted', '0') ON DUPLICATE KEY UPDATE setting_value = '0'");
                }
            }
        }

        $db->commit();

        echo json_encode([
            'message' => 'Site layout configuration updated successfully',
            'success' => true
        ]);
        exit;
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update layout: ' . $e->getMessage()]);
        exit;
    }
}

if ($method === 'DELETE') {
    $sectionKey = $_GET['section_key'] ?? $_GET['id'] ?? null;
    if (!$sectionKey) {
        $input = json_decode(file_get_contents('php://input'), true);
        $sectionKey = $input['section_key'] ?? $input['id'] ?? null;
    }

    if ($sectionKey) {
        try {
            $stmt = $db->prepare("DELETE FROM site_layout WHERE section_key = ? OR id = ?");
            $stmt->execute([$sectionKey, $sectionKey]);

            if ($sectionKey === 'custom_showcase') {
                $db->exec("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_showcase_deleted', '1') ON DUPLICATE KEY UPDATE setting_value = '1'");
            }

            // Also clean up from custom_showcases_list if it starts with custom_showcase
            if (strpos($sectionKey, 'custom_showcase') === 0) {
                $scStmt = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'custom_showcases_list' LIMIT 1");
                $scRaw = $scStmt ? $scStmt->fetchColumn() : null;
                $scList = $scRaw ? json_decode($scRaw, true) : null;
                if (is_array($scList)) {
                    $filtered = array_values(array_filter($scList, function($item) use ($sectionKey) {
                        return ($item['key'] ?? '') !== $sectionKey;
                    }));
                    $saveStmt = $db->prepare("UPDATE site_settings SET setting_value = ? WHERE setting_key = 'custom_showcases_list'");
                    $saveStmt->execute([json_encode($filtered)]);
                }
            }

            echo json_encode([
                'message' => 'Section deleted successfully from layout',
                'success' => true
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete section: ' . $e->getMessage()]);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'Section key or ID is required for deletion']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
