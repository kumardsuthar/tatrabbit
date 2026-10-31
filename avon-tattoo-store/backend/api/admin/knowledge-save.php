<?php
// backend/api/admin/knowledge-save.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

try {
    $pdo = getDbConnection();

    // Ensure knowledge_base table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS `knowledge_base` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `type` ENUM('url', 'note', 'file') NOT NULL DEFAULT 'note',
        `source` VARCHAR(500) NULL,
        `content` LONGTEXT NOT NULL,
        `file_path` VARCHAR(500) NULL,
        `file_size` INT NULL,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $isMultipart = (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false);
    
    if ($isMultipart) {
        $id = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
        $title = trim($_POST['title'] ?? '');
        $type = trim($_POST['type'] ?? 'file');
        $source = trim($_POST['source'] ?? '');
        $content = trim($_POST['content'] ?? '');
    } else {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['id']) && $data['id'] !== '' ? (int)$data['id'] : null;
        $title = trim($data['title'] ?? '');
        $type = trim($data['type'] ?? 'note');
        $source = trim($data['source'] ?? '');
        $content = trim($data['content'] ?? '');
    }

    $filePath = null;
    $fileSize = null;

    // 1. Handle File Upload if type is 'file'
    if ($type === 'file' && isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../uploads/knowledge/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $originalName = $_FILES['file']['name'];
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileSize = $_FILES['file']['size'];
        $fileExt = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        $newFileName = time() . '_' . preg_replace('/[^A-Za-z0-9\._-]/', '_', $originalName);
        $targetFile = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $targetFile)) {
            $filePath = 'uploads/knowledge/' . $newFileName;
            if (empty($title)) {
                $title = pathinfo($originalName, PATHINFO_FILENAME);
            }
            if (empty($source)) {
                $source = $originalName;
            }

            // Extract file text content if content was not manually provided
            if (empty($content)) {
                $extracted = extractTextFromFile($targetFile, $fileExt);
                $content = !empty($extracted) ? $extracted : "Uploaded Knowledge Document: {$originalName}\nFile size: {$fileSize} bytes.";
            }
        }
    }

    // 2. Handle Website URL scraping if type is 'url'
    if ($type === 'url' && !empty($source)) {
        if (empty($content) || strlen($content) < 50) {
            $scraped = scrapeWebsiteUrl($source);
            if (!empty($scraped)) {
                $content = $scraped;
            }
        }
        if (empty($title)) {
            $title = parse_url($source, PHP_URL_HOST) ?? $source;
        }
    }

    if (empty($title) || empty($content)) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and Content or valid File/URL are required']);
        exit;
    }

    if ($id) {
        $sql = "UPDATE `knowledge_base` SET `title` = :title, `type` = :type, `source` = :source, `content` = :content";
        $params = [
            ':title' => $title,
            ':type' => $type,
            ':source' => $source,
            ':content' => $content,
            ':id' => $id
        ];
        if ($filePath) {
            $sql .= ", `file_path` = :file_path, `file_size` = :file_size";
            $params[':file_path'] = $filePath;
            $params[':file_size'] = $fileSize;
        }
        $sql .= " WHERE `id` = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $message = "Knowledge item updated successfully";
    } else {
        $stmt = $pdo->prepare("INSERT INTO `knowledge_base` (`title`, `type`, `source`, `content`, `file_path`, `file_size`, `is_active`) VALUES (:title, :type, :source, :content, :file_path, :file_size, 1)");
        $stmt->execute([
            ':title' => $title,
            ':type' => $type,
            ':source' => $source,
            ':content' => $content,
            ':file_path' => $filePath,
            ':file_size' => $fileSize
        ]);
        $message = "Knowledge item created successfully";
    }

    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        'status' => 'success',
        'message' => $message
    ]);
} catch (Exception $e) {
    http_response_code(500);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Extract readable text from uploaded files
 */
function extractTextFromFile($filePath, $ext) {
    if (in_array($ext, ['txt', 'md', 'json', 'csv', 'log', 'html', 'xml', 'js', 'css'])) {
        $raw = @file_get_contents($filePath);
        if ($ext === 'html' || $ext === 'xml') {
            $raw = strip_tags(preg_replace('/<(script|style)\b[^>]*>(.*?)<\/\1>/is', '', $raw));
        }
        return preg_replace('/\s+/', ' ', trim($raw));
    }
    
    if ($ext === 'pdf') {
        $raw = @file_get_contents($filePath);
        if ($raw) {
            // Basic PDF text stream extractor
            preg_match_all('/(Tj|TJ|[\(\[]).*?[\)\]]/s', $raw, $matches);
            if (!empty($matches[0])) {
                $text = implode(' ', $matches[0]);
                $text = preg_replace('/[^\w\s\.,\-\?:;\(\)\!\/]/', '', $text);
                $text = preg_replace('/\s+/', ' ', $text);
                if (strlen(trim($text)) > 30) {
                    return trim($text);
                }
            }
        }
    }

    return null;
}

/**
 * Scrape readable text content & structured product cards (with images & prices) from a website URL
 */
function scrapeWebsiteUrl($url) {
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return null;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($html && $httpCode >= 200 && $httpCode < 400) {
        $docTitle = "";
        if (preg_match('/<title\b[^>]*>(.*?)<\/title>/is', $html, $tm)) {
            $docTitle = trim(html_entity_decode(strip_tags($tm[1])));
        }

        $metaDesc = "";
        if (preg_match('/<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']/is', $html, $mm)) {
            $metaDesc = trim(html_entity_decode($mm[1]));
        }

        // 1. Extract Structured Product Cards (Img URL, Product Title, Price, Link)
        $parsedProducts = [];
        $domain = parse_url($url, PHP_URL_SCHEME) . '://' . parse_url($url, PHP_URL_HOST);

        $card_pattern = '/<div[^>]*class=["\'][^"\']*product-card[^"\']*["\'][^>]*>.*?<a[^>]+href=["\']([^"\']+)["\'][^>]*>.*?<img[^>]+src=["\']([^"\']+)["\'][^>]*>.*?<h3[^>]*class=["\']title["\'][^>]*>(.*?)<\/h3>.*?<span[^>]*class=["\']new-price["\'][^>]*>(.*?)<\/span>/is';
        preg_match_all($card_pattern, $html, $matches, PREG_SET_ORDER);

        foreach ($matches as $m) {
            $linkRaw = trim($m[1]);
            $imgRaw = trim($m[2]);
            $titleClean = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($m[3]))));
            $priceClean = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($m[4]))));

            if (strlen($titleClean) >= 3 && !empty($priceClean)) {
                $fullLink = (strpos($linkRaw, 'http') === 0) ? $linkRaw : $domain . '/' . ltrim(str_replace('category/', '', $linkRaw), '/');
                $fullImg = (strpos($imgRaw, 'http') === 0) ? $imgRaw : $domain . '/' . ltrim(str_replace('category/', '', $imgRaw), './');

                $parsedProducts[] = "PRODUCT: {$titleClean} | PRICE: {$priceClean} | IMAGE: {$fullImg} | LINK: {$fullLink}";
            }
        }

        // Fallback card parser if no .product-card CSS class found
        if (empty($parsedProducts)) {
            preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>(?:(?!<img).)*?([A-Za-z0-9\s\-\(\)\.\/\:\#]{4,100})\s*(?:₹|Rs|INR)\s*([\d,]+)/is', $html, $cards, PREG_SET_ORDER);
            foreach ($cards as $c) {
                $imgRaw = trim($c[1]);
                $titleRaw = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($c[2]))));
                $priceRaw = trim($c[3]);

                if (strlen($titleRaw) >= 4 && !in_array(strtolower($titleRaw), ['logo', 'icon', 'banner', 'image', 'logo-img']) && !empty($priceRaw)) {
                    $fullImg = (strpos($imgRaw, 'http') === 0) ? $imgRaw : rtrim($domain, '/') . '/' . ltrim($imgRaw, './');
                    $parsedProducts[] = "PRODUCT: {$titleRaw} | PRICE: ₹{$priceRaw} | IMAGE: {$fullImg} | LINK: {$url}";
                }
            }
        }

        // 2. Format Body Text
        $cleanHtml = preg_replace('/<(script|style|head|footer|nav|svg|iframe)\b[^>]*>(.*?)<\/\1>/is', '', $html);
        $cleanHtml = preg_replace('/<h[1-6]\b[^>]*>(.*?)<\/h[1-6]>/is', "\n\n### $1\n", $cleanHtml);
        $cleanHtml = preg_replace('/<(p|li|tr|br|article|section)\b[^>]*>/is', "\n", $cleanHtml);

        $text = strip_tags($cleanHtml);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n\s*\n+/', "\n\n", $text);

        $result = "";
        if ($docTitle) $result .= "Page Title: {$docTitle}\n";
        if ($metaDesc) $result .= "Summary: {$metaDesc}\n\n";

        if (!empty($parsedProducts)) {
            $result .= "--- STRUCTURED SCRAPED PRODUCTS ---\n";
            $result .= implode("\n", array_slice($parsedProducts, 0, 100)) . "\n";
            $result .= "--- END STRUCTURED PRODUCTS ---\n\n";
        }

        $result .= trim($text);

        return trim(substr($result, 0, 30000));
    }

    return null;
}



