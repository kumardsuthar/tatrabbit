<?php
// backend/api/settings/theme.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'active_theme' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch();

    $activeTheme = $row ? $row['setting_value'] : 'default';

    echo json_encode([
        'active_theme' => $activeTheme,
        'success' => true
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $theme = trim($input['theme'] ?? $input['setting_value'] ?? '');

    $allowedThemes = ['default', 'diwali', 'navratri', 'holi', 'uttarayan', 'newyear'];

    if (empty($theme) || !in_array($theme, $allowedThemes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid theme selection. Allowed themes: ' . implode(', ', $allowedThemes)]);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('active_theme', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
    $stmt->execute([$theme, $theme]);

    echo json_encode([
        'message' => 'Theme updated successfully',
        'active_theme' => $theme,
        'success' => true
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
