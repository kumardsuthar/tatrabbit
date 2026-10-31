<?php
// share.php - Server-Side Open Graph & Meta Tag Pre-renderer for WhatsApp, Facebook, Twitter & Social Crawlers
// Ensures dynamic product & blog images and titles display perfectly when links are shared.

// 1. Determine Type & Slug from Query Params or Request URI
$type = $_GET['type'] ?? '';
$slug = $_GET['slug'] ?? '';

// Strip 'id/' prefix if passed in slug (e.g. from /product/id/25)
if (!empty($slug) && preg_match('~^id/(.+)~i', $slug, $sm)) {
    $slug = $sm[1];
}
$slug = trim($slug, "/ \t\n\r\0\x0B");

if (empty($type) || empty($slug)) {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (preg_match('~^/product/(?:id/)?([^/?#]+)~i', $path, $m)) {
        $type = 'product';
        $slug = trim($m[1], "/ \t\n\r\0\x0B");
    } elseif (preg_match('~^/blog/([^/?#]+)~i', $path, $m)) {
        $type = 'blog';
        $slug = trim($m[1], "/ \t\n\r\0\x0B");
    }
}

$siteUrl = 'https://tatrabbit.com';
$defaultTitle = 'TatRabbit | Professional Tattoo Machines, Needles & Inks';
$defaultDesc = "India's premier manufacturer and distributor of surgical-grade rotary tattoo pen machines, EO gas sterilized cartridge needles, obsidian lining inks, and studio digital power supplies.";
$defaultImage = $siteUrl . '/logo.jpeg';

$title = $defaultTitle;
$desc = $defaultDesc;
$image = $defaultImage;
$pageUrl = $siteUrl . ($_SERVER['REQUEST_URI'] ?? '');

$dataFetched = false;

// 2. Try Method 1: Direct Database Connection
$pdo = null;
$envFiles = [
    __DIR__ . '/backend/.env',
    __DIR__ . '/.env',
    __DIR__ . '/../backend/.env',
    __DIR__ . '/api/.env'
];

foreach ($envFiles as $ef) {
    if (file_exists($ef)) {
        $lines = @file($ef, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $env = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                $env[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
            }
        }
        if (!empty($env['DB_NAME'])) {
            $hostsToTry = array_unique([$env['DB_HOST'] ?? '127.0.0.1', '127.0.0.1', 'localhost']);
            $port = $env['DB_PORT'] ?? '3306';
            $db   = $env['DB_NAME'] ?? '';
            $user = $env['DB_USER'] ?? 'root';
            $pass = $env['DB_PASS'] ?? '';

            foreach ($hostsToTry as $h) {
                try {
                    $dsn = "mysql:host=$h;port=$port;dbname=$db;charset=utf8mb4";
                    if ($h === 'localhost' && file_exists('/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock')) {
                        $dsn .= ";unix_socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock";
                    }
                    $pdo = new PDO($dsn, $user, $pass, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_TIMEOUT => 2,
                    ]);
                    if ($pdo) break 2;
                } catch (Throwable $e) {}
            }
        }
    }
}

// 3. Query DB if connected
if ($pdo && !empty($slug)) {
    try {
        if ($type === 'product') {
            $stmt = $pdo->prepare("SELECT id, title, description, base_price, offer_price, image_url, gallery_images FROM products WHERE slug = ? OR id = ? LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $row = $stmt->fetch();
            if ($row) {
                $rawTitle = trim($row['title'] ?? '');
                $title = $rawTitle ? (stripos($rawTitle, 'TatRabbit') !== false ? $rawTitle : $rawTitle . ' | TatRabbit') : $defaultTitle;

                $price = !empty($row['offer_price']) && floatval($row['offer_price']) > 0
                    ? floatval($row['offer_price'])
                    : floatval($row['base_price'] ?? 0);

                $cleanDesc = trim(strip_tags(html_entity_decode($row['description'] ?? '', ENT_QUOTES, 'UTF-8')));
                $cleanDesc = preg_replace('/\s+/', ' ', $cleanDesc);
                if (strlen($cleanDesc) > 160) {
                    $cleanDesc = substr($cleanDesc, 0, 157) . '...';
                }

                if ($price > 0) {
                    $desc = '₹' . number_format($price, 0) . ' - ' . ($cleanDesc ?: $defaultDesc);
                } else {
                    $desc = $cleanDesc ?: $defaultDesc;
                }

                $imgCandidate = trim($row['image_url'] ?? '');
                if (empty($imgCandidate) && !empty($row['gallery_images'])) {
                    $gal = json_decode($row['gallery_images'], true);
                    if (is_array($gal) && count($gal) > 0) {
                        $imgCandidate = trim($gal[0]);
                    }
                }

                if (!empty($imgCandidate) && stripos($imgCandidate, 'unsplash.com') === false) {
                    $image = $imgCandidate;
                }
                $dataFetched = true;
            }
        } elseif ($type === 'blog') {
            $stmt = $pdo->prepare("SELECT id, title, content, image_url FROM blogs WHERE slug = ? OR id = ? LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $row = $stmt->fetch();
            if ($row) {
                $rawTitle = trim($row['title'] ?? '');
                $title = $rawTitle ? (stripos($rawTitle, 'TatRabbit') !== false ? $rawTitle : $rawTitle . ' | TatRabbit') : $defaultTitle;

                $cleanDesc = trim(strip_tags(html_entity_decode($row['content'] ?? '', ENT_QUOTES, 'UTF-8')));
                $cleanDesc = preg_replace('/\s+/', ' ', $cleanDesc);
                if (strlen($cleanDesc) > 160) {
                    $cleanDesc = substr($cleanDesc, 0, 157) . '...';
                }
                $desc = $cleanDesc ?: $defaultDesc;

                $imgCandidate = trim($row['image_url'] ?? '');
                if (!empty($imgCandidate) && stripos($imgCandidate, 'unsplash.com') === false) {
                    $image = $imgCandidate;
                }
                $dataFetched = true;
            }
        }
    } catch (Throwable $e) {}
}

// 4. Method 2 Fallback: If DB query didn't succeed, call local API endpoint
if (!$dataFetched && !empty($slug) && $type === 'product') {
    $apiUrl = $siteUrl . '/api/products/detail.php?slug=' . urlencode($slug);
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 3,
            'header' => "Accept: application/json\r\nUser-Agent: TatRabbit-Share-Bot\r\n"
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    $json = @file_get_contents($apiUrl, false, $ctx);
    if ($json) {
        $res = json_decode($json, true);
        $prod = $res['product'] ?? $res;
        if (!empty($prod['title'])) {
            $rawTitle = trim($prod['title']);
            $title = stripos($rawTitle, 'TatRabbit') !== false ? $rawTitle : $rawTitle . ' | TatRabbit';

            $price = !empty($prod['offer_price']) && floatval($prod['offer_price']) > 0
                ? floatval($prod['offer_price'])
                : floatval($prod['base_price'] ?? 0);

            $cleanDesc = trim(strip_tags(html_entity_decode($prod['description'] ?? '', ENT_QUOTES, 'UTF-8')));
            $cleanDesc = preg_replace('/\s+/', ' ', $cleanDesc);
            if (strlen($cleanDesc) > 160) {
                $cleanDesc = substr($cleanDesc, 0, 157) . '...';
            }

            if ($price > 0) {
                $desc = '₹' . number_format($price, 0) . ' - ' . ($cleanDesc ?: $defaultDesc);
            } else {
                $desc = $cleanDesc ?: $defaultDesc;
            }

            $imgCandidate = trim($prod['image_url'] ?? '');
            if (empty($imgCandidate) && !empty($prod['gallery_images']) && is_array($prod['gallery_images'])) {
                $imgCandidate = trim($prod['gallery_images'][0] ?? '');
            }

            if (!empty($imgCandidate) && stripos($imgCandidate, 'unsplash.com') === false) {
                $image = $imgCandidate;
            }
        }
    }
}

// 5. Normalize Image URL to Full HTTPS
if (!preg_match('#^https?://#i', $image)) {
    $image = $siteUrl . '/' . ltrim($image, '/');
}
if (stripos($image, 'http://') === 0 && stripos($image, 'tatrabbit.com') !== false) {
    $image = 'https://' . substr($image, 7);
}
// Clean legacy upload paths
$image = str_ireplace('/tatrabbit/avon-tattoo-store/backend/uploads/', '/uploads/', $image);

// Determine MIME type
$ext = strtolower(pathinfo(parse_url($image, PHP_URL_PATH), PATHINFO_EXTENSION));
$mimeType = 'image/jpeg';
if ($ext === 'png') $mimeType = 'image/png';
elseif ($ext === 'webp') $mimeType = 'image/webp';

// 6. Load and Inject into index.html
$indexPath = __DIR__ . '/index.html';
if (!file_exists($indexPath)) {
    $indexPath = __DIR__ . '/../index.html';
}
if (!file_exists($indexPath)) {
    $indexPath = dirname(__DIR__) . '/dist/index.html';
}

$html = file_exists($indexPath) ? file_get_contents($indexPath) : '';

if (!$html) {
    echo "<!DOCTYPE html><html><head><title>" . htmlspecialchars($title) . "</title>";
    echo '<meta property="og:title" content="' . htmlspecialchars($title) . '">';
    echo '<meta property="og:description" content="' . htmlspecialchars($desc) . '">';
    echo '<meta property="og:image" content="' . htmlspecialchars($image) . '">';
    echo '<meta property="og:url" content="' . htmlspecialchars($pageUrl) . '">';
    echo "</head><body><script>window.location.href='" . htmlspecialchars($pageUrl) . "';</script></body></html>";
    exit;
}

// Replace Meta Tags in index.html
$safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
$safeDesc = htmlspecialchars($desc, ENT_QUOTES, 'UTF-8');
$safeImage = htmlspecialchars($image, ENT_QUOTES, 'UTF-8');
$safeUrl = htmlspecialchars($pageUrl, ENT_QUOTES, 'UTF-8');

// Replace Title
$html = preg_replace('#<title>.*?</title>#is', "<title>{$safeTitle}</title>", $html, 1);

// Replace / Insert Description
$html = preg_replace('#<meta\s+name=["\']description["\'].*?>#is', "<meta name=\"description\" content=\"{$safeDesc}\" />", $html, 1);

// Replace OpenGraph Tags
$html = preg_replace('#<meta\s+property=["\']og:title["\'].*?>#is', "<meta property=\"og:title\" content=\"{$safeTitle}\" />", $html, 1);
$html = preg_replace('#<meta\s+property=["\']og:description["\'].*?>#is', "<meta property=\"og:description\" content=\"{$safeDesc}\" />", $html, 1);

// Remove existing og:image sub-tags to prevent duplication
$html = preg_replace('#<meta\s+property=["\']og:image:secure_url["\'].*?>\s*#is', '', $html);
$html = preg_replace('#<meta\s+property=["\']og:image:type["\'].*?>\s*#is', '', $html);
$html = preg_replace('#<meta\s+property=["\']og:image:width["\'].*?>\s*#is', '', $html);
$html = preg_replace('#<meta\s+property=["\']og:image:height["\'].*?>\s*#is', '', $html);

// Remove any existing og:url
$html = preg_replace('#<meta\s+property=["\']og:url["\'].*?>\s*#is', '', $html);

// Replace og:image with full block including og:url
$ogImageBlock = "<meta property=\"og:image\" content=\"{$safeImage}\" />\n"
              . "    <meta property=\"og:image:secure_url\" content=\"{$safeImage}\" />\n"
              . "    <meta property=\"og:image:type\" content=\"{$mimeType}\" />\n"
              . "    <meta property=\"og:image:width\" content=\"800\" />\n"
              . "    <meta property=\"og:image:height\" content=\"800\" />\n"
              . "    <meta property=\"og:url\" content=\"{$safeUrl}\" />";
$html = preg_replace('#<meta\s+property=["\']og:image["\'].*?>#is', $ogImageBlock, $html, 1);

// Replace Twitter Tags
$html = preg_replace('#<meta\s+name=["\']twitter:title["\'].*?>#is', "<meta name=\"twitter:title\" content=\"{$safeTitle}\" />", $html, 1);
$html = preg_replace('#<meta\s+name=["\']twitter:description["\'].*?>#is', "<meta name=\"twitter:description\" content=\"{$safeDesc}\" />", $html, 1);
$html = preg_replace('#<meta\s+name=["\']twitter:image["\'].*?>#is', "<meta name=\"twitter:image\" content=\"{$safeImage}\" />", $html, 1);

// Send appropriate headers and output
header('Content-Type: text/html; charset=UTF-8');
echo $html;
exit;
