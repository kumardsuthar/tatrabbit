<?php
// backend/api/admin/blog-save.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$title = trim($data['title'] ?? '');
$excerpt = trim($data['excerpt'] ?? '');
$content = trim($data['content'] ?? '');
$category = trim($data['category'] ?? 'Equipment Masterclass');
$author = trim($data['author'] ?? 'TatRabbit Master Studio');
$image_url = trim($data['image_url'] ?? '');
$read_time = trim($data['read_time'] ?? '5 min read');

if (empty($title) || empty($content)) {
    http_response_code(400);
    echo json_encode(['error' => 'Title and Content are required']);
    exit;
}

$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
if (empty($slug)) {
    $slug = 'blog-' . time();
}

if (empty($excerpt)) {
    $plain = trim(strip_tags($content));
    $excerpt = mb_substr($plain, 0, 160) . (mb_strlen($plain) > 160 ? '...' : '');
}

try {
    $pdo = getDbConnection();

    // Ensure unique slug
    $baseSlug = $slug;
    $counter = 1;
    while (true) {
        $checkStmt = $pdo->prepare("SELECT id FROM `blogs` WHERE `slug` = :slug " . ($id ? "AND `id` != :id" : ""));
        $params = [':slug' => $slug];
        if ($id) $params[':id'] = $id;
        $checkStmt->execute($params);
        if (!$checkStmt->fetch()) {
            break;
        }
        $slug = $baseSlug . '-' . (++$counter);
    }

    if ($id) {
        $stmt = $pdo->prepare("UPDATE `blogs` SET `title` = :title, `slug` = :slug, `excerpt` = :excerpt, `content` = :content, `category` = :category, `author` = :author, `image_url` = :img, `read_time` = :rtime WHERE `id` = :id");
        $stmt->execute([
            ':title' => $title,
            ':slug' => $slug,
            ':excerpt' => $excerpt,
            ':content' => $content,
            ':category' => $category,
            ':author' => $author,
            ':img' => $image_url,
            ':rtime' => $read_time,
            ':id' => $id
        ]);
        $message = 'Blog post updated successfully';
    } else {
        $stmt = $pdo->prepare("INSERT INTO `blogs` (`title`, `slug`, `excerpt`, `content`, `category`, `author`, `image_url`, `read_time`, `is_published`) VALUES (:title, :slug, :excerpt, :content, :category, :author, :img, :rtime, 1)");
        $stmt->execute([
            ':title' => $title,
            ':slug' => $slug,
            ':excerpt' => $excerpt,
            ':content' => $content,
            ':category' => $category,
            ':author' => $author,
            ':img' => $image_url,
            ':rtime' => $read_time
        ]);
        $message = 'Blog post created successfully';
    }

    echo json_encode([
        'status' => 'success',
        'message' => $message
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
