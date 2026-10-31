<?php
// backend/api/products/list.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();

$category = $_GET['category'] ?? 'All';
$search = trim($_GET['search'] ?? '');
$minPrice = isset($_GET['min_price']) && $_GET['min_price'] !== '' ? (float)$_GET['min_price'] : null;
$maxPrice = isset($_GET['max_price']) && $_GET['max_price'] !== '' ? (float)$_GET['max_price'] : null;
$inStock = isset($_GET['in_stock']) ? (int)$_GET['in_stock'] : 0;
$sort = $_GET['sort'] ?? 'newest';

$query = "
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
    WHERE p.is_active = 1
";
$params = [];

if ($category && $category !== 'All') {
    $query .= " AND p.category = ?";
    $params[] = $category;
}

if (!empty($search)) {
    $query .= " AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($minPrice !== null) {
    $query .= " AND p.base_price >= ?";
    $params[] = $minPrice;
}

if ($maxPrice !== null) {
    $query .= " AND p.base_price <= ?";
    $params[] = $maxPrice;
}

if ($inStock === 1) {
    $query .= " AND p.stock > 0";
}

switch ($sort) {
    case 'price_asc':
        $query .= " ORDER BY p.base_price ASC";
        break;
    case 'price_desc':
        $query .= " ORDER BY p.base_price DESC";
        break;
    case 'title_asc':
        $query .= " ORDER BY p.title ASC";
        break;
    case 'title_desc':
        $query .= " ORDER BY p.title DESC";
        break;
    case 'newest':
    default:
        $query .= " ORDER BY p.id DESC";
        break;
}

$stmt = $db->prepare($query);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Attach variants to each product
foreach ($products as &$product) {
    $product['faqs'] = $product['faqs'] ? json_decode($product['faqs'], true) : [];
    
    $varStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
    $varStmt->execute([$product['id']]);
    $variants = $varStmt->fetchAll();

    foreach ($variants as &$v) {
        $v['attributes'] = json_decode($v['attributes'], true);
    }
    $product['variants'] = $variants;
}

// Category counts aggregation with custom metadata (title, description, image_url)
$catStmt = $db->query("SELECT category, COUNT(*) as count FROM products WHERE is_active = 1 GROUP BY category");
$categoryCounts = $catStmt->fetchAll();

$catMetaMap = [];
try {
    $metaStmt = $db->query("SELECT name, title, description, image_url FROM categories WHERE is_active = 1");
    if ($metaStmt) {
        foreach ($metaStmt->fetchAll() as $row) {
            $catMetaMap[$row['name']] = $row;
        }
    }
} catch (Exception $ignored) {}

foreach ($categoryCounts as &$c) {
    $cName = $c['category'];
    $c['title'] = $catMetaMap[$cName]['title'] ?? '';
    $c['description'] = $catMetaMap[$cName]['description'] ?? '';
    $c['image_url'] = $catMetaMap[$cName]['image_url'] ?? '';
}
unset($c);

$totalStmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
$totalCount = (int)($totalStmt->fetch()['total'] ?? 0);

// Global min/max prices
$priceRangeStmt = $db->query("SELECT MIN(base_price) as min_price, MAX(base_price) as max_price FROM products WHERE is_active = 1");
$priceBounds = $priceRangeStmt->fetch();

echo json_encode([
    'products' => $products,
    'total' => count($products),
    'categories' => array_merge([['category' => 'All', 'count' => $totalCount, 'title' => '', 'description' => '']], $categoryCounts),
    'price_bounds' => [
        'min' => (float)($priceBounds['min_price'] ?? 0),
        'max' => (float)($priceBounds['max_price'] ?? 50000)
    ]
]);
