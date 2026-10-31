<?php
// backend/api/products/detail.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$identifier = $_GET['slug'] ?? $_GET['id'] ?? null;

if (!$identifier) {
    http_response_code(400);
    echo json_encode(['error' => 'Product slug or ID is required']);
    exit;
}

$stmt = $db->prepare("SELECT * FROM products WHERE slug = ? OR id = ?");
$stmt->execute([$identifier, $identifier]);

$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    echo json_encode(['error' => 'Product not found']);
    exit;
}

$product['faqs'] = $product['faqs'] ? json_decode($product['faqs'], true) : [];
$product['gallery_images'] = isset($product['gallery_images']) && $product['gallery_images'] ? json_decode($product['gallery_images'], true) : [];

$varStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
$varStmt->execute([$product['id']]);
$variants = $varStmt->fetchAll();

foreach ($variants as &$v) {
    $v['attributes'] = json_decode($v['attributes'], true);
}
$product['variants'] = $variants;

// 1. Fetch approved reviews for this product
$revStmt = $db->prepare("SELECT * FROM product_reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC");
$revStmt->execute([$product['id']]);
$product['reviews'] = $revStmt->fetchAll();
$product['reviews_count'] = count($product['reviews']);
$product['rating'] = $product['reviews_count'] > 0 
    ? round(array_sum(array_column($product['reviews'], 'rating')) / $product['reviews_count'], 1) 
    : 0;
$product['avg_rating'] = $product['rating'];

// 2. Fetch similar products in same category (or fallback to latest active products)
$simQuery = "
    SELECT p.*, 
           COALESCE(r.reviews_count, 0) AS reviews_count,
           COALESCE(r.avg_rating, 0) AS rating,
           COALESCE(r.avg_rating, 0) AS avg_rating
    FROM products p
    LEFT JOIN (
        SELECT product_id, 
               COUNT(*) AS reviews_count, 
               ROUND(AVG(rating), 1) AS avg_rating 
        FROM product_reviews 
        WHERE is_approved = 1 
        GROUP BY product_id
    ) r ON p.id = r.product_id
    WHERE p.is_active = 1 AND p.id != ? AND p.category = ? 
    ORDER BY p.id DESC LIMIT 4
";
$simStmt = $db->prepare($simQuery);
$simStmt->execute([$product['id'], $product['category']]);
$similar = $simStmt->fetchAll();

if (count($similar) < 4) {
    $needed = 4 - count($similar);
    $existingIds = array_merge([$product['id']], array_column($similar, 'id'));
    $placeholders = implode(',', array_fill(0, count($existingIds), '?'));
    $fallbackQuery = "
        SELECT p.*, 
               COALESCE(r.reviews_count, 0) AS reviews_count,
               COALESCE(r.avg_rating, 0) AS rating,
               COALESCE(r.avg_rating, 0) AS avg_rating
        FROM products p
        LEFT JOIN (
            SELECT product_id, 
                   COUNT(*) AS reviews_count, 
                   ROUND(AVG(rating), 1) AS avg_rating 
            FROM product_reviews 
            WHERE is_approved = 1 
            GROUP BY product_id
        ) r ON p.id = r.product_id
        WHERE p.is_active = 1 AND p.id NOT IN ($placeholders) 
        ORDER BY p.id DESC LIMIT $needed
    ";
    $fallbackStmt = $db->prepare($fallbackQuery);
    $fallbackStmt->execute($existingIds);
    $fallback = $fallbackStmt->fetchAll();
    $similar = array_merge($similar, $fallback);
}

foreach ($similar as &$sProd) {
    $sProd['faqs'] = $sProd['faqs'] ? json_decode($sProd['faqs'], true) : [];
    $sProd['gallery_images'] = isset($sProd['gallery_images']) && $sProd['gallery_images'] ? json_decode($sProd['gallery_images'], true) : [];
    
    $svStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
    $svStmt->execute([$sProd['id']]);
    $sVariants = $svStmt->fetchAll();
    foreach ($sVariants as &$sv) {
        $sv['attributes'] = json_decode($sv['attributes'], true);
    }
    $sProd['variants'] = $sVariants;
}
$product['similar_products'] = $similar;

echo json_encode(['product' => $product]);

