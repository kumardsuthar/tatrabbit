<?php
// backend/api/reviews/upload.php
require_once __DIR__ . '/../../middleware/Cors.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Target Upload Directory for review media
$uploadDir = __DIR__ . '/../../uploads/reviews/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
    @chmod($uploadDir, 0777);
}

$allowedImages = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic'];
$allowedVideos = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'mkv'];
$allowedAll = array_merge($allowedImages, $allowedVideos);

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$isLive = (strpos($host, 'tatrabbit.com') !== false) || (!in_array($host, ['localhost', '127.0.0.1']) && strpos($host, 'localhost:') !== 0);

function formatMediaUrls($uniqueName, $host, $protocol, $isLive) {
    if ($isLive) {
        $relativePath = '/uploads/reviews/' . $uniqueName;
        $fullUrl = 'https://' . $host . $relativePath;
    } else {
        $relativePath = '/tatrabbit/avon-tattoo-store/backend/uploads/reviews/' . $uniqueName;
        $fullUrl = $protocol . '://' . $host . $relativePath;
    }
    return [$relativePath, $fullUrl];
}

// Function to handle saving a single uploaded file
function processUploadedFile($file, $uploadDir, $allowedImages, $allowedVideos, $allowedAll, $host, $protocol, $isLive) {
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'Upload error code: ' . ($file['error'] ?? 'NO_FILE')];
    }

    if ($file['size'] > 60 * 1024 * 1024) {
        return ['error' => 'File size exceeds maximum limit of 60MB'];
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (empty($extension)) {
        $extension = 'jpg';
    }

    if (!in_array($extension, $allowedAll)) {
        return ['error' => 'Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV'];
    }

    $isVideo = in_array($extension, $allowedVideos);
    $mediaType = $isVideo ? 'video' : 'image';

    $uniqueName = 'rev_' . ($isVideo ? 'vid_' : 'img_') . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $targetPath = $uploadDir . $uniqueName;

    $saved = move_uploaded_file($file['tmp_name'], $targetPath) || copy($file['tmp_name'], $targetPath);

    if (!$saved) {
        return ['error' => 'Failed to store uploaded file on server storage.'];
    }

    @chmod($targetPath, 0644);
    list($relativePath, $fullUrl) = formatMediaUrls($uniqueName, $host, $protocol, $isLive);

    return [
        'status' => 'success',
        'type' => $mediaType,
        'url' => $relativePath,
        'full_url' => $fullUrl,
        'filename' => $uniqueName,
        'name' => $file['name'],
        'size' => $file['size']
    ];
}

// Check if multiple files uploaded under 'files' or 'images'
$uploadedResults = [];

// 1. Check array upload
$arrayKey = null;
foreach (['files', 'images', 'photos'] as $key) {
    if (isset($_FILES[$key]) && is_array($_FILES[$key]['name'])) {
        $arrayKey = $key;
        break;
    }
}

if ($arrayKey) {
    $count = count($_FILES[$arrayKey]['name']);
    for ($i = 0; $i < $count; $i++) {
        $singleFile = [
            'name'     => $_FILES[$arrayKey]['name'][$i],
            'type'     => $_FILES[$arrayKey]['type'][$i],
            'tmp_name' => $_FILES[$arrayKey]['tmp_name'][$i],
            'error'    => $_FILES[$arrayKey]['error'][$i],
            'size'     => $_FILES[$arrayKey]['size'][$i]
        ];
        $res = processUploadedFile($singleFile, $uploadDir, $allowedImages, $allowedVideos, $allowedAll, $host, $protocol, $isLive);
        if (isset($res['status']) && $res['status'] === 'success') {
            $uploadedResults[] = $res;
        }
    }

    if (empty($uploadedResults)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid media files could be uploaded.']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'files'  => $uploadedResults
    ]);
    exit;
}

// 2. Check single file upload ('image', 'video', 'file', 'photo')
$singleKey = null;
foreach (['image', 'video', 'file', 'photo'] as $key) {
    if (isset($_FILES[$key]) && !is_array($_FILES[$key]['name'])) {
        $singleKey = $key;
        break;
    }
}

if ($singleKey) {
    $res = processUploadedFile($_FILES[$singleKey], $uploadDir, $allowedImages, $allowedVideos, $allowedAll, $host, $protocol, $isLive);
    if (isset($res['error'])) {
        http_response_code(400);
        echo json_encode($res);
        exit;
    }
    echo json_encode($res);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'No media file provided for upload.']);
