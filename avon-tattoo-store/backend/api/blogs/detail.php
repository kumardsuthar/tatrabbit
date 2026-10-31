<?php
// backend/api/blogs/detail.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$identifier = $_GET['slug'] ?? $_GET['id'] ?? null;

if (!$identifier) {
    http_response_code(400);
    echo json_encode(['error' => 'Blog slug or ID is required']);
    exit;
}

try {
    $pdo = getDbConnection();
    
    // First attempt to find by slug or ID with is_published = 1
    $stmt = $pdo->prepare("SELECT * FROM `blogs` WHERE (`slug` = :slug OR `id` = :id) AND `is_published` = 1 LIMIT 1");
    $stmt->execute([':slug' => $identifier, ':id' => $identifier]);
    $blog = $stmt->fetch();

    if (!$blog) {
        // Fallback: check without is_published filter (useful for admin preview or drafts)
        $stmtAll = $pdo->prepare("SELECT * FROM `blogs` WHERE `slug` = :slug OR `id` = :id LIMIT 1");
        $stmtAll->execute([':slug' => $identifier, ':id' => $identifier]);
        $blog = $stmtAll->fetch();
    }

    if (!$blog) {
        http_response_code(404);
        echo json_encode(['error' => 'Blog article not found']);
        exit;
    }

    // Fetch related / recent articles
    $relatedStmt = $pdo->prepare("SELECT id, title, slug, category, excerpt, image_url, author, read_time, created_at FROM `blogs` WHERE `id` != :id AND `is_published` = 1 ORDER BY `created_at` DESC LIMIT 3");
    $relatedStmt->execute([':id' => $blog['id']]);
    $relatedBlogs = $relatedStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'blog' => $blog,
        'related_blogs' => $relatedBlogs
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
