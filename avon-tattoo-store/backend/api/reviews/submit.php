<?php
// backend/api/reviews/submit.php
error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

// Safe check: only include migration file if it exists
if (file_exists(__DIR__ . '/../../migrate_review_media.php')) {
    @include_once __DIR__ . '/../../migrate_review_media.php';
    if (function_exists('runReviewMediaMigration')) {
        @runReviewMediaMigration();
    }
}

handleCors();

// Parse input (supports both JSON payload and multipart/form-data)
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
$isMultipart = (strpos($contentType, 'multipart/form-data') !== false) || !empty($_POST) || !empty($_FILES);

if ($isMultipart) {
    $data = $_POST;
} else {
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true) ?? [];
}

$product_id = intval($data['product_id'] ?? 0);
$product_title = trim($data['product_title'] ?? '');
$user_name = trim($data['user_name'] ?? '');
$user_email = trim($data['user_email'] ?? '');
$studio_name = trim($data['studio_name'] ?? '');
$title = trim($data['title'] ?? '');
$rating = intval($data['rating'] ?? 5);
$comment = trim($data['comment'] ?? '');

// By default, new reviews are NOT approved (is_approved = 0).
// They will not show on the live website until explicitly approved by admin in the moderation panel.
$approvalStatus = 0;

if ($rating < 1 || $rating > 5) {
    $rating = 5;
}

if (empty($user_name) || empty($comment)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and review feedback are required.']);
    exit;
}

try {
    $pdo = getDbConnection();

    // Verify product_id exists in products table (avoids foreign key failure)
    $validProductId = null;
    if ($product_id > 0) {
        $pCheck = $pdo->prepare("SELECT id FROM products WHERE id = ?");
        $pCheck->execute([$product_id]);
        if ($pCheck->fetch()) {
            $validProductId = $product_id;
        }
    }

    if (!$validProductId && !empty($product_title)) {
        $pStmt = $pdo->prepare("SELECT id FROM products WHERE title LIKE ? LIMIT 1");
        $pStmt->execute(["%" . $product_title . "%"]);
        $found = $pStmt->fetch();
        if ($found) {
            $validProductId = intval($found['id']);
        }
    }

    if (!$validProductId) {
        $firstP = $pdo->query("SELECT id FROM products ORDER BY id ASC LIMIT 1")->fetch();
        $validProductId = $firstP ? intval($firstP['id']) : 1;
    }

    // Process media: images and video
    $imagesList = [];

    // 1. From passed JSON or POST data
    if (isset($data['images'])) {
        if (is_array($data['images'])) {
            $imagesList = array_values(array_filter($data['images']));
        } elseif (is_string($data['images'])) {
            $decoded = json_decode($data['images'], true);
            if (is_array($decoded)) {
                $imagesList = array_values(array_filter($decoded));
            } elseif (!empty(trim($data['images']))) {
                $imagesList = [trim($data['images'])];
            }
        }
    }

    $video_url = trim($data['video_url'] ?? '');

    // 2. Direct file uploads in $_FILES if provided
    $uploadDir = __DIR__ . '/../../uploads/reviews/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
        @chmod($uploadDir, 0777);
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $isLive = (strpos($host, 'tatrabbit.com') !== false) || (!in_array($host, ['localhost', '127.0.0.1']) && strpos($host, 'localhost:') !== 0);

    // Check uploaded image files
    foreach (['images', 'photos', 'image'] as $imgKey) {
        if (isset($_FILES[$imgKey])) {
            $f = $_FILES[$imgKey];
            if (is_array($f['name'])) {
                for ($i = 0; $i < count($f['name']); $i++) {
                    if (isset($f['error'][$i]) && $f['error'][$i] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($f['name'][$i], PATHINFO_EXTENSION)) ?: 'jpg';
                        $uName = 'rev_img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                        $tPath = $uploadDir . $uName;
                        if (@move_uploaded_file($f['tmp_name'][$i], $tPath) || @copy($f['tmp_name'][$i], $tPath)) {
                            @chmod($tPath, 0644);
                            $relPath = $isLive ? ('/uploads/reviews/' . $uName) : ('/tatrabbit/avon-tattoo-store/backend/uploads/reviews/' . $uName);
                            $imagesList[] = $relPath;
                        }
                    }
                }
            } else {
                if ($f['error'] === UPLOAD_ERR_OK) {
                    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION)) ?: 'jpg';
                    $uName = 'rev_img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    $tPath = $uploadDir . $uName;
                    if (@move_uploaded_file($f['tmp_name'], $tPath) || @copy($f['tmp_name'], $tPath)) {
                        @chmod($tPath, 0644);
                        $relPath = $isLive ? ('/uploads/reviews/' . $uName) : ('/tatrabbit/avon-tattoo-store/backend/uploads/reviews/' . $uName);
                        $imagesList[] = $relPath;
                    }
                }
            }
        }
    }

    // Check uploaded video file
    if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
        $vf = $_FILES['video'];
        $ext = strtolower(pathinfo($vf['name'], PATHINFO_EXTENSION)) ?: 'mp4';
        $uName = 'rev_vid_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $tPath = $uploadDir . $uName;
        if (@move_uploaded_file($vf['tmp_name'], $tPath) || @copy($vf['tmp_name'], $tPath)) {
            @chmod($tPath, 0644);
            $video_url = $isLive ? ('/uploads/reviews/' . $uName) : ('/tatrabbit/avon-tattoo-store/backend/uploads/reviews/' . $uName);
        }
    }

    $imagesJson = !empty($imagesList) ? json_encode($imagesList, JSON_UNESCAPED_SLASHES) : null;
    $approvalStatus = 0; // Always 0 (Hidden from Site until Admin approves)

    // Check existing columns in product_reviews table dynamically to avoid any syntax / missing column errors
    $tableCols = [];
    try {
        $desc = $pdo->query("DESCRIBE `product_reviews`")->fetchAll(PDO::FETCH_COLUMN);
        $tableCols = array_map('strtolower', $desc ?: []);
    } catch (Exception $e) {}

    // Auto-add columns if missing
    if (!in_array('images', $tableCols)) {
        try { $pdo->exec("ALTER TABLE `product_reviews` ADD `images` TEXT NULL AFTER `comment`"); $tableCols[] = 'images'; } catch (Exception $e) {}
    }
    if (!in_array('video_url', $tableCols)) {
        try { $pdo->exec("ALTER TABLE `product_reviews` ADD `video_url` VARCHAR(500) NULL AFTER `images`"); $tableCols[] = 'video_url'; } catch (Exception $e) {}
    }
    if (!in_array('studio_name', $tableCols)) {
        try { $pdo->exec("ALTER TABLE `product_reviews` ADD `studio_name` VARCHAR(150) NULL AFTER `user_name`"); $tableCols[] = 'studio_name'; } catch (Exception $e) {}
    }

    // Build dynamic insert matching actual database columns
    $fields = ['product_id', 'user_name', 'rating', 'comment', 'is_approved'];
    $values = [':pid' => $validProductId, ':uname' => $user_name, ':rating' => $rating, ':comment' => $comment, ':approved' => 0];

    if (in_array('user_email', $tableCols)) {
        $fields[] = 'user_email';
        $values[':uemail'] = $user_email ?: null;
    }
    if (in_array('title', $tableCols)) {
        $fields[] = 'title';
        $values[':title'] = $title ?: null;
    }
    if (in_array('studio_name', $tableCols)) {
        $fields[] = 'studio_name';
        $values[':sname'] = $studio_name ?: null;
    }
    if (in_array('images', $tableCols)) {
        $fields[] = 'images';
        $values[':images'] = $imagesJson;
    }
    if (in_array('video_url', $tableCols)) {
        $fields[] = 'video_url';
        $values[':vurl'] = $video_url ?: null;
    }

    $fieldList = '`' . implode('`, `', $fields) . '`';
    $paramList = implode(', ', array_keys($values));

    $stmt = $pdo->prepare("INSERT INTO `product_reviews` ($fieldList) VALUES ($paramList)");
    $stmt->execute($values);

    $insertedId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you! Your testimonial has been submitted and will appear on the website after admin approval.',
        'review_id' => $insertedId,
        'images' => $imagesList,
        'video_url' => $video_url
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
}
