<?php
// backend/api/auth/register.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? '');

if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email and password are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address format']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters long']);
    exit;
}

$db = getDbConnection();

// Check if email already exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'An account with this email address already exists']);
    exit;
}

// Hash password with PASSWORD_BCRYPT / Argon2id
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insert user
$stmt = $db->prepare("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'customer')");
$stmt->execute([$name, $email, $hashedPassword, $phone]);

$userId = $db->lastInsertId();

$user = [
    'id' => $userId,
    'name' => $name,
    'email' => $email,
    'role' => 'customer'
];

$token = generateJwt($user);

echo json_encode([
    'message' => 'Account created successfully',
    'token' => $token,
    'user' => $user
]);
