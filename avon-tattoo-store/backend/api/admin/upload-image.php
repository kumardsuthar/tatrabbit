<?php
// backend/api/admin/upload-image.php
require_once __DIR__ . '/../../middleware/Cors.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$fileKey = isset($_FILES['image']) ? 'image' : (isset($_FILES['file']) ? 'file' : null);

if (!$fileKey || !isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES[$fileKey]['error'] ?? 'NO_FILE';
    http_response_code(400);
    echo json_encode(['error' => 'No image file uploaded or upload error code: ' . $errCode]);
    exit;
}

$file = $_FILES[$fileKey];

// Validate File Size (Max 60MB for images & videos)
if ($file['size'] > 60 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds maximum limit of 60MB']);
    exit;
}

// Validate Extension
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (empty($extension)) {
    $extension = 'png';
}

$allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'm4v', 'ogv'];
if (!in_array($extension, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF, SVG, MP4, WEBM, MOV']);
    exit;
}

// Target Upload Directory
$uploadDir = __DIR__ . '/../../uploads/products/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
    chmod($uploadDir, 0777);
}

// Generate unique filename
$uniqueName = 'prod_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
$targetPath = $uploadDir . $uniqueName;

// Move uploaded file to uploads directory
$success = move_uploaded_file($file['tmp_name'], $targetPath) || copy($file['tmp_name'], $targetPath);

if ($success) {
    chmod($targetPath, 0644);
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // Determine accessible web path dynamically
    // On live production (tatrabbit.com or live host), uploads are at /uploads/products/
    $isLive = (strpos($host, 'tatrabbit.com') !== false) || (!in_array($host, ['localhost', '127.0.0.1']) && strpos($host, 'localhost:') !== 0);

    if ($isLive) {
        $relativePath = '/uploads/products/' . $uniqueName;
        $fullUrl = 'https://' . $host . $relativePath;
    } else {
        // Local XAMPP development path
        $relativePath = '/tatrabbit/avon-tattoo-store/backend/uploads/products/' . $uniqueName;
        $fullUrl = $protocol . '://' . $host . $relativePath;
    }

    echo json_encode([
        'status' => 'success',
        'url' => $relativePath,
        'full_url' => $fullUrl,
        'filename' => $uniqueName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to store uploaded file on server storage. Please check directory write permissions.']);
}
