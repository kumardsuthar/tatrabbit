<?php
// backend/api/products/create.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();
authenticateAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$title = trim($input['title'] ?? '');
$rawSlug = trim($input['slug'] ?? '');
$variant_title = trim($input['variant_title'] ?? '');
$description = trim($input['description'] ?? '');
$warranty_text = isset($input['warranty_text']) ? trim($input['warranty_text']) : '';
$base_price = (float)($input['base_price'] ?? 0);
$offer_price = isset($input['offer_price']) && $input['offer_price'] !== '' ? (float)$input['offer_price'] : null;
$stock = (int)($input['stock'] ?? 0);
$category = trim($input['category'] ?? 'General');
$image_url = trim($input['image_url'] ?? '');
$gallery_images = isset($input['gallery_images']) && is_array($input['gallery_images']) ? json_encode($input['gallery_images']) : json_encode([]);
$faqs = isset($input['faqs']) ? json_encode($input['faqs']) : json_encode([]);
$variants = $input['variants'] ?? [];

if (empty($title) || $base_price <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Product title and positive base price are required']);
    exit;
}

// Generate unique slug
if (empty($rawSlug)) {
    $rawSlug = $title;
}
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $rawSlug), '-'));
$db = getDbConnection();

// Ensure variant_title column exists
try {
    $db->exec("ALTER TABLE products ADD COLUMN variant_title VARCHAR(150) NULL AFTER slug");
} catch (Exception $e) {}

// Ensure warranty_text column exists
try {
    $db->exec("ALTER TABLE products ADD COLUMN warranty_text VARCHAR(500) NULL DEFAULT '100% EO Gas Sterilized • 1-Year Master Tech Hardware Warranty'");
} catch (Exception $e) {}

// Ensure unique slug
$slugStmt = $db->prepare("SELECT id FROM products WHERE slug = ?");
$slugStmt->execute([$slug]);
if ($slugStmt->fetch()) {
    $slug .= '-' . time();
}

$db->beginTransaction();
try {
    $stmt = $db->prepare("INSERT INTO products (title, slug, variant_title, description, warranty_text, faqs, base_price, offer_price, stock, category, image_url, gallery_images, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $stmt->execute([$title, $slug, $variant_title, $description, $warranty_text, $faqs, $base_price, $offer_price, $stock, $category, $image_url, $gallery_images]);
    $productId = $db->lastInsertId();

    if (!empty($variants) && is_array($variants)) {
        $varStmt = $db->prepare("INSERT INTO product_variants (product_id, name, price, offer_price, stock, attributes) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($variants as $v) {
            $vName = trim($v['name'] ?? 'Default Variant');
            $vPrice = (float)($v['price'] ?? $base_price);
            $vOfferPrice = isset($v['offer_price']) && $v['offer_price'] !== '' ? (float)$v['offer_price'] : null;
            $vStock = (int)($v['stock'] ?? $stock);
            $vAttr = isset($v['attributes']) ? json_encode($v['attributes']) : json_encode(new stdClass());
            $varStmt->execute([$productId, $vName, $vPrice, $vOfferPrice, $vStock, $vAttr]);
        }
    }

    $db->commit();
    echo json_encode([
        'message' => 'Product created successfully',
        'product_id' => $productId
    ]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
}
