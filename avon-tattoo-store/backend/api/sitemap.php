<?php
// backend/api/sitemap.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");

require_once __DIR__ . '/../config/db.php';

$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = $protocol . '://' . $host;

$db = getDbConnection();

// Fetch products
$productStmt = $db->query("SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY id DESC");
$products = $productStmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch blogs
$blogStmt = $db->query("SELECT slug, created_at FROM blogs WHERE is_published = 1 ORDER BY id DESC");
$blogs = $blogStmt->fetchAll(PDO::FETCH_ASSOC);

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <!-- Static Primary Pages -->
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/shop</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/blog</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/contact</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc><?= htmlspecialchars($baseUrl) ?>/track</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>

    <!-- Dynamic Products URLs -->
    <?php foreach ($products as $p): ?>
    <url>
        <loc><?= htmlspecialchars($baseUrl . '/product/' . $p['slug']) ?></loc>
        <lastmod><?= date('c', strtotime($p['updated_at'] ?? 'now')) ?></lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <?php endforeach; ?>

    <!-- Dynamic Blogs URLs -->
    <?php foreach ($blogs as $b): ?>
    <url>
        <loc><?= htmlspecialchars($baseUrl . '/blog/' . $b['slug']) ?></loc>
        <lastmod><?= date('c', strtotime($b['created_at'] ?? 'now')) ?></lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <?php endforeach; ?>

</urlset>
