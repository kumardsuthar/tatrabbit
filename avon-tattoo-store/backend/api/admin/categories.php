<?php
// backend/api/admin/categories.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure categories table exists with title and description
$db->exec("CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `image_url` VARCHAR(500) NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `display_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Safe migration for live servers without manual SQL
try {
    $db->exec("ALTER TABLE categories ADD COLUMN IF NOT EXISTS `title` VARCHAR(255) NULL AFTER `image_url`");
    $db->exec("ALTER TABLE categories ADD COLUMN IF NOT EXISTS `description` TEXT NULL AFTER `title`");
} catch (Exception $ignored) {}

if ($method === 'GET') {
    try {
        // Fetch product counts per category
        $countStmt = $db->query("SELECT category, COUNT(*) as count FROM products WHERE is_active = 1 GROUP BY category");
        $countsData = $countStmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];

        // Fetch categories table
        $catStmt = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC");
        $dbCats = $catStmt->fetchAll(PDO::FETCH_ASSOC);

        $defaultCats = ['Machines', 'Needles', 'Inks', 'Power Supplies', 'Hygiene'];
        $processedNames = [];
        $result = [];

        foreach ($dbCats as $c) {
            $processedNames[] = $c['name'];
            $result[] = [
                'id' => (int)$c['id'],
                'name' => $c['name'],
                'image_url' => $c['image_url'] ?: '',
                'title' => $c['title'] ?: '',
                'description' => $c['description'] ?: '',
                'count' => isset($countsData[$c['name']]) ? (int)$countsData[$c['name']] : 0,
                'is_default' => in_array($c['name'], $defaultCats),
                'display_order' => (int)($c['display_order'] ?? 0)
            ];
        }

        // Add any categories present in products table that are not yet in categories table
        foreach ($countsData as $catName => $pCount) {
            if ($catName && !in_array($catName, $processedNames)) {
                $result[] = [
                    'id' => 0,
                    'name' => $catName,
                    'image_url' => '',
                    'title' => '',
                    'description' => '',
                    'count' => (int)$pCount,
                    'is_default' => in_array($catName, $defaultCats),
                    'display_order' => 99
                ];
            }
        }

        echo json_encode([
            'success' => true,
            'categories' => $result
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch categories: ' . $e->getMessage()]);
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

    // Action: CREATE
    if ($action === 'create') {
        $name = trim($input['name'] ?? '');
        $imageUrl = trim($input['image_url'] ?? '');
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Category name is required']);
            exit;
        }

        if (empty($imageUrl)) {
            $imageUrl = '';
        }

        // Check if exists
        $checkStmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
        $checkStmt->execute([$name]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => "Category '$name' already exists"]);
            exit;
        }

        $maxOrderStmt = $db->query("SELECT MAX(display_order) FROM categories");
        $maxOrder = (int)$maxOrderStmt->fetchColumn();

        $stmt = $db->prepare("INSERT INTO categories (name, image_url, title, description, display_order, is_active) VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->execute([$name, $imageUrl, $title, $description, $maxOrder + 1]);

        echo json_encode([
            'message' => "Category '$name' created successfully",
            'success' => true,
            'id' => $db->lastInsertId()
        ]);
        exit;
    }

    // Action: UPDATE / RENAME
    if ($action === 'update' || $action === 'rename') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $oldName = trim($input['old_name'] ?? '');
        $newName = trim($input['name'] ?? $input['new_name'] ?? '');
        $imageUrl = isset($input['image_url']) ? trim($input['image_url']) : null;
        $title = isset($input['title']) ? trim($input['title']) : null;
        $description = isset($input['description']) ? trim($input['description']) : null;

        if (empty($newName) && empty($oldName)) {
            http_response_code(400);
            echo json_encode(['error' => 'Category name is required']);
            exit;
        }

        if ($id > 0) {
            // Find existing row by ID
            $getStmt = $db->prepare("SELECT name FROM categories WHERE id = ?");
            $getStmt->execute([$id]);
            $existing = $getStmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                $oldName = $existing['name'];
            }
        }

        if (empty($oldName)) {
            $oldName = $newName;
        }

        // Update categories table
        if ($id > 0) {
            $updateSql = "UPDATE categories SET name = ?";
            $params = [$newName];
            if ($imageUrl !== null) {
                $updateSql .= ", image_url = ?";
                $params[] = $imageUrl;
            }
            if ($title !== null) {
                $updateSql .= ", title = ?";
                $params[] = $title;
            }
            if ($description !== null) {
                $updateSql .= ", description = ?";
                $params[] = $description;
            }
            $updateSql .= " WHERE id = ?";
            $params[] = $id;

            $stmt = $db->prepare($updateSql);
            $stmt->execute($params);
        } else {
            // Insert or Update by name
            $upsertStmt = $db->prepare("INSERT INTO categories (name, image_url, title, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), image_url = VALUES(image_url), title = VALUES(title), description = VALUES(description)");
            $upsertStmt->execute([$newName, $imageUrl ?: '', $title ?: '', $description ?: '']);
        }

        // If category name changed, update products
        if ($oldName && $oldName !== $newName) {
            $prodStmt = $db->prepare("UPDATE products SET category = ? WHERE category = ?");
            $prodStmt->execute([$newName, $oldName]);
        }

        echo json_encode([
            'message' => "Category '$newName' updated successfully",
            'success' => true
        ]);
        exit;
    }

    // Action: DELETE
    if ($action === 'delete') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = trim($input['name'] ?? '');

        if ($id > 0) {
            $getStmt = $db->prepare("SELECT name FROM categories WHERE id = ?");
            $getStmt->execute([$id]);
            $row = $getStmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $name = $row['name'];
            }
        }

        if (empty($name) && $id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Category ID or Name is required']);
            exit;
        }

        // Delete from categories table
        if ($id > 0) {
            $delStmt = $db->prepare("DELETE FROM categories WHERE id = ?");
            $delStmt->execute([$id]);
        } else if ($name) {
            $delStmt = $db->prepare("DELETE FROM categories WHERE name = ?");
            $delStmt->execute([$name]);
        }

        // Reassign products to 'Uncategorized'
        if ($name) {
            $reassignStmt = $db->prepare("UPDATE products SET category = 'Uncategorized' WHERE category = ?");
            $reassignStmt->execute([$name]);
        }

        echo json_encode([
            'message' => "Category '$name' deleted successfully",
            'success' => true
        ]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
