<?php
// backend/api/reviews/create.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$db = getDbConnection();
$input = json_decode(file_get_contents('php://input'), true);

$productId = isset($input['product_id']) ? intval($input['product_id']) : 0;
$userName = trim($input['user_name'] ?? '');
$userEmail = trim($input['user_email'] ?? '');
$rating = isset($input['rating']) ? intval($input['rating']) : 5;
$title = trim($input['title'] ?? '');
$comment = trim($input['comment'] ?? '');
$studioName = trim($input['studio_name'] ?? '');
$images = isset($input['images']) ? (is_array($input['images']) ? json_encode(array_values(array_filter($input['images'])), JSON_UNESCAPED_SLASHES) : trim($input['images'])) : null;
$videoUrl = trim($input['video_url'] ?? '') ?: null;

if (!$productId || !$userName || !$comment) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID, Name, and Review Comment are required fields.']);
    exit;
}

if ($rating < 1 || $rating > 5) {
    $rating = 5;
}

// Verify product exists
$checkStmt = $db->prepare("SELECT id FROM products WHERE id = ?");
$checkStmt->execute([$productId]);
if (!$checkStmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Product not found.']);
    exit;
}

// Insert review (default is_approved = 0 pending admin approval)
$stmt = $db->prepare("INSERT INTO product_reviews (product_id, user_name, user_email, studio_name, rating, title, comment, images, video_url, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)");
$success = $stmt->execute([$productId, $userName, $userEmail, $studioName ?: null, $rating, $title, $comment, $images, $videoUrl]);

if ($success) {
    $reviewId = $db->lastInsertId();
    $fetchStmt = $db->prepare("SELECT * FROM product_reviews WHERE id = ?");
    $fetchStmt->execute([$reviewId]);
    $newReview = $fetchStmt->fetch();

    echo json_encode([
        'message' => 'Thank you! Your product review has been submitted and will be published after admin approval.',
        'review' => $newReview
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit review. Please try again.']);
}
